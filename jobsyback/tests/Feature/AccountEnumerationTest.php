<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * M15 — les formulaires publics répondent de la même façon que l'email soit inscrit ou non.
 */
class AccountEnumerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_mot_de_passe_oublie_ne_revele_pas_les_comptes(): void
    {
        Notification::fake();
        $user = User::factory()->create(['role' => 'JEUNE']);

        $known = $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->postJson('/api/forgot-password', ['email' => 'inconnu@jobsy.bj'])->assertOk();

        $this->assertSame($known->json('message'), $unknown->json('message'));
    }

    public function test_renvoi_de_verification_ne_revele_pas_les_comptes(): void
    {
        Notification::fake();
        $unverified = User::factory()->unverified()->create(['role' => 'JEUNE']);
        $verified = User::factory()->create(['role' => 'JEUNE']);

        $responses = collect([$unverified->email, $verified->email, 'inconnu@jobsy.bj'])
            ->map(fn ($email) => $this->postJson('/api/auth/resend-verification', ['email' => $email])->assertOk()->json('message'));

        $this->assertCount(1, $responses->unique());
        Notification::assertSentTo($unverified, \App\Notifications\CustomVerifyEmail::class);
        Notification::assertNotSentTo($verified, \App\Notifications\CustomVerifyEmail::class);
    }
}
