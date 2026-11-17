<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, Entreprise, Mission, Rank};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Tableau de bord de l'entreprise (GET /api/index) : rang des candidats affiché,
 * fiche du candidat limitée à ce que la liste montre, recrutés comptés à part des candidatures.
 */
class EntrepriseDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_candidatures_a_traiter_donnent_le_rang_sans_la_fiche_complete(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $rangB = Rank::where('rank', 'B')->firstOrFail();
        $candidat = Candidat::factory()->create(['rank_id' => $rangB->id, 'ville' => 'Parakou', 'adresse' => 'Rue 12', 'date_naissance' => '2001-05-04']);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => $candidat->id, 'status' => 'pending']);

        $reponse = $this->withHeaders($this->bearerFor($entreprise->user))->getJson('/api/index')->assertOk();

        $reponse->assertJsonPath('data.candidatures_a_chaud.0.candidat.rank.rank', 'B')
            ->assertJsonPath('data.candidatures_a_chaud.0.candidat.rank.code_hexa', $rangB->code_hexa)
            ->assertJsonPath('data.candidatures_a_chaud.0.candidat.ville', 'Parakou')
            ->assertJsonPath('data.candidatures_a_chaud.0.candidat.user.nom', $candidat->user->nom)
            ->assertJsonPath('data.candidatures_a_chaud.0.mission.title', $mission->title);

        $fiche = $reponse->json('data.candidatures_a_chaud.0.candidat');
        $this->assertArrayNotHasKey('adresse', $fiche);
        $this->assertArrayNotHasKey('date_naissance', $fiche);
        $this->assertArrayNotHasKey('email', $fiche['user']);
    }

    public function test_les_missions_terminees_comptent_les_recrutes_a_part_des_candidatures(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $this->makeOffer($mission, null, ['status' => 'completed']);
        $this->makeOffer($mission, null, ['status' => 'in_progress']);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => Candidat::factory()->create()->id, 'status' => 'rejected']);

        $this->withHeaders($this->bearerFor($entreprise->user))->getJson('/api/index')
            ->assertOk()
            ->assertJsonPath('data.missions_terminees.0.id', $mission->id)
            ->assertJsonPath('data.missions_terminees.0.applications_count', 3)
            ->assertJsonPath('data.missions_terminees.0.hired_count', 1);
    }
}
