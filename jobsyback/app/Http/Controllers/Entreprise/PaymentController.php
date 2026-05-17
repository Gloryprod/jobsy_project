<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Support\Str; 

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
            // 'callback_url' => route('payment.success'), // Où rediriger l'utilisateur après
        ]);
    }
}
