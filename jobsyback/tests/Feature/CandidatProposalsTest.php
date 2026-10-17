<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\MissionProposal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * GET /candidat/proposals : les propositions reçues par le candidat connecté, avec le montant de la mission.
 */
class CandidatProposalsTest extends TestCase
{
    use RefreshDatabase;

    private function proposition(Candidat $candidat, Mission $mission, Entreprise $entreprise): MissionProposal
    {
        return MissionProposal::create([
            'mission_id' => $mission->id,
            'candidat_id' => $candidat->id,
            'entreprise_id' => $entreprise->id,
            'subject' => 'Une mission pour toi',
            'message' => 'Ton profil correspond.',
            'status' => 'pending',
            'sent_at' => now(),
        ]);
    }

    public function test_la_proposition_renvoie_le_montant_de_la_mission(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 45000]);
        $candidat = Candidat::factory()->create();
        $this->proposition($candidat, $mission, $entreprise);

        $reponse = $this->getJson('/api/candidat/proposals', $this->bearerFor($candidat->user))->assertOk();

        $this->assertEquals(45000, $reponse->json('data.0.mission.reward'));
        $this->assertSame($mission->title, $reponse->json('data.0.mission.title'));
    }

    public function test_le_candidat_ne_voit_que_ses_propositions(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $moi = Candidat::factory()->create();
        $autre = Candidat::factory()->create();
        $this->proposition($autre, $mission, $entreprise);

        $this->getJson('/api/candidat/proposals', $this->bearerFor($moi->user))
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
