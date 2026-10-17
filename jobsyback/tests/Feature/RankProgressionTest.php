<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\Rank;
use App\Notifications\RankPromotedNotification;
use App\Services\RankService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Le rang suit l'expérience réelle : il monte quand le score atteint le seuil d'un rang supérieur
 * (E 0, D 300, C 800, B 1500, A 3000, S 5000), ne descend jamais, et le candidat est prévenu.
 */
class RankProgressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Notification::fake();
    }

    private function candidat(string $rang, int $score): Candidat
    {
        $candidat = Candidat::factory()->create();
        $candidat->update(['rank_id' => Rank::where('rank', $rang)->value('id'), 'score' => $score]);

        return $candidat->fresh();
    }

    public function test_le_score_atteint_le_seuil_du_rang_suivant(): void
    {
        $candidat = $this->candidat('E', 350);

        $this->assertTrue(app(RankService::class)->syncRankWithScore($candidat));

        $this->assertSame('D', $candidat->fresh()->rank->rank);
        Notification::assertSentTo($candidat->user, RankPromotedNotification::class, function ($notification) {
            return $notification->ancienRang === 'E' && $notification->nouveauRang === 'D' && $notification->score === 350;
        });
    }

    public function test_le_rang_ne_bouge_pas_sous_le_seuil(): void
    {
        $candidat = $this->candidat('D', 799);

        $this->assertFalse(app(RankService::class)->syncRankWithScore($candidat));

        $this->assertSame('D', $candidat->fresh()->rank->rank);
        Notification::assertNothingSent();
    }

    public function test_un_rang_obtenu_par_diplome_ne_descend_jamais(): void
    {
        // Rang B donné par le diplôme, avec un score inférieur au seuil de B
        $candidat = $this->candidat('B', 900);

        $this->assertFalse(app(RankService::class)->syncRankWithScore($candidat));

        $this->assertSame('B', $candidat->fresh()->rank->rank);
        Notification::assertNothingSent();
    }

    public function test_un_gros_gain_peut_sauter_plusieurs_rangs_jusqu_au_rang_s(): void
    {
        $candidat = $this->candidat('D', 9000);

        app(RankService::class)->syncRankWithScore($candidat);

        $this->assertSame('S', $candidat->fresh()->rank->rank);
    }

    public function test_la_validation_d_une_mission_fait_monter_de_rang(): void
    {
        Mail::fake();
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 15000]);
        $candidat = $this->candidat('E', 100);
        $offer = $this->makeOffer($mission, $candidat);
        $this->walletFor($entreprise, balance: 50000);
        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $offer->id])->assertOk();
        $offer->update(['status' => 'work_finished']);
        $this->withHeaders($headers)
            ->postJson("/api/mission-offers/{$offer->id}/update-status", ['status' => 'validated', 'rating' => 5])
            ->assertOk();

        $candidat->refresh();
        $this->assertSame(350, (int) $candidat->score);   // 100 + 250
        $this->assertSame('D', $candidat->rank->rank);
        Notification::assertSentTo($candidat->user, RankPromotedNotification::class);
    }

    public function test_la_certification_d_une_formation_fait_monter_de_rang(): void
    {
        $candidat = $this->candidat('E', 0);
        $formation = Course::create([
            'title' => 'Savoir-être en entreprise',
            'description' => 'Formation de test.',
            'validation_mode' => 'A',
            'reward_xp' => 400,
            'is_active' => true,
        ]);
        $inscription = Enrollment::create([
            'candidat_id' => $candidat->id,
            'course_id' => $formation->id,
            'status' => 'evaluation_ready',
            'progress_percentage' => 100,
        ]);

        $inscription->updateLearnerGlobalScore(true);

        $candidat->refresh();
        $this->assertSame(400, (int) $candidat->score);
        $this->assertSame('D', $candidat->rank->rank);
    }
}
