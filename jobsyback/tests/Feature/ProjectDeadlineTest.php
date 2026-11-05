<?php

namespace Tests\Feature;

use App\Models\{Candidat, Course, Enrollment, ExamProjects, FinalExamResults, UserExamSession};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Lot 3b-B2 — projet pratique : sujet réservé aux inscrits, échéances données par le serveur,
 * et aucune tentative perdue avant la fin de la période de grâce (téléphone mal réglé).
 */
class ProjectDeadlineTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private Course $course;
    private ExamProjects $project;
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->candidat = Candidat::factory()->create();
        $this->course = Course::create(['title' => 'Développement web', 'validation_mode' => 'C', 'type_contenu' => 'Digital']);
        $this->project = ExamProjects::create([
            'course_id' => $this->course->id,
            'title' => 'Projet final',
            'domain' => 'Web',
            'context_rich_text' => '<p>Réalisez une page</p>',
            'inputs_schema' => [['key' => 'lien', 'type' => 'url', 'label' => 'Lien', 'required' => true]],
            'evaluation_criteria' => [['name' => 'Qualité', 'max_points' => 20]],
            'passing_score' => 12,
            'time_limit_minutes' => 60,
        ]);
        $this->headers = $this->bearerFor($this->candidat->user);
    }

    private function enroll(): void
    {
        Enrollment::create([
            'candidat_id' => $this->candidat->id,
            'course_id' => $this->course->id,
            'progress_percentage' => 100,
            'status' => 'evaluation_ready',
        ]);
    }

    private function start(): UserExamSession
    {
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$this->project->id}")->assertCreated();

        return UserExamSession::firstOrFail();
    }

    /** Avance l'horloge du serveur ; le jeton est recréé pour rester valide. */
    private function avancer(int $minutes): void
    {
        $this->travel($minutes)->minutes();
        $this->headers = $this->bearerFor($this->candidat->user);
    }

    public function test_le_sujet_du_projet_est_reserve_aux_inscrits(): void
    {
        $this->withHeaders($this->headers)
            ->getJson("/api/exam-submissions/project/{$this->course->id}")
            ->assertForbidden()
            ->assertJsonMissingPath('project');

        $this->enroll();

        $this->withHeaders($this->headers)
            ->getJson("/api/exam-submissions/project/{$this->course->id}")
            ->assertOk()
            ->assertJsonPath('project.title', 'Projet final')
            ->assertJsonPath('grace_minutes', UserExamSession::GRACE_MINUTES)
            ->assertJsonPath('max_attempts', UserExamSession::MAX_ATTEMPTS)
            ->assertJsonPath('ends_at', null)
            ->assertJsonPath('grace_ends_at', null)
            ->assertJsonStructure(['server_time']);
    }

    public function test_les_echeances_d_une_session_en_cours_viennent_du_serveur(): void
    {
        $this->freezeSecond();
        $this->enroll();
        $session = $this->start();

        $reponse = $this->withHeaders($this->headers)
            ->getJson("/api/exam-submissions/project/{$this->course->id}")
            ->assertOk();

        $debut = $session->started_at;
        $this->assertTrue($debut->copy()->addMinutes(60)->equalTo($reponse->json('ends_at')));
        $this->assertTrue($debut->copy()->addMinutes(60 + UserExamSession::GRACE_MINUTES)->equalTo($reponse->json('grace_ends_at')));
        $this->assertTrue(now()->equalTo($reponse->json('server_time')));
    }

    public function test_la_copie_blanche_est_refusee_avant_la_fin_de_la_grace(): void
    {
        $this->enroll();
        $session = $this->start();

        // Téléphone en avance : l'écran croit le temps écoulé dès le démarrage
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-sessions/{$session->id}/mark-failed-empty")
            ->assertStatus(422);

        // Pendant la grâce : la tentative continue
        $this->avancer(61);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-sessions/{$session->id}/mark-failed-empty")
            ->assertStatus(422);

        $this->assertSame('in_progress', $session->fresh()->status);
        $this->assertSame(0, FinalExamResults::count());

        // Grâce terminée : la copie blanche est enregistrée
        $this->avancer(30);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-sessions/{$session->id}/mark-failed-empty")
            ->assertOk();

        $this->assertSame('failed', $session->fresh()->status);
    }

    public function test_l_envoi_automatique_est_refuse_avant_la_fin_de_la_grace(): void
    {
        $this->enroll();
        $session = $this->start();
        $this->withHeaders($this->headers)
            ->patchJson("/api/exam-sessions/{$session->id}/draft", ['answers' => ['lien' => 'https://brouillon.bj']])
            ->assertOk();

        $this->avancer(10);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}/auto-submit", ['answers' => ['lien' => 'https://brouillon.bj']])
            ->assertStatus(422)
            ->assertJsonStructure(['message', 'grace_ends_at']);

        $this->assertSame('in_progress', $session->fresh()->status);

        // À la fin exacte de la grâce, l'envoi automatique part avec les dernières réponses
        $this->avancer(80);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}/auto-submit", ['answers' => ['lien' => 'https://final.bj']])
            ->assertOk();

        $session->refresh();
        $this->assertSame('submitted', $session->status);
        $this->assertSame('https://final.bj', $session->submitted_data['lien']);
    }

    public function test_la_copie_blanche_est_refusee_sans_limite_de_temps(): void
    {
        $this->project->update(['time_limit_minutes' => null]);
        $this->enroll();
        $session = $this->start();

        $this->avancer(600);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-sessions/{$session->id}/mark-failed-empty")
            ->assertStatus(422);

        $this->assertSame('in_progress', $session->fresh()->status);
    }

    public function test_un_refus_de_validation_donne_un_message_lisible(): void
    {
        Storage::fake('public');
        $this->enroll();
        $this->start();

        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}", ['answers' => ['lien' => 'pas un lien']])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Le champ "Lien" doit être une URL valide.')
            ->assertJsonValidationErrors(['answers.lien']);

        $this->withHeaders($this->headers)
            ->post('/api/upload-temp-file', ['file' => UploadedFile::fake()->create('notes.txt', 10, 'text/plain')], ['Accept' => 'application/json'])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Formats acceptés : PDF, ZIP, RAR, PNG, JPG, JPEG.');
    }
}
