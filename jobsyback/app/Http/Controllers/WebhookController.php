<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\MissionOffers;
use App\Models\Transaction;
use Illuminate\Http\Request;
use App\Services\WalletService;
use App\Services\KkiapayService;
use App\Models\Wallet;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WebhookController extends Controller
{
    protected $walletService;
    protected $kkiaPayService       ;

    public function __construct(WalletService $walletService, KkiapayService $kkiaPayService)
    {
        $this->walletService = $walletService;
        $this->kkiaPayService = $kkiaPayService;
    }

    public function handleFedaPay(Request $request)
    {           
        // 1. Récupérer les données envoyées par FedaPay
        $event = $request->input('event');
        $data = $request->input('data');

        // Log pour le debug (Indispensable au début !)
        Log::info('Webhook FedaPay reçu', ['event' => $event]);

        // 2. On ne traite que les transactions approuvées
        if ($event === 'transaction.approved') {
            
            // On récupère l'entreprise_id que tu auras envoyé à FedaPay lors du paiement
            $entrepriseId = $data['custom_metadata']['entreprise_id'] ?? null;
            $amount = $data['amount'];
            $reference = $data['reference'];

            if ($entrepriseId) {
                $wallet = Wallet::where('entreprise_id', $entrepriseId)->first();

                if ($wallet) {
                    // 3. Utiliser notre WalletService pour créditer le compte
                    $this->walletService->deposit($wallet, $amount, [
                        'gateway' => 'fedapay',
                        'transaction_ref' => $reference,
                        'full_payload' => $data
                    ]);

                    return response()->json(['status' => 'success', 'message' => 'Wallet crédité']);
                }
            }
        }

        return response()->json(['status' => 'ignored'], 200);
    }

    public function handleKkiaPay(Request $request)
    {
        $data = $request->all();
        Log::info('Données Webhook reçues :', $data);

        $transactionId = $data['transactionId'];
        
        // IMPORTANT : KkiaPay envoie les infos personnalisées dans 'stateData' sous forme de STRING JSON
        $stateData = json_decode($data['stateData'], true);
        $entrepriseId = $stateData['entreprise_id'] ?? null;
        $offerId = $stateData['offer_id'] ?? null;

        // 1. Vérification de sécurité
        // En Sandbox, si l'API de vérification renvoie 404, on peut se fier au flag 'isPaymentSucces' 
        // SI ET SEULEMENT SI on est en environnement local/testing.
        $isVerified = $this->kkiaPayService->verifyTransaction($transactionId);

        // Si on est en sandbox, on accepte le succès du webhook directement pour avancer
        $paymentValid = $isVerified || (config('app.env') !== 'production' && ($data['isPaymentSucces'] ?? false));

        if ($paymentValid && $entrepriseId && $offerId) {
            return DB::transaction(function () use ($entrepriseId, $offerId, $transactionId, $data) {
                
                $wallet = Wallet::where('entreprise_id', $entrepriseId)->first();
                $offer = MissionOffers::find($offerId);

                if ($wallet && $offer) {
                    // A. Créditer le wallet (Montant brut reçu)
                    $this->walletService->deposit($wallet, $data['amount'], [
                        'transaction_id' => $transactionId,
                        'type' => 'mission_funding'
                    ]);

                    // B. Séquestrer l'argent (Bloquer pour le candidat)
                    $this->walletService->lockFundsForMission($wallet, $data['amount'], $offer);

                    Log::info("Mission {$offerId} activée avec succès.");
                    return response()->json(['message' => 'OK'], 200);
                }
                
                return response()->json(['message' => 'Wallet ou Offre introuvable'], 404);
            });
        }

        return response()->json(['message' => 'Vérification échouée'], 400);
    }

    public function handleKkiapayPayout(Request $request)
    {
        // 1. On log l'événement pour garder une trace en cas de litige
        Log::info('Kkiapay Webhook Received:', $request->all());

        $eventId = $request->input('transactionId'); // La référence Kkiapay
        $status = $request->input('status'); // SUCCESSFUL ou FAILED

        // 2. On cherche la transaction correspondante
        $transaction = Transaction::where('metadata->reference_externe', $eventId)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction introuvable'], 404);
        }

        // 3. Si le virement a échoué chez l'opérateur (MTN/Moov)
        if ($status === 'FAILED') {
            return DB::transaction(function () use ($transaction) {
                // On remet la transaction en échec
                $transaction->update(['status' => 'failed']);

                // On rend l'argent au candidat sur son wallet Jobsy
                $wallet = $transaction->wallet;
                $wallet->increment('balance', abs($transaction->amount));

                Log::warning("Retrait échoué pour {$transaction->id}. Fonds restitués au candidat.");
                
                return response()->json(['message' => 'Statut mis à jour et fonds restitués.']);
            });
        }

        return response()->json(['message' => 'Événement traité']);
    }
}
