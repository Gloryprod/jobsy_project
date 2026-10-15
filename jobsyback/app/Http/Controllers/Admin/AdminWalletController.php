<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Services\WalletService;
use Illuminate\Http\Request;
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
            'Retraits en attente récupérés avec succès',
            'success',
            200
        );
    }

    /**
     * Validation ou refus d'un retrait par un admin.
     * Chaque transition (pending → processing → completed, ou pending → failed) ne peut avoir lieu qu'une fois :
     * un double clic ou un second admin ne déclenche ni double virement ni remboursement après virement.
     */
    public function updateWithdrawalStatus(Request $request, $id, WalletService $walletService) {
        $request->validate([
            'action' => 'required|in:approve,reject',
        ]);

        $transaction = Transaction::where('type', 'withdrawal')->findOrFail($id);

        if ($request->action === 'reject') {
            if (!$walletService->failWithdrawal($transaction, ['pending'], ['rejected_by' => $request->user()->id])) {
                return response()->json(['message' => 'Ce retrait a déjà été traité.'], 409);
            }

            return response()->json(['message' => 'Retrait refusé et fonds restitués.']);
        }

        $phone = $transaction->metadata['phone'] ?? null;

        if (!$phone) {
            return response()->json(['message' => 'Numéro de téléphone du bénéficiaire manquant : retrait impossible.'], 422);
        }

        // Réservation du retrait : un seul admin, une seule fois
        if (!$walletService->transitionWithdrawal($transaction, 'pending', 'processing', ['approved_by' => $request->user()->id])) {
            return response()->json(['message' => 'Ce retrait a déjà été traité.'], 409);
        }

        // --- DEBUT SIMULATION LOCALE ---
        // En local, on simule la réussite sans appeler Kkiapay
        if (app()->environment('local')) {
            $walletService->transitionWithdrawal($transaction, 'processing', 'completed', [
                'reference_externe' => 'SIMUL_' . uniqid(),
            ]);

            Log::info("Simulation locale : Retrait ID {$id} validé sans appel API.");

            return response()->json([
                'message' => 'Mode simulation : Retrait marqué comme complété avec succès !'
            ]);
        }
        // --- FIN SIMULATION LOCALE ---

        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.kkiapay.secret_key'),
                'Accept' => 'application/json'
            ])->timeout(30)->post(config('services.kkiapay.payout_url'), [
                'amount'      => abs($transaction->amount),
                'phoneNumber' => $phone,
                'destination' => 'momo'
            ]);
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error("Virement Kkiapay injoignable pour le retrait {$id} : " . $e->getMessage());
            $walletService->transitionWithdrawal($transaction, 'processing', 'pending', ['last_payout_error' => 'connection']);

            return response()->json(['message' => 'Kkiapay est injoignable, le retrait reste en attente.'], 502);
        }

        Log::info("Virement Kkiapay pour le retrait {$id} : HTTP " . $response->status());

        if ($response->successful()) {
            $walletService->transitionWithdrawal($transaction, 'processing', 'completed', [
                'reference_externe' => $response->json('transactionId'),
            ]);

            return response()->json(['message' => 'Retrait réel validé via Kkiapay.']);
        }

        // Le virement n'est pas parti : le retrait redevient « pending » et peut être relancé
        $walletService->transitionWithdrawal($transaction, 'processing', 'pending', [
            'last_payout_error' => $response->status(),
        ]);

        return response()->json(['message' => 'Erreur API Kkiapay, le retrait reste en attente.'], 502);
    }
}
