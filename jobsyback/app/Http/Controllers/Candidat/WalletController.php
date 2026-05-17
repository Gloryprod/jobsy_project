<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletController extends Controller
{
    public function getWalletData(Request $request) {
        $candidat = $request->user()->candidat;
        $wallet = $candidat->wallet;

        if (!$wallet) {
            return response()->json([
                'balance_available' => 0,
                'balance_pending'   => 0,
                'total_earned'      => 0,
                'currency'          => 'XOF',
                'transactions'      => []
            ]);
        }

        // 1. Calcul du montant en attente (Transactions entrantes non encore complétées)
        $balancePending = Transaction::where('wallet_id', $wallet->id)
            ->whereIn('type', ['transfer'])
            ->where('status', 'pending')
            ->latest()
            ->sum('amount');

        // 2. Calcul du gain total historique (Tout ce qui a été gagné avec succès)
        $totalEarned = Transaction::where('wallet_id', $wallet->id)
            ->whereIn('type', ['transfer'])
            ->where('status', 'completed')
            ->sum('amount');

        // 3. Récupération de l'historique complet
        $transactions = Transaction::where('wallet_id', $wallet->id)
            ->latest()
            ->get();

        return response()->json([
            'balance_available' => (int) $wallet->balance,
            'balance_pending'   => (int) $balancePending ?? 0,
            'total_earned'      => (int) $totalEarned ?? 0,
            'currency'          => $wallet->currency ?? 'XOF',
            'transactions'      => $transactions ? $transactions->map(function($tx) {
                return [
                    'id'          => $tx->id,
                    'type'        => $tx->type,
                    'amount'      => (int) $tx->amount,
                    'status'      => $tx->status, // 'completed', 'pending', 'failed'
                    'reference'   => $tx->reference,
                    // Utilisation de la colonne metadata pour stocker le nom de la mission
                    'description' => (is_array($tx->metadata) && isset($tx->metadata['mission_name'])) 
                    ? $tx->metadata['mission_name'] 
                    : ucfirst($tx->type),
                    'created_at'  => $tx->created_at->toISOString(),
                ];
            }) : []
        ]);
    }

    public function withdrawalRequest(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric', 
            'payment_method' => 'required|string',   
            'phone_number' => 'required|string', 
        ]);

        $candidat = $request->user()->candidat;
        $wallet = $candidat->wallet;

        if ($wallet->balance < $request->amount) {
            return response()->json([
                'message' => 'Ton coffre ne contient pas assez d\'or pour ce retrait.'
            ], 400);
        }

        if ($request->amount <= 0) {
            return response()->json([
                'message' => 'Le montant du retrait doit être positif.'
            ], 400);
        }

        try {
            return DB::transaction(function () use ($wallet, $request) {
                
                // 3. Débit immédiat du solde (L'argent est "réservé")
                $wallet->decrement('balance', $request->amount);

                // 4. Création de la transaction de retrait
                $transaction = Transaction::create([
                    'wallet_id' => $wallet->id,
                    'amount'    => -$request->amount, // Toujours négatif pour un retrait
                    'type'      => 'withdrawal', 
                    'status'    => 'pending',    
                    'reference' => 'WDL-' . strtoupper(uniqid()),
                    'metadata'  => [
                        'method' => $request->payment_method,
                        'phone'  => $request->phone_number,
                        'description' => "Retrait vers " . $request->payment_method
                    ]
                ]);

                return response()->json([
                    'message' => 'Demande de retrait enregistrée ! Les mages de Jobsy traitent ta demande de retrait.',
                    'balance' => $wallet->balance
                ], 201);    
            });
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Une erreur est survenue lors du retrait.'
            ], 500);
        }
    }
}
