<?php

namespace Tests\Feature;

use App\Exceptions\WalletException;
use App\Models\{Entreprise, Mission, PaymentIntent, Transaction};
use App\Services\WalletService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Le séquestre ne se constitue que sur une offre acceptée et en cours (lot 7d) :
 * sur une offre sans réponse, refusée ou terminée, aucune étape ne rendrait les fonds à l'entreprise.
 */
class SequestreEtatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_recompense_ne_se_bloque_que_sur_une_offre_en_cours(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 15000]);
        $wallet = $this->walletFor($entreprise, balance: 100000);
        $entete = $this->bearerFor($entreprise->user);

        foreach ([null, 'declined', 'rejected_after_onboarding', 'completed'] as $statut) {
            $offre = $this->makeOffer($mission, null, ['status' => $statut]);
            $this->withHeaders($entete)->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $offre->id])
                ->assertStatus(400)
                ->assertJsonPath('message', "Cette offre n'est pas en cours : la récompense ne peut pas y être bloquée.");
        }
        $this->assertSame(0.0, (float) $wallet->fresh()->balance_locked);
        $this->assertSame(0, Transaction::count());

        $enCours = $this->makeOffer($mission, null, ['status' => 'service_started', 'accepted_at' => now()]);
        $this->withHeaders($entete)->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $enCours->id])->assertOk();
        $this->assertSame(15000.0, (float) $wallet->fresh()->balance_locked);
        $this->assertSame('locked', $enCours->fresh()->payment_status);
    }

    public function test_le_sequestre_du_webhook_refuse_aussi_une_offre_refusee(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 15000]);
        $wallet = $this->walletFor($entreprise, balance: 100000);
        $offre = $this->makeOffer($mission, null, ['status' => 'declined', 'declined_at' => now()]);

        $this->expectException(WalletException::class);
        try {
            app(WalletService::class)->lockFundsForMission($wallet, $offre);
        } finally {
            $this->assertSame(0.0, (float) $wallet->fresh()->balance_locked);
        }
    }

    public function test_pas_de_paiement_kkiapay_pour_une_offre_hors_cours_ou_deja_garantie(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 15000]);
        $entete = $this->bearerFor($entreprise->user);

        $sansReponse = $this->makeOffer($mission, null, ['status' => null]);
        $this->withHeaders($entete)->postJson('/api/entreprise/payments/initiate-kkiapay', ['offer_id' => $sansReponse->id])
            ->assertStatus(422)
            ->assertJsonPath('message', "Cette offre n'est pas en cours : la récompense ne peut pas être payée.");

        $garantie = $this->makeOffer($mission, null, ['status' => 'in_progress', 'payment_status' => 'locked']);
        $this->withHeaders($entete)->postJson('/api/entreprise/payments/initiate-kkiapay', ['offer_id' => $garantie->id])
            ->assertStatus(409)
            ->assertJsonPath('message', 'La récompense de cette mission est déjà garantie.');

        $this->assertSame(0, PaymentIntent::count());

        $aGarantir = $this->makeOffer($mission, null, ['status' => 'work_finished']);
        $this->withHeaders($entete)->postJson('/api/entreprise/payments/initiate-kkiapay', ['offer_id' => $aGarantir->id])
            ->assertOk()
            ->assertJsonPath('amount', 15000);
    }
}
