<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class KkiapayService
{
    /**
     * Vérifie le statut d'une transaction directement auprès de KkiaPay
     */
    public function verifyTransaction(string $transactionId): bool
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => config('services.kkiapay.secret_key'),
            ])->get(config('services.kkiapay.api_url') . "/transactions/status/{$transactionId}");

            if ($response->successful()) {
                $data = $response->json();
                
                // IMPORTANT : On vérifie que le statut renvoyé par l'API est bien SUCCESS
                return isset($data['status']) && $data['status'] === 'SUCCESS';
            }

            Log::error("KkiaPay Verification Failed for {$transactionId}", ['response' => $response->body()]);
            return false;

        } catch (\Exception $e) {
            Log::error("KkiaPay Service Error", ['error' => $e->getMessage()]);
            return false;
        }
    }
}