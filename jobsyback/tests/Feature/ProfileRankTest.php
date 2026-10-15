<?php

namespace Tests\Feature;

use App\Models\{Candidat, CvDatas, Rank, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * M2 — le rang déduit du CV est appliqué à la validation du profil, uniquement à la hausse et sans perte d'XP.
 */
class ProfileRankTest extends TestCase
{
    use RefreshDatabase;

    private function candidatWithCv(string $degree, string $rankCode = 'E', int $score = 0): Candidat
    {
        $candidat = Candidat::factory()->create([
            'rank_id' => Rank::where('rank', $rankCode)->value('id'),
            'score' => $score,
        ]);

        CvDatas::create([
            'candidat_id' => $candidat->id,
            'raw_ai_data' => [
                'Title' => 'Développeur web',
                'Education' => [
                    ['Degree' => 'Baccalauréat série D', 'Duration' => '2018 - 2019'],
                    ['Degree' => $degree, 'Duration' => '2020 - 2023'],
                ],
            ],
        ]);

        return $candidat;
    }

    public function test_la_validation_admin_applique_le_rang_du_dernier_diplome(): void
    {
        $candidat = $this->candidatWithCv('Licence en informatique', 'E', 900);
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $this->withHeaders($this->bearerFor($admin))
            ->postJson("/api/infoProfileCandidat/{$candidat->id}/validate")
            ->assertOk()
            ->assertJsonPath('data.rank.rank', 'B')
            ->assertJsonPath('data.is_validate', true);

        $candidat->refresh();
        $this->assertSame('Licence en informatique', $candidat->niveau_etude);
        $this->assertEquals(1500, $candidat->score); // seuil du rang B, l'XP précédente (900) étant inférieure
    }

    public function test_le_rang_n_est_jamais_retrograde_et_l_xp_est_conservee(): void
    {
        $candidat = $this->candidatWithCv('BTS Comptabilité', 'A', 4200);
        $candidat->forceFill(['is_validate' => true])->save();

        $this->withHeaders($this->bearerFor($candidat->user))
            ->getJson('/api/candidat/profile-elements')
            ->assertOk()
            ->assertJsonPath('data.rank.rank', 'A');

        $this->assertEquals(4200, $candidat->fresh()->score);
    }

    public function test_un_profil_non_valide_reste_au_rang_e(): void
    {
        $candidat = $this->candidatWithCv('Master en finance');

        $this->withHeaders($this->bearerFor($candidat->user))
            ->getJson('/api/candidat/profile-elements')
            ->assertOk()
            ->assertJsonPath('data.rank.rank', 'E');
    }

    public function test_seul_un_admin_peut_valider_un_profil(): void
    {
        $candidat = $this->candidatWithCv('Master en finance');

        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/infoProfileCandidat/{$candidat->id}/validate")
            ->assertStatus(403);

        $this->assertFalse($candidat->fresh()->is_validate);
    }
}
