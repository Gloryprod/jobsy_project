<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\MissionOffers;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Str; 
use App\Services\WalletService;
use Exception;

class PaymentController extends Controller
{
    public function initiateKkiaPay(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
            'candidat_id' => 'required|numeric|exists:candidats,id',
        ]);

        $user = $request->user();
        $entrepriseId = $user->entreprise->id;

        $walletEntreprise = Wallet::firstOrCreate(
        ['entreprise_id' => $entrepriseId], // Condition de recherche
            [
                'balance' => 0, 
                'balance_locked' => 0, 
                'currency' => 'XOF'
            ] // Valeurs par défaut si création
        );

        $walletCandidat = Wallet::firstOrCreate(
            ['candidat_id' => $request->candidat_id],
            [
                'balance' => 0, 
                'balance_locked' => 0, 
                'currency' => 'XOF'
            ] // Valeurs par défaut si création
        );

        $transactionId = 'TX-' . strtoupper(Str::random(10));

        // Ces informations seront envoyées au Frontend pour ouvrir le widget
        return response()->json([
            'amount' => $request->amount,
            'public_key' => config('services.kkiapay.public_key'), // Ta clé API
            'transaction_id' => $transactionId,
            'entreprise_id' => $entrepriseId, // Pour le retrouver dans le webhook
            'message' => "Fonds insuffisants, veuillez procéder à un dépôt.", 
        ]);
    }

    public function initiateDeposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:100',
        ]);

        $entreprise = $request->user()->entreprise;

        $walletEntreprise = Wallet::firstOrCreate(
        ['entreprise_id' => $entreprise->id], // Condition de recherche
            [
                'balance' => 0, 
                'balance_locked' => 0, 
                'currency' => 'XOF'
            ] // Valeurs par défaut si création
        );

        return apiResponse([
            'public_key' => config('services.kkiapay.public_key'), // Stockée dans ton .env
            'entreprise_id' => $entreprise->id,
        ], 'Dépôt initialisé', 'success');
    }

    public function lockFunds(Request $request, WalletService $walletService)
    {
        $offer = MissionOffers::findOrFail($request->offerId);
        $entrepriseWallet = Wallet::where('entreprise_id', $request->user()->entreprise->id)->firstOrFail();

        try {
            $walletService->lockFundsForMission($entrepriseWallet, $request->amount, $offer);
            return apiResponse(null, 'Fonds bloqués sur le compte du candidat avec succès', 'success');
        } catch (Exception $e) {
            return apiResponse(null, $e->getMessage(), 'error', 400);
        }
    }


}
