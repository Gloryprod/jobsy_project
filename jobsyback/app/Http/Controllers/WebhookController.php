<?php

namespace App\Http\Controllers;

use App\Exceptions\WalletException;
use App\Http\Controllers\Controller;
use App\Models\PaymentIntent;
use App\Models\Transaction;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Services\WalletService;
use App\Services\KkiapayService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    protected WalletService $walletService;
    protected KkiapayService $kkiaPayService;

    public function __construct(WalletService $walletService, KkiapayService $kkiaPayService)
    {
        $this->walletService = $walletService;
        $this->kkiaPayService = $kkiaPayService;
    }

    /**
     * Paiement KkiaPay (financement de mission ou recharge de wallet).
     * Rien n'est cru sur parole : l'intention est retrouvée par son uuid, la transaction est revérifiée
     * auprès de KkiaPay (statut ET montant), et une transaction KkiaPay ne peut créditer qu'une seule fois.
     * Les cas ignorés répondent 200 pour que KkiaPay ne réessaie pas indéfiniment.
     */
    public function handleKkiaPay(Request $request)
    {
        if ($this->kkiaPayService->hasWebhookSecret() && !$this->kkiaPayService->webhookSecretMatches($request)) {
            Log::warning('Webhook KkiaPay rejeté : secret invalide.', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Signature invalide'], 401);
        }

        $transactionId = (string) $request->input('transactionId', '');
        $stateData = json_decode((string) $request->input('stateData', ''), true);
        $intentUuid = is_array($stateData) ? ($stateData['intent'] ?? null) : null;

        if ($transactionId === '' || !is_string($intentUuid)) {
            return response()->json(['message' => 'Événement ignoré'], 200);
        }

        $intent = PaymentIntent::where('uuid', $intentUuid)->first();

        if (!$intent) {
            Log::warning("Webhook KkiaPay : intention inconnue", ['transaction' => $transactionId]);
            return response()->json(['message' => 'Intention inconnue'], 200);
        }

        if ($intent->status === 'paid') {
            return response()->json(['message' => 'Déjà traité'], 200);
        }

        $tx = $this->kkiaPayService->fetchTransaction($transactionId);

        // Si KkiaPay renvoie les données attachées au paiement, elles doivent désigner la même intention
        $apiState = $tx['state'] ?? null;
        $apiState = is_string($apiState) ? json_decode($apiState, true) : $apiState;
        $sameIntent = !is_array($apiState) || !isset($apiState['intent']) || $apiState['intent'] === $intent->uuid;

        if (!$tx || ($tx['status'] ?? null) !== 'SUCCESS' || (float) ($tx['amount'] ?? 0) < $intent->amount || !$sameIntent) {
            Log::warning("Webhook KkiaPay : transaction non confirmée par l'API", [
                'transaction' => $transactionId,
                'intent' => $intent->uuid,
            ]);
            return response()->json(['message' => 'Transaction non confirmée'], 200);
        }

        // 1. Crédit du wallet, une seule fois par intention et par transaction KkiaPay
        $wallet = DB::transaction(function () use ($intent, $transactionId) {
            $intent = PaymentIntent::whereKey($intent->id)->lockForUpdate()->firstOrFail();

            if ($intent->status === 'paid' || PaymentIntent::where('provider_transaction_id', $transactionId)->exists()) {
                return null; // rejeu : aucun effet
            }

            $intent->update([
                'status' => 'paid',
                'provider_transaction_id' => $transactionId,
                'paid_at' => now(),
            ]);

            $wallet = Wallet::firstOrCreate(
                ['entreprise_id' => $intent->entreprise_id],
                ['balance' => 0, 'balance_locked' => 0, 'currency' => 'XOF']
            );

            $this->walletService->deposit($wallet, $intent->amount, [
                'gateway' => 'kkiapay',
                'transaction_id' => $transactionId,
                'intent' => $intent->uuid,
                'type' => $intent->purpose,
            ]);

            return $wallet;
        });

        // 2. Séquestre pour le candidat. En cas d'échec, le dépôt reste acquis sur le wallet de l'entreprise.
        if ($wallet && $intent->purpose === PaymentIntent::PURPOSE_MISSION_FUNDING && $intent->missionOffer) {
            try {
                $this->walletService->lockFundsForMission($wallet, $intent->missionOffer);
            } catch (WalletException $e) {
                Log::error("Webhook KkiaPay : séquestre impossible pour l'intention {$intent->uuid} : " . $e->getMessage());
            }
        }

        Log::info("Webhook KkiaPay traité", ['transaction' => $transactionId, 'intent' => $intent->uuid]);
        return response()->json(['message' => 'Transaction traitée avec succès.'], 200);
    }

    /**
     * Recharge de wallet : même traitement, l'intention indique déjà la nature du paiement.
     */
    public function depositWebhook(Request $request)
    {
        return $this->handleKkiaPay($request);
    }

    /**
     * Retour de KkiaPay sur un virement Mobile Money.
     * Ce webhook ne peut pas être revérifié par API : le secret est obligatoire (hors local/tests).
     */
    public function handleKkiaPayPayouts(Request $request)
    {
        $trusted = $this->kkiaPayService->hasWebhookSecret()
            ? $this->kkiaPayService->webhookSecretMatches($request)
            : app()->environment('local', 'testing');

        if (!$trusted) {
            Log::warning('Webhook de virement KkiaPay rejeté : secret absent ou invalide.', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Signature invalide'], 401);
        }

        $reference = (string) $request->input('transactionId', '');
        $status = $request->input('status'); // SUCCESSFUL ou FAILED

        $transaction = $reference === ''
            ? null
            : Transaction::where('type', 'withdrawal')->where('metadata->reference_externe', $reference)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction introuvable'], 200);
        }

        // Si le virement a échoué chez l'opérateur (MTN/Moov) : fonds restitués une seule fois
        if ($status === 'FAILED') {
            if ($this->walletService->failWithdrawal($transaction, ['processing', 'completed'], ['payout_failed_at' => now()->toIso8601String()])) {
                Log::warning("Retrait échoué pour {$transaction->id}. Fonds restitués au candidat.");
            }

            return response()->json(['message' => 'Statut mis à jour.']);
        }

        if ($status === 'SUCCESSFUL') {
            $this->walletService->transitionWithdrawal($transaction, 'processing', 'completed');
        }

        return response()->json(['message' => 'Événement traité']);
    }
}
