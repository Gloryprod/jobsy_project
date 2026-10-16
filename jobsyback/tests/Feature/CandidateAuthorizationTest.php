<?php

namespace Tests\Feature;

use App\Models\{Application, ApplicationAssessments, Candidat, Mission};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * C4 — un candidat n'agit que sur ses propres candidatures et offres.
 */
class CandidateAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $victim;
    private Candidat $attacker;
    private Mission $mission;

    protected function setUp(): void
    {
        parent::setUp();

        $this->victim = Candidat::factory()->create();
        $this->attacker = Candidat::factory()->create();
        $this->mission = Mission::factory()->create();
    }

    public function test_un_candidat_ne_peut_pas_postuler_au_nom_dun_autre(): void
    {
        $this->withHeaders($this->bearerFor($this->attacker->user))
            ->postJson("/api/start_application/{$this->victim->id}/{$this->mission->id}")
            ->assertStatus(403);

        $this->assertSame(0, Application::count());
    }

    public function test_un_candidat_ne_peut_pas_ecraser_les_reponses_dun_autre(): void
    {
        $application = $this->draftApplicationFor($this->victim);

        $this->withHeaders($this->bearerFor($this->attacker->user))
            ->postJson("/api/applications/{$application->id}/submit-step-one", ['responses' => ['1' => 'piraté']])
            ->assertStatus(404);

        $this->withHeaders($this->bearerFor($this->attacker->user))
            ->postJson("/api/applications/{$application->id}/finalize", ['responses' => ['1' => 'piraté']])
            ->assertStatus(404);

        $this->assertArrayNotHasKey('responses', $application->assessment->fresh()->step_1_data);
    }

    public function test_un_candidat_ne_lit_pas_les_candidatures_ni_les_offres_dun_autre(): void
    {
        $offer = $this->makeOffer($this->mission, $this->victim);
        $headers = $this->bearerFor($this->attacker->user);

        $this->withHeaders($headers)->getJson("/api/missions/{$this->victim->id}/myapplications")->assertStatus(403);
        $this->withHeaders($headers)->getJson("/api/candidat/mission-offers/{$offer->id}")->assertStatus(404);

        // Le propriétaire, lui, y a accès
        $owner = $this->bearerFor($this->victim->user);
        $this->withHeaders($owner)->getJson("/api/missions/{$this->victim->id}/myapplications")->assertOk();
        $this->withHeaders($owner)->getJson("/api/candidat/mission-offers/{$offer->id}")->assertOk();
    }

    public function test_une_candidature_soumise_ne_peut_pas_etre_recommencee_pour_retenter_la_note(): void
    {
        $application = $this->draftApplicationFor($this->victim);
        $application->update(['status' => 'pending', 'global_score' => 35]);

        $headers = $this->bearerFor($this->victim->user);

        $this->withHeaders($headers)
            ->postJson("/api/start_application/{$this->victim->id}/{$this->mission->id}")
            ->assertStatus(409);

        $this->withHeaders($headers)
            ->postJson("/api/applications/{$application->id}/submit-step-one", ['responses' => ['1' => 'nouvel essai']])
            ->assertStatus(409);

        $this->assertSame('pending', $application->fresh()->status);
        $this->assertSame(35, $application->fresh()->global_score);
    }

    public function test_on_ne_repond_qu_une_fois_a_une_offre_et_pas_apres_expiration(): void
    {
        $headers = $this->bearerFor($this->victim->user);

        $expired = $this->makeOffer($this->mission, $this->victim, ['expires_at' => now()->subHour()]);
        $this->withHeaders($headers)
            ->postJson("/api/candidat/mission-offers/{$expired->id}/respond", ['status' => 'accepted'])
            ->assertStatus(410);
        $this->assertNull($expired->fresh()->accepted_at);

        $otherMission = Mission::factory()->create();
        $offer = $this->makeOffer($otherMission, $this->victim);
        $this->withHeaders($headers)
            ->postJson("/api/candidat/mission-offers/{$offer->id}/respond", ['status' => 'declined'])
            ->assertOk();
        $this->withHeaders($headers)
            ->postJson("/api/candidat/mission-offers/{$offer->id}/respond", ['status' => 'accepted'])
            ->assertStatus(409);

        $this->assertNull($offer->fresh()->accepted_at);
        $this->assertSame('declined', $offer->fresh()->status);
    }

    private function draftApplicationFor(Candidat $candidat): Application
    {
        $application = Application::create([
            'mission_id' => $this->mission->id,
            'candidat_id' => $candidat->id,
            'status' => 'draft',
        ]);

        ApplicationAssessments::create([
            'application_id' => $application->id,
            'step_1_data' => ['questions' => [['id' => 1, 'label' => 'Pourquoi ?', 'context_hint' => '']]],
            'step_2_data' => ['questions' => [['id' => 1, 'label' => 'Comment ?', 'context_hint' => '']]],
        ]);

        return $application;
    }
}
