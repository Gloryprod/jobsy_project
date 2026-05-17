<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AdminWalletController extends Controller
{
    public function getApplicantsPendingWithdrawals() {
        $transactions = Transaction::where('type', 'withdrawal')
            ->where('status', 'pending')
            ->with('wallet.candidat.user') 
            ->latest()
            ->get();

        return apiResponse(
            $transactions,
            'success',
            200
        );
    }

    public function updateWithdrawalStatus(Request $request, $id) {
        $transaction = Transaction::findOrFail($id);
        $wallet = $transaction->wallet;

        if ($request->action === 'approve') {
            
            // --- DEBUT SIMULATION LOCALE ---
            // Si tu es sur XAMPP (local), on simule la réussite sans appeler Kkiapay
            if (config('app.env') === 'local') {
                $transaction->update([
                    'status' => 'completed',
                    'reference_externe' => 'SIMUL_'.uniqid()
                ]);

                Log::info("Simulation locale : Retrait ID {$id} validé sans appel API.");
                
                return response()->json([
                    'message' => 'Mode simulation : Retrait marqué comme complété avec succès !'
                ]);
            }
            // --- FIN SIMULATION LOCALE ---

            // Appel réel à Kkiapay (Sera exécuté uniquement en production)
            $response = Http::withHeaders([
                'x-api-key' => env('KKIAPAY_SECRET_KEY'),
                'Accept' => 'application/json'
            ])->post('https://api.kkiapay.me/api/v1/payout', [
                'amount'      => abs($transaction->amount),
                'phoneNumber' => $transaction->metadata['phone'] ?? "22967000000",
                'destination' => 'momo'
            ]);

            Log::info("Status Kkiapay : " . $response->status());
            Log::info("Body Kkiapay : " . $response->body());

            if ($response->successful()) {
                $transaction->update([
                    'status' => 'completed',
                    $transaction->metadata['reference_externe'] => $response->json()['transactionId'] ?? null
                ]);
                return response()->json(['message' => 'Retrait réel validé via Kkiapay.']);
            }

            return response()->json(['error' => 'Erreur API Kkiapay'], 400);
        }

        if ($request->action === 'reject') {
            return DB::transaction(function () use ($transaction, $wallet) {
                $transaction->update(['status' => 'failed']);
                $wallet->increment('balance', abs($transaction->amount));
                return response()->json(['message' => 'Retrait refusé et fonds restitués.']);
            });
        }
    }
}
