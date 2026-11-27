<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Requête de vérification CORS (lot 8c) : le front envoie X-Requested-With, donc chaque appel est précédé
 * d'une requête OPTIONS. Sa réponse doit pouvoir être gardée par le navigateur.
 */
class CorsPreflightTest extends TestCase
{
    public function test_la_reponse_de_verification_se_garde_deux_heures(): void
    {
        $origine = config('cors.allowed_origins')[0];

        $this->call('OPTIONS', '/api/user', [], [], [], [
            'HTTP_ORIGIN' => $origine,
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'x-requested-with',
        ])
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', $origine)
            ->assertHeader('Access-Control-Allow-Credentials', 'true')
            ->assertHeader('Access-Control-Max-Age', '7200');
    }
}
