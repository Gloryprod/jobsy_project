<?php

namespace Tests\Feature;

use App\Models\{Entreprise, Mission, Candidat, Application};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MissionAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_entreprise_ne_peut_pas_voir_les_candidatures_dune_mission_qui_ne_lui_appartient_pas(): void
    {
        $entrepriseA = Entreprise::factory()->create();
        $entrepriseB = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entrepriseA->id]);

        $response = $this->withHeaders($this->bearerFor($entrepriseB->user))
            ->getJson("/api/missions/{$mission->id}/applications"); // ← chemin corrigé

        $response->assertStatus(403);
    }

    public function test_entreprise_ne_peut_pas_selectionner_un_candidat_sur_une_mission_qui_ne_lui_appartient_pas(): void
    {
        $entrepriseA = Entreprise::factory()->create();
        $entrepriseB = Entreprise::factory()->create(); // l'attaquant
        $candidat = Candidat::factory()->create();

        $mission = Mission::factory()->create(['entreprise_id' => $entrepriseA->id]);
        $application = Application::create([
            'mission_id' => $mission->id,
            'candidat_id' => $candidat->id,
            'status' => 'pending',
        ]);

        $response = $this->withHeaders($this->bearerFor($entrepriseB->user))
            ->postJson("/api/entreprise/applications/{$application->id}/select", []);

        $response->assertStatus(403);
        $this->assertSame('pending', $application->fresh()->status); // pas modifié par l'attaquant
    }
}