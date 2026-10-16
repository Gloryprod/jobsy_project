<?php

namespace Tests\Feature;

use App\Models\{Entreprise, Mission, MissionOffers, Transaction, Wallet};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * C5 — le séquestre bloque la récompense de la mission (montant serveur), une seule fois,
 * et le paiement final n'est possible que si ce séquestre existe.
 */
class EscrowTest extends TestCase
{
    use RefreshDatabase;

    private Entreprise $entreprise;
    private Mission $mission;
    private MissionOffers $offer;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->entreprise = Entreprise::factory()->create();
        $this->mission = Mission::factory()->create(['entreprise_id' => $this->entreprise->id, 'reward' => 15000]);
        $this->offer = $this->makeOffer($this->mission);
    }

    public function test_le_blocage_utilise_la_recompense_et_ignore_le_montant_du_client(): void
    {
        $wallet = $this->walletFor($this->entreprise, balance: 50000);
        $headers = $this->bearerFor($this->entreprise->user);

        $this->withHeaders($headers)
            ->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $this->offer->id, 'amount' => -1000000])
            ->assertOk();

        // Second appel (double clic) : rien de plus n'est bloqué
        $this->withHeaders($headers)
            ->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $this->offer->id, 'amount' => 1])
            ->assertOk();

        $this->assertEquals(15000, $wallet->fresh()->balance_locked);
        $this->assertSame(1, Transaction::where('reference', 'like', 'ESC-%')->count());
    }

    public function test_le_solde_deja_bloque_n_est_pas_disponible(): void
    {
        $wallet = $this->walletFor($this->entreprise, balance: 20000, locked: 10000);

        $this->withHeaders($this->bearerFor($this->entreprise->user))
            ->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $this->offer->id])
            ->assertStatus(400);

        $this->assertEquals(10000, $wallet->fresh()->balance_locked);
    }

    public function test_une_entreprise_ne_bloque_pas_de_fonds_sur_l_offre_d_une_autre(): void
    {
        $attacker = Entreprise::factory()->create();
        $this->walletFor($attacker, balance: 50000);

        $this->withHeaders($this->bearerFor($attacker->user))
            ->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $this->offer->id])
            ->assertStatus(403);

        $this->withHeaders($this->bearerFor($attacker->user))
            ->postJson('/api/entreprise/payments/initiate-kkiapay', ['offer_id' => $this->offer->id])
            ->assertStatus(403);

        $this->assertSame(0, Transaction::count());
    }

    public function test_impossible_de_valider_une_mission_sans_sequestre(): void
    {
        $this->walletFor($this->entreprise, balance: 50000);
        $this->offer->update(['status' => 'work_finished']);

        $this->withHeaders($this->bearerFor($this->entreprise->user))
            ->postJson("/api/mission-offers/{$this->offer->id}/update-status", ['status' => 'validated', 'rating' => 5])
            ->assertStatus(422);

        $offer = $this->offer->fresh();
        $this->assertSame('work_finished', $offer->status);
        $this->assertNull($offer->validated_at);
        $this->assertEquals(0, $offer->application->candidat->fresh()->score);
    }

    public function test_validation_avec_sequestre_paie_le_net_et_la_commission(): void
    {
        $entrepriseWallet = $this->walletFor($this->entreprise, balance: 50000);
        $headers = $this->bearerFor($this->entreprise->user);

        $this->withHeaders($headers)
            ->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $this->offer->id])
            ->assertOk();

        $this->offer->update(['status' => 'work_finished']);

        $this->withHeaders($headers)
            ->postJson("/api/mission-offers/{$this->offer->id}/update-status", ['status' => 'validated', 'rating' => 5])
            ->assertOk();

        $candidatWallet = Wallet::where('candidat_id', $this->offer->application->candidat_id)->first();
        $adminWallet = Wallet::where('is_admin', true)->first();

        $this->assertEquals(35000, $entrepriseWallet->fresh()->balance);
        $this->assertEquals(0, $entrepriseWallet->fresh()->balance_locked);
        $this->assertEquals(13500, $candidatWallet->balance);   // 15 000 - 10 %
        $this->assertEquals(1500, $adminWallet->balance);       // commission Jobsy
        $this->assertSame('completed', $this->offer->fresh()->status);

        // Rejouer la validation ne repaie pas
        $this->withHeaders($headers)
            ->postJson("/api/mission-offers/{$this->offer->id}/update-status", ['status' => 'validated'])
            ->assertStatus(403);
        $this->assertEquals(13500, $candidatWallet->fresh()->balance);
    }
}
