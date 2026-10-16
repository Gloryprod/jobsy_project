<?php

namespace App\Services;

use App\Exceptions\WalletException;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\MissionOffers;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Tous les mouvements d'argent passent par ici.
 * Règles : verrou de ligne (lockForUpdate) sur chaque wallet modifié, montants calculés côté serveur,
 * solde disponible = balance - balance_locked, opérations idempotentes quand elles peuvent être rejouées.
 */
class WalletService
{
    public const COMMISSION_RATE = 0.10;

    /**
     * 1. CRÉATION AUTOMATIQUE DU WALLET
     * Utilisé lors de l'inscription d'un candidat ou d'une entreprise.
     */
    public function createWallet(int $id, string $type)
    {
        return Wallet::create([
            ($type === 'candidat' ? 'candidat_id' : 'entreprise_id') => $id,
            'balance' => 0,
            'balance_locked' => 0,
            'currency' => 'XOF'
        ]);
    }

    /**
     * 2. DÉPÔT D'ARGENT (CASH-IN)
     * Crédite le compte après un paiement KkiaPay vérifié.
     */
    public function deposit(Wallet $wallet, float $amount, array $meta = []): Transaction
    {
        return DB::transaction(function () use ($wallet, $amount, $meta) {
            $wallet = Wallet::whereKey($wallet->id)->lockForUpdate()->firstOrFail();
            $wallet->increment('balance', $amount);

            return $wallet->transactions()->create([
                'amount' => $amount,
                'type' => 'deposit',
                'status' => 'completed',
                'reference' => 'DEP-' . strtoupper(Str::random(10)),
                'metadata' => $meta
            ]);
        });
    }

    /**
     * 3. SÉQUESTRE / BLOCAGE (ESCROW)
     * Bloque la récompense de la mission sur le wallet de l'entreprise.
     * Le montant vient toujours de la mission, jamais du client. Un second appel pour la même offre ne bloque rien de plus.
     */
    public function lockFundsForMission(Wallet $wallet, MissionOffers $offer, float $commissionRate = self::COMMISSION_RATE): Transaction
    {
        $gross = (int) round($offer->application->mission->reward);

        if ($gross <= 0) {
            throw new WalletException("Le montant de la mission est invalide.");
        }

        return DB::transaction(function () use ($wallet, $offer, $gross, $commissionRate) {
            $wallet = Wallet::whereKey($wallet->id)->lockForUpdate()->firstOrFail();

            if ($existing = $this->escrowFor($offer)) {
                return $existing;
            }

            if ($wallet->balance - $wallet->balance_locked < $gross) {
                throw new WalletException("Solde disponible insuffisant pour garantir cette mission.");
            }

            $wallet->increment('balance_locked', $gross);

            $commission = (int) round($gross * $commissionRate);
            $candidatWallet = Wallet::firstOrCreate(
                ['candidat_id' => $offer->application->candidat_id],
                ['balance' => 0, 'balance_locked' => 0, 'currency' => 'XOF']
            );

            $escrow = $candidatWallet->transactions()->create([
                'amount' => $gross - $commission,
                'type' => 'transfer',
                'status' => 'pending',
                'reference' => 'ESC-' . strtoupper(Str::random(10)),
                'metadata' => [
                    'offer_id' => $offer->id,
                    'mission_id' => $offer->application->mission_id,
                    'mission_name' => $offer->application->mission->title,
                    'role' => 'receiver',
                    'gross_amount' => $gross,
                    'commission_deducted' => $commission,
                    'locked_on_wallet_id' => $wallet->id,
                ]
            ]);

            $offer->update(['payment_status' => 'locked']);

            return $escrow;
        });
    }

    /**
     * 4. PAIEMENT FINAL ET COMMISSION
     * Libère le séquestre : débite l'entreprise du montant bloqué, crédite le candidat du net et Jobsy de la commission.
     * Refuse de payer si aucun séquestre n'a été constitué pour cette offre.
     */
    public function processFinalPayment(MissionOffers $offer): void
    {
        DB::transaction(function () use ($offer) {
            $escrow = $this->escrowFor($offer, lock: true);

            if (!$escrow || $escrow->status !== 'pending') {
                throw new WalletException("Les fonds de cette mission n'ont pas été bloqués : impossible de payer le candidat.");
            }

            $net = (float) $escrow->amount;
            $commission = (float) ($escrow->metadata['commission_deducted'] ?? 0);
            $gross = (float) ($escrow->metadata['gross_amount'] ?? $net + $commission);

            $entrepriseWallet = Wallet::where('entreprise_id', $offer->application->mission->entreprise_id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($entrepriseWallet->balance_locked < $gross || $entrepriseWallet->balance < $gross) {
                throw new WalletException("Le séquestre de l'entreprise est incohérent : paiement bloqué, contactez le support.");
            }

            // A. Débit Entreprise (on débloque et on retire)
            $entrepriseWallet->decrement('balance_locked', $gross);
            $entrepriseWallet->decrement('balance', $gross);

            $entrepriseWallet->transactions()->create([
                'amount' => -$gross,
                'type' => 'transfer',
                'status' => 'completed',
                'reference' => 'PAY-' . strtoupper(Str::random(10)),
                'metadata' => ['offer_id' => $offer->id, 'mission_id' => $offer->application->mission_id, 'role' => 'sender']
            ]);

            // B. Crédit Candidat (Montant Net)
            Wallet::whereKey($escrow->wallet_id)->lockForUpdate()->firstOrFail()->increment('balance', $net);
            $escrow->update(['status' => 'completed']);

            // C. Commission Jobsy
            $adminWallet = $this->adminWallet();
            $adminWallet->increment('balance', $commission);

            $adminWallet->transactions()->create([
                'amount' => $commission,
                'type' => 'fee',
                'status' => 'completed',
                'reference' => 'COM-' . strtoupper(Str::random(10)),
                'metadata' => ['offer_id' => $offer->id, 'from_entreprise' => $offer->application->mission->entreprise_id]
            ]);

            $offer->update(['status' => 'completed', 'paid_at' => now(), 'payment_status' => 'paid']);
        });
    }

    /**
     * 4 bis. LIBÉRATION DU SÉQUESTRE (mission annulée avant paiement : candidat refusé après onboarding...)
     * Les fonds bloqués redeviennent disponibles pour l'entreprise. Sans effet si rien n'est bloqué ou déjà libéré.
     */
    public function releaseEscrow(MissionOffers $offer): bool
    {
        return DB::transaction(function () use ($offer) {
            $escrow = $this->escrowFor($offer, lock: true);

            if (!$escrow || $escrow->status !== 'pending') {
                return false;
            }

            $gross = (float) ($escrow->metadata['gross_amount'] ?? $escrow->amount + ($escrow->metadata['commission_deducted'] ?? 0));
            $walletId = $escrow->metadata['locked_on_wallet_id'] ?? null;

            $entrepriseWallet = ($walletId
                ? Wallet::whereKey($walletId)
                : Wallet::where('entreprise_id', $offer->application->mission->entreprise_id)
            )->lockForUpdate()->firstOrFail();

            $entrepriseWallet->decrement('balance_locked', min($gross, $entrepriseWallet->balance_locked));
            $escrow->update(['status' => 'cancelled']);
            $offer->update(['payment_status' => 'released']);

            return true;
        });
    }

    /**
     * 5. RETRAIT D'ARGENT (CASH-OUT)
     * Réserve le montant sur le wallet du candidat ; le virement Mobile Money est déclenché par un admin.
     */
    public function requestWithdrawal(Wallet $wallet, float $amount, array $meta = []): Transaction
    {
        return DB::transaction(function () use ($wallet, $amount, $meta) {
            $wallet = Wallet::whereKey($wallet->id)->lockForUpdate()->firstOrFail();

            if ($wallet->balance - $wallet->balance_locked < $amount) {
                throw new WalletException("Ton coffre ne contient pas assez d'or pour ce retrait.");
            }

            $wallet->decrement('balance', $amount);

            return $wallet->transactions()->create([
                'amount' => -$amount, // Toujours négatif pour un retrait
                'type' => 'withdrawal',
                'status' => 'pending', // completed après le virement Mobile Money
                'reference' => 'WDL-' . strtoupper(Str::random(12)),
                'metadata' => $meta,
            ]);
        });
    }

    /**
     * Fait passer un retrait d'un statut à un autre, une seule fois (protège du double clic et du rejeu).
     */
    public function transitionWithdrawal(Transaction $transaction, string $from, string $to, array $meta = []): bool
    {
        return DB::transaction(function () use ($transaction, $from, $to, $meta) {
            $tx = Transaction::whereKey($transaction->id)->lockForUpdate()->firstOrFail();

            if ($tx->type !== 'withdrawal' || $tx->status !== $from) {
                return false;
            }

            $tx->update(['status' => $to, 'metadata' => array_merge($tx->metadata ?? [], $meta)]);

            return true;
        });
    }

    /**
     * Échec d'un retrait : statut « failed » et restitution des fonds, une seule fois.
     */
    public function failWithdrawal(Transaction $transaction, array $fromStatuses, array $meta = []): bool
    {
        return DB::transaction(function () use ($transaction, $fromStatuses, $meta) {
            $tx = Transaction::whereKey($transaction->id)->lockForUpdate()->firstOrFail();

            if ($tx->type !== 'withdrawal' || !in_array($tx->status, $fromStatuses, true)) {
                return false;
            }

            $tx->update(['status' => 'failed', 'metadata' => array_merge($tx->metadata ?? [], $meta)]);
            Wallet::whereKey($tx->wallet_id)->lockForUpdate()->firstOrFail()->increment('balance', abs($tx->amount));

            return true;
        });
    }

    /**
     * Transaction de séquestre (côté candidat) d'une offre, si elle existe.
     */
    private function escrowFor(MissionOffers $offer, bool $lock = false): ?Transaction
    {
        $query = Transaction::where('type', 'transfer')
            ->where('metadata->offer_id', $offer->id)
            ->where('metadata->role', 'receiver')
            ->whereIn('status', ['pending', 'completed']);

        if ($lock) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    private function adminWallet(): Wallet
    {
        $wallet = Wallet::where('is_admin', true)->lockForUpdate()->first();

        return $wallet ?? Wallet::create(['is_admin' => true, 'balance' => 0, 'balance_locked' => 0, 'currency' => 'XOF']);
    }
}
