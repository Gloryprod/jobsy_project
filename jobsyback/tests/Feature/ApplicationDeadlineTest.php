<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidat;
use App\Models\Mission;
use App\Models\Rank;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

/**
 * Une candidature se démarre et s'envoie avant la fin du jour limite de la mission (date sans heure).
 * Une candidature déjà reçue à temps peut encore compléter son étape technique.
 */
class ApplicationDeadlineTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // IA indisponible : l'API sert ses questions de secours. La notation en file n'est pas exécutée.
        Http::fake(['*' => Http::response(['error' => 'indisponible'], 429)]);
        Queue::fake();
    }

    private function candidat(string $rang = 'E'): Candidat
    {
        return Candidat::factory()->create(['rank_id' => Rank::where('rank', $rang)->value('id')]);
    }

    private function mission(string $dateLimite, string $contrat = 'Mission Ponctuelle'): Mission
    {
        return Mission::factory()->create(['min_rank_required' => 'E', 'deadline' => $dateLimite, 'type_contrat' => $contrat]);
    }

    private function demarrer(Candidat $candidat, Mission $mission)
    {
        return $this->withHeaders($this->bearerFor($candidat->user))->postJson("/api/start_application/{$candidat->id}/{$mission->id}");
    }

    public function test_impossible_de_demarrer_une_candidature_apres_la_date_limite(): void
    {
        $candidat = $this->candidat();
        $mission = $this->mission(now()->subDay()->toDateString());

        $this->demarrer($candidat, $mission)
            ->assertStatus(410)
            ->assertJsonPath('message', "La date limite de cette mission est passée : elle n'accepte plus de candidatures.");

        $this->assertSame(0, Application::count());
    }

    public function test_le_jour_limite_la_candidature_est_encore_possible(): void
    {
        $candidat = $this->candidat();
        $mission = $this->mission(now()->toDateString());

        $this->demarrer($candidat, $mission)->assertOk();
    }

    public function test_un_brouillon_ne_peut_plus_etre_envoye_apres_la_date_limite(): void
    {
        $candidat = $this->candidat();
        $mission = $this->mission(now()->toDateString());
        $this->demarrer($candidat, $mission)->assertOk();
        $application = Application::firstOrFail();

        $this->travel(1)->days();

        // Nouveau jeton : celui d'avant a expiré pendant le saut dans le temps
        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/applications/{$application->id}/submit-step-one", ['responses' => ['1' => 'Je suis disponible et motivé.']])
            ->assertStatus(410);

        $this->assertSame('draft', $application->fresh()->status);
    }

    public function test_une_candidature_recue_a_temps_peut_completer_son_etape_technique(): void
    {
        // Rang C sur une mission ponctuelle : la candidature est reçue dès l'étape 1, l'étape 2 affine la note
        $candidat = $this->candidat('C');
        $mission = $this->mission(now()->toDateString());
        $this->demarrer($candidat, $mission)->assertOk();
        $application = Application::firstOrFail();
        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/applications/{$application->id}/submit-step-one", ['responses' => ['1' => 'Motivé.']])
            ->assertOk();
        $this->assertSame('pending', $application->fresh()->status);

        $this->travel(1)->days();

        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/applications/{$application->id}/finalize", ['responses' => ['1' => 'Réponse technique.']])
            ->assertOk();
    }

    public function test_un_cdd_non_envoye_a_temps_ne_peut_plus_etre_finalise(): void
    {
        // Rang C sur un CDD : la candidature reste un brouillon jusqu'à l'étape technique
        $candidat = $this->candidat('C');
        $mission = $this->mission(now()->toDateString(), 'CDD');
        $this->demarrer($candidat, $mission)->assertOk();
        $application = Application::firstOrFail();
        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/applications/{$application->id}/submit-step-one", ['responses' => ['1' => 'Motivé.']])
            ->assertOk();
        $this->assertSame('draft', $application->fresh()->status);

        $this->travel(1)->days();

        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson("/api/applications/{$application->id}/finalize", ['responses' => ['1' => 'Réponse technique.']])
            ->assertStatus(410);

        $this->assertSame('draft', $application->fresh()->status);
    }
}
