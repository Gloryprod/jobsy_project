<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Rank;
use App\Notifications\RankPromotedNotification;
use App\Services\RankService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Lot 4c — réévaluation de rang : la notification est enregistrée même sans worker de file d'attente,
 * et le candidat peut marquer une seule notification comme lue.
 */
class RankReevaluationTest extends TestCase
{
    use RefreshDatabase;

    private function candidat(string $rang, int $score): Candidat
    {
        $candidat = Candidat::factory()->create();
        $candidat->update(['rank_id' => Rank::where('rank', $rang)->value('id'), 'score' => $score]);

        return $candidat->fresh();
    }

    public function test_la_promotion_est_enregistree_sans_file_d_attente(): void
    {
        // Aucun worker : un job mis en file ne s'exécuterait jamais
        Queue::fake();
        $candidat = $this->candidat('E', 350);

        app(RankService::class)->syncRankWithScore($candidat);

        $notification = $candidat->user->notifications()->firstOrFail();
        $this->assertSame(RankPromotedNotification::class, $notification->type);
        $this->assertSame('rank_promoted', $notification->data['type']);
        $this->assertSame('E', $notification->data['previous_rank']);
        $this->assertSame('D', $notification->data['rank']);
    }

    public function test_une_seule_notification_est_marquee_comme_lue(): void
    {
        $candidat = $this->candidat('E', 350);
        app(RankService::class)->syncRankWithScore($candidat);
        $candidat->update(['score' => 900]);
        app(RankService::class)->syncRankWithScore($candidat->fresh());

        [$premiere, $seconde] = $candidat->user->notifications()->oldest()->get()->all();

        $this->withHeaders($this->bearerFor($candidat->user))
            ->patchJson("/api/candidat/notifications/{$seconde->id}/read")
            ->assertOk();

        $this->assertNotNull($seconde->fresh()->read_at);
        $this->assertNull($premiere->fresh()->read_at);
    }

    public function test_la_notification_d_un_autre_est_introuvable(): void
    {
        $proprietaire = $this->candidat('E', 350);
        app(RankService::class)->syncRankWithScore($proprietaire);
        $notification = $proprietaire->user->notifications()->firstOrFail();

        $intrus = $this->candidat('E', 0);
        $this->withHeaders($this->bearerFor($intrus->user))
            ->patchJson("/api/candidat/notifications/{$notification->id}/read")
            ->assertNotFound();

        $this->assertNull($notification->fresh()->read_at);
    }
}
