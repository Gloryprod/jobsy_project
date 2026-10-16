<?php

namespace App\Http\Controllers\Candidat;

use App\Exceptions\WalletException;
use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\Request;

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

    public function withdrawalRequest(Request $request, WalletService $walletService)
    {
        $request->validate([
            'amount' => 'required|integer|min:100',
            'payment_method' => 'required|string|max:50',
            // Numéro Mobile Money : chiffres uniquement, indicatif optionnel
            'phone_number' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
        ], [
            'amount.min' => 'Le montant minimum de retrait est de 100 FCFA.',
            'phone_number.regex' => 'Numéro de téléphone invalide (chiffres uniquement, indicatif optionnel).',
        ]);

        $wallet = $request->user()->candidat->wallet;

        if (!$wallet) {
            return response()->json([
                'message' => 'Ton coffre ne contient pas assez d\'or pour ce retrait.'
            ], 400);
        }

        try {
            $walletService->requestWithdrawal($wallet, (int) $request->amount, [
                'method' => $request->payment_method,
                'phone'  => $request->phone_number,
                'description' => "Retrait vers " . $request->payment_method
            ]);
        } catch (WalletException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        return response()->json([
            'message' => 'Demande de retrait enregistrée ! Les mages de Jobsy traitent ta demande de retrait.',
            'balance' => $wallet->fresh()->balance
        ], 201);
    }
}
