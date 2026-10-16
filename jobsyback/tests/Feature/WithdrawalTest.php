<?php

namespace Tests\Feature;

use App\Models\{Candidat, Transaction, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * C6 — un retrait ne peut dépasser le solde, n'est viré qu'une fois et ne peut pas être remboursé après virement.
 */
class WithdrawalTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->candidat = Candidat::factory()->create();
        $this->admin = User::factory()->create(['role' => 'ADMIN']);
    }

    public function test_un_retrait_superieur_au_solde_est_refuse(): void
    {
        $wallet = $this->walletFor($this->candidat, balance: 5000);

        $this->withHeaders($this->bearerFor($this->candidat->user))
            ->postJson('/api/candidat/withdraw', ['amount' => 6000, 'payment_method' => 'mtn', 'phone_number' => '2290197000000'])
            ->assertStatus(400);

        $this->withHeaders($this->bearerFor($this->candidat->user))
            ->postJson('/api/candidat/withdraw', ['amount' => -500, 'payment_method' => 'mtn', 'phone_number' => '2290197000000'])
            ->assertStatus(422);

        $this->assertEquals(5000, $wallet->fresh()->balance);
        $this->assertSame(0, Transaction::count());
    }

    public function test_un_retrait_approuve_n_est_vire_qu_une_fois_et_ne_peut_plus_etre_rembourse(): void
    {
        Http::fake(['*' => Http::response(['transactionId' => 'PAYOUT-1'])]);
        $wallet = $this->walletFor($this->candidat, balance: 10000);

        $this->withHeaders($this->bearerFor($this->candidat->user))
            ->postJson('/api/candidat/withdraw', ['amount' => 4000, 'payment_method' => 'mtn', 'phone_number' => '2290197000000'])
            ->assertCreated();

        $withdrawal = Transaction::where('type', 'withdrawal')->firstOrFail();
        $admin = $this->bearerFor($this->admin);

        $this->withHeaders($admin)->postJson("/api/candidats/updateWithdrawalStatus/{$withdrawal->id}", ['action' => 'approve'])->assertOk();
        $this->withHeaders($admin)->postJson("/api/candidats/updateWithdrawalStatus/{$withdrawal->id}", ['action' => 'approve'])->assertStatus(409);
        $this->withHeaders($admin)->postJson("/api/candidats/updateWithdrawalStatus/{$withdrawal->id}", ['action' => 'reject'])->assertStatus(409);

        Http::assertSentCount(1); // un seul virement
        $withdrawal->refresh();
        $this->assertSame('completed', $withdrawal->status);
        $this->assertSame('PAYOUT-1', $withdrawal->metadata['reference_externe']); // référence enfin enregistrée
        $this->assertEquals(6000, $wallet->fresh()->balance);
    }

    public function test_un_retrait_refuse_est_rembourse_une_seule_fois(): void
    {
        $wallet = $this->walletFor($this->candidat, balance: 10000);

        $this->withHeaders($this->bearerFor($this->candidat->user))
            ->postJson('/api/candidat/withdraw', ['amount' => 4000, 'payment_method' => 'mtn', 'phone_number' => '2290197000000'])
            ->assertCreated();

        $withdrawal = Transaction::where('type', 'withdrawal')->firstOrFail();
        $admin = $this->bearerFor($this->admin);

        $this->withHeaders($admin)->postJson("/api/candidats/updateWithdrawalStatus/{$withdrawal->id}", ['action' => 'reject'])->assertOk();
        $this->withHeaders($admin)->postJson("/api/candidats/updateWithdrawalStatus/{$withdrawal->id}", ['action' => 'reject'])->assertStatus(409);

        $this->assertEquals(10000, $wallet->fresh()->balance);
        $this->assertSame('failed', $withdrawal->fresh()->status);
    }

    public function test_le_webhook_d_echec_de_virement_rembourse_une_seule_fois(): void
    {
        $wallet = $this->walletFor($this->candidat, balance: 6000);
        $withdrawal = $wallet->transactions()->create([
            'amount' => -4000,
            'type' => 'withdrawal',
            'status' => 'completed',
            'reference' => 'WDL-TEST',
            'metadata' => ['phone' => '2290197000000', 'reference_externe' => 'PAYOUT-1'],
        ]);

        $payload = ['transactionId' => 'PAYOUT-1', 'status' => 'FAILED'];
        $this->postJson('/api/webhooks/kkiapay/payouts', $payload)->assertOk();
        $this->postJson('/api/webhooks/kkiapay/payouts', $payload)->assertOk(); // rejeu

        $this->assertEquals(10000, $wallet->fresh()->balance);
        $this->assertSame('failed', $withdrawal->fresh()->status);
    }

    public function test_le_webhook_de_virement_exige_le_secret_hors_tests(): void
    {
        config(['services.kkiapay.webhook_secret' => 'hash-secret']);

        $this->postJson('/api/webhooks/kkiapay/payouts', ['transactionId' => 'X', 'status' => 'FAILED'], ['x-kkiapay-secret' => 'faux'])
            ->assertStatus(401);
    }
}
