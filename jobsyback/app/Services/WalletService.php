<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\MissionOffers;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class WalletService
{
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
     * Crédite le compte après un paiement réussi via FedaPay/KkiaPay.
     */
    public function deposit(Wallet $wallet, float $amount, array $meta = [])
    {
        return DB::transaction(function () use ($wallet, $amount, $meta) {
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
     * Verrouille l'argent de l'entreprise dès qu'une mission est acceptée.
     */
    public function lockFundsForMission(Wallet $wallet, float $amount, MissionOffers $offer)
    {
        if ($wallet->balance < $amount) {
            throw new Exception("Solde insuffisant pour garantir cette mission.");
        }

        return DB::transaction(function () use ($wallet, $amount, $offer) {
            // On augmente la part "bloquée" du solde total
            $wallet->increment('balance_locked', $amount);
            $commission = $amount * 0.10;
            $netAmount = $amount - $commission;
            $candidatWallet = Wallet::where('candidat_id', $offer->application->candidat_id)->firstOrFail();
            $candidatWallet->transactions()->create([
                'amount' => $netAmount,
                'type' => 'transfer',
                'status' => 'pending',
                'reference' => 'ESC-' . strtoupper(Str::random(10)),
                'metadata' => ['offer_id' => $offer->id, 'mission_id' => $offer->application->mission_id, 'role' => 'receiver', 'commission_deducted' => $commission]
            ]);
            return true;
        });
    }

    /**
     * 4. PAIEMENT FINAL ET COMMISSION
     * Débloque l'argent de l'entreprise, prélève la commission Jobsy, 
     * et crédite le candidat.
     */
    public function processFinalPayment(MissionOffers $offer, float $commissionRate = 0.10)
    {
        return DB::transaction(function () use ($offer, $commissionRate) {
            $totalAmount = $offer->application->mission->reward;
            $commission = $totalAmount * $commissionRate;
            $netAmount = $totalAmount - $commission;

            $entrepriseWallet = Wallet::where('entreprise_id', $offer->application->mission->entreprise_id)->firstOrFail();
            $candidatWallet = Wallet::where('candidat_id', $offer->application->candidat_id)->firstOrFail();
            $adminWallet = Wallet::where('is_admin', true)->first(); 

            // Crédit de la commission
            $adminWallet->increment('balance', $commission);

            $adminWallet->transactions()->create([
                'amount' => $commission,
                'type' => 'fee',
                'status' => 'completed',
                'reference' => 'COM-' . strtoupper(Str::random(10)),
                'metadata' => ['offer_id' => $offer->id, 'from_entreprise' => $offer->application->mission->entreprise_id]
            ]);

            // A. Déduction Entreprise (on débloque et on retire)
            $entrepriseWallet->decrement('balance_locked', $totalAmount);
            $entrepriseWallet->decrement('balance', $totalAmount);
            
            $entrepriseWallet->transactions()->create([
                'amount' => -$totalAmount,
                'type' => 'transfer',
                'status' => 'completed',
                'reference' => 'PAY-' . strtoupper(Str::random(10)),
                'metadata' => ['mission_id' => $offer->application->mission_id, 'role' => 'sender']
            ]);

            // B. Crédit Candidat (Montant Net)
            $candidatWallet->increment('balance', $netAmount);

            $transaction = Transaction::where('wallet_id', $candidatWallet->id)
                ->where('type', 'transfer')
                ->where('status', 'pending')
                ->where('metadata->mission_id', $offer->application->mission_id) // Syntaxe Laravel pour le JSON
                ->first();  

            $transaction->update([
                'amount' => $netAmount,
                'type' => 'transfer',
                'status' => 'completed',
                'metadata' => ['offer_id' => $offer->id,'mission_id' => $offer->application->mission_id, 'role' => 'receiver', 'commission_deducted' => $commission]
            ]);

            return $offer->update(['status' => 'completed', 'paid_at' => now()]);
        });
    }

    /**
     * 5. RETRAIT D'ARGENT (CASH-OUT)
     * Pour que le candidat récupère son argent vers Mobile Money.
     */
    public function withdraw(Wallet $wallet, float $amount)
    {
        if ($wallet->balance < $amount) {
            throw new Exception("Fonds insuffisants pour le retrait.");
        }

        return DB::transaction(function () use ($wallet, $amount) {
            $wallet->decrement('balance', $amount);

            return $wallet->transactions()->create([
                'amount' => -$amount,
                'type' => 'withdrawal',
                'status' => 'pending', // Sera 'completed' après succès API Mobile Money
                'reference' => 'WTH-' . strtoupper(Str::random(10))
            ]);
        });
    }
}