<?php

namespace Tests\Feature;

use App\Models\{Candidat, Entreprise, Mission};
use App\Notifications\{CandidateReminderNotification, CompanyReminderNotification};
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * M3 — les relances sont bien planifiées et ne partent qu'une fois par offre, même si la commande tourne toutes les heures.
 */
class ReminderCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_la_commande_de_relance_est_planifiee(): void
    {
        $commands = collect(app(Schedule::class)->events())->map->command->implode(' ');

        $this->assertStringContainsString('app:remind-pending-candidates', $commands);
    }

    public function test_chaque_candidat_et_chaque_entreprise_ne_sont_relances_qu_une_fois(): void
    {
        Notification::fake();
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $candidat = Candidat::factory()->create();

        $bientot = $this->makeOffer($mission, $candidat, ['expires_at' => now()->addHours(3), 'status' => null]);
        $this->makeOffer($mission, null, ['expires_at' => now()->subHours(2), 'status' => null]);
        $this->makeOffer($mission, null, ['expires_at' => now()->subHours(3), 'status' => null]);

        // Trois passages horaires
        $this->artisan('app:remind-pending-candidates')->assertSuccessful();
        $this->artisan('app:remind-pending-candidates')->assertSuccessful();
        $this->artisan('app:remind-pending-candidates')->assertSuccessful();

        Notification::assertSentToTimes($candidat->user, CandidateReminderNotification::class, 1);
        Notification::assertSentToTimes($entreprise->user, CompanyReminderNotification::class, 1);
        $this->assertNotNull($bientot->fresh()->candidate_reminded_at);
    }

    public function test_une_offre_deja_acceptee_n_est_pas_relancee(): void
    {
        Notification::fake();
        $mission = Mission::factory()->create();
        $candidat = Candidat::factory()->create();
        $this->makeOffer($mission, $candidat, ['expires_at' => now()->addHours(2), 'accepted_at' => now()]);

        $this->artisan('app:remind-pending-candidates')->assertSuccessful();

        Notification::assertNotSentTo($candidat->user, CandidateReminderNotification::class);
    }
}
