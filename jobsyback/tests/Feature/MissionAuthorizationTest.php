<?php

namespace Tests\Feature;

use App\Models\{Entreprise, Mission, Candidat, Application, MissionProposal};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * C3 — une entreprise ne peut agir que sur ses propres missions et son propre profil.
 */
class MissionAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private Entreprise $owner;
    private Entreprise $attacker;
    private Mission $mission;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = Entreprise::factory()->create();
        $this->attacker = Entreprise::factory()->create();
        $this->mission = Mission::factory()->create(['entreprise_id' => $this->owner->id]);
    }

    public function test_entreprise_ne_peut_pas_voir_les_candidatures_dune_mission_qui_ne_lui_appartient_pas(): void
    {
        $response = $this->withHeaders($this->bearerFor($this->attacker->user))
            ->getJson("/api/missions/{$this->mission->id}/applications");

        $response->assertStatus(403);
    }

    public function test_entreprise_ne_peut_pas_selectionner_un_candidat_sur_une_mission_qui_ne_lui_appartient_pas(): void
    {
        $application = Application::create([
            'mission_id' => $this->mission->id,
            'candidat_id' => Candidat::factory()->create()->id,
            'status' => 'pending',
        ]);

        // Données valides : seule l'appartenance de la mission doit bloquer
        $response = $this->withHeaders($this->bearerFor($this->attacker->user))
            ->postJson("/api/entreprise/applications/{$application->id}/select", [
                'start_date' => now()->addDays(3)->toDateString(),
                'start_time' => '09:00',
                'place' => 'Cotonou',
                'contact_person' => 'Pirate',
                'expires_at' => now()->addDays(2)->toDateString(),
            ]);

        $response->assertStatus(403);
        $this->assertSame('pending', $application->fresh()->status);
    }

    public function test_entreprise_ne_peut_ni_lire_ni_modifier_ni_supprimer_la_mission_dune_autre(): void
    {
        $headers = $this->bearerFor($this->attacker->user);

        $this->withHeaders($headers)->getJson("/api/missions/{$this->mission->id}")->assertStatus(403);
        $this->withHeaders($headers)->putJson("/api/missions/{$this->mission->id}", $this->validMissionPayload())->assertStatus(403);
        $this->withHeaders($headers)->deleteJson("/api/missions/{$this->mission->id}")->assertStatus(403);
        $this->withHeaders($headers)->getJson("/api/missions/close/{$this->mission->id}")->assertStatus(403);
        $this->withHeaders($headers)->getJson("/api/missions/deactivate/{$this->mission->id}")->assertStatus(403);

        $this->assertNotSoftDeleted($this->mission);
        $mission = $this->mission->fresh();
        $this->assertNull($mission->closed_at);
        $this->assertTrue((bool) $mission->active);
        $this->assertNotSame('Titre pirate', $mission->title);
    }

    public function test_la_suppression_groupee_ignore_les_missions_des_autres_entreprises(): void
    {
        $ownMission = Mission::factory()->create(['entreprise_id' => $this->attacker->id]);

        $this->withHeaders($this->bearerFor($this->attacker->user))
            ->postJson('/api/missions/bulk-delete', ['ids' => [$this->mission->id, $ownMission->id]])
            ->assertOk();

        $this->assertNotSoftDeleted($this->mission); // la mission de l'autre entreprise survit
        $this->assertSoftDeleted($ownMission);       // sa propre mission est bien supprimée
    }

    public function test_entreprise_ne_voit_pas_les_candidats_retenus_ni_le_wallet_dune_autre(): void
    {
        $this->makeOffer($this->mission);

        $this->withHeaders($this->bearerFor($this->attacker->user))
            ->getJson("/api/entreprise/confirmed-applicants/{$this->mission->id}")
            ->assertStatus(404);
    }

    public function test_entreprise_ne_peut_pas_modifier_le_profil_dune_autre(): void
    {
        $headers = $this->bearerFor($this->attacker->user);

        $this->withHeaders($headers)
            ->postJson("/api/entreprise/infos/{$this->owner->id}", ['nom_entreprise' => 'Piratée'])
            ->assertStatus(403);
        $this->withHeaders($headers)
            ->postJson("/api/entreprise/contact/{$this->owner->id}", ['telephone' => '0000'])
            ->assertStatus(403);

        $this->assertNotSame('Piratée', $this->owner->fresh()->nom_entreprise);
    }

    public function test_entreprise_ne_voit_pas_les_propositions_dune_autre_et_ne_propose_pas_en_son_nom(): void
    {
        $headers = $this->bearerFor($this->attacker->user);
        $candidat = Candidat::factory()->create();

        $this->withHeaders($headers)->getJson("/api/missions/{$this->mission->id}/proposals")->assertStatus(403);

        $this->withHeaders($headers)->postJson('/api/offers/send-proposal-email', [
            'candidat_id' => $candidat->id,
            'mission_id' => $this->mission->id,
            'subject' => 'Proposition',
            'content' => 'Une proposition au nom d\'une autre entreprise',
        ])->assertStatus(403);

        $this->assertSame(0, MissionProposal::count());
    }

    public function test_entreprise_peut_toujours_gerer_ses_propres_missions(): void
    {
        $headers = $this->bearerFor($this->owner->user);

        $this->withHeaders($headers)->getJson("/api/missions/{$this->mission->id}")->assertOk();
        $this->withHeaders($headers)->putJson("/api/missions/{$this->mission->id}", $this->validMissionPayload())->assertOk();

        $this->assertSame('Titre pirate', $this->mission->fresh()->title);
    }

    private function validMissionPayload(): array
    {
        return [
            'title' => 'Titre pirate',
            'company' => 'ACME',
            'location' => 'Cotonou',
            'reward' => 20000,
            'deadline' => now()->addWeek()->toDateString(),
            'description' => 'Une description suffisamment longue.',
            'skills' => ['Excel'],
            'urgency' => 'normal',
            'category' => 'Digital',
            'min_rank_required' => 'E',
            'test_severity' => 'standard',
            'type_contrat' => 'Mission Ponctuelle',
        ];
    }
}
