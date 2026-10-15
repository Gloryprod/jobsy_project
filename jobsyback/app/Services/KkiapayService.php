<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class KkiapayService
{
    /**
     * Interroge KkiaPay sur une transaction (même appel que le SDK PHP officiel).
     * Retourne les données de la transaction (status, amount, state, ...) ou null.
     */
    public function fetchTransaction(string $transactionId): ?array
    {
        $baseUrl = Str::beforeLast(rtrim((string) config('services.kkiapay.api_url'), '/'), '/api/v1');

        try {
            $response = Http::withHeaders([
                'Accept' => 'application/json',
                'X-API-KEY' => config('services.kkiapay.public_key'),
                'X-PRIVATE-KEY' => config('services.kkiapay.private_key'),
                'X-SECRET-KEY' => config('services.kkiapay.secret_key'),
            ])->timeout(15)->post($baseUrl . '/api/v1/transactions/status', [
                'transactionId' => $transactionId,
            ]);

            if ($response->successful() && is_array($response->json())) {
                return $response->json();
            }

            Log::error("KkiaPay : vérification impossible pour {$transactionId}", ['http_status' => $response->status()]);
            return null;

        } catch (\Exception $e) {
            Log::error("KkiaPay Service Error", ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function hasWebhookSecret(): bool
    {
        return (string) config('services.kkiapay.webhook_secret') !== '';
    }

    /**
     * Compare l'en-tête x-kkiapay-secret au « hash secret » du tableau de bord KkiaPay.
     * Faux si aucun secret n'est configuré.
     */
    public function webhookSecretMatches(Request $request): bool
    {
        return $this->hasWebhookSecret()
            && hash_equals((string) config('services.kkiapay.webhook_secret'), (string) $request->header('x-kkiapay-secret'));
    }
}
