<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, Entreprise, Mission, Rank};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Candidats suggérés pour une mission : seulement ceux qui peuvent y postuler (rang suffisant)
 * et qui n'y ont pas déjà postulé, avec leur rang.
 */
class MatchingRangTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_suggestions_respectent_le_rang_minimum_et_ecartent_les_candidats_deja_la(): void
    {
        $entreprise = Entreprise::factory()->create();
        // Sans compétence exigée, tout candidat obtient 100 : seul le filtrage est testé
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'min_rank_required' => 'C', 'skills' => []]);
        $rang = fn (string $lettre) => Rank::where('rank', $lettre)->firstOrFail()->id;

        $trop_bas = Candidat::factory()->create(['rank_id' => $rang('E')]);
        $eligible = Candidat::factory()->create(['rank_id' => $rang('B')]);
        $deja_candidat = Candidat::factory()->create(['rank_id' => $rang('A')]);
        $brouillon = Candidat::factory()->create(['rank_id' => $rang('C')]);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => $deja_candidat->id, 'status' => 'pending']);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => $brouillon->id, 'status' => 'draft']);

        $reponse = $this->withHeaders($this->bearerFor($entreprise->user))
            ->getJson("/api/missions/{$mission->id}/suggested-candidates")
            ->assertOk();

        $ids = collect($reponse->json('candidates'))->pluck('id')->sort()->values()->all();
        $this->assertSame(collect([$eligible->id, $brouillon->id])->sort()->values()->all(), $ids);
        $this->assertNotContains($trop_bas->id, $ids);
        $this->assertSame('B', collect($reponse->json('candidates'))->firstWhere('id', $eligible->id)['rank']['rank']);
    }
}
