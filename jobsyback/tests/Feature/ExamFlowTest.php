<?php

namespace Tests\Feature;

use App\Models\{Candidat, Course, Enrollment, ExamProjects, FinalExamQuestion, FinalExamResults, Lesson, Module, QuizQuestion, User, UserExamSession};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * M5 à M8 — formations et examens : tentatives, échelle de notation, limites de temps, quiz, progression.
 */
class ExamFlowTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private Course $course;
    private Module $module;
    private ExamProjects $project;
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        Mail::fake();
        $this->candidat = Candidat::factory()->create();
        $this->course = Course::create(['title' => 'Développement web', 'validation_mode' => 'C', 'type_contenu' => 'Digital']);
        $this->module = Module::create(['course_id' => $this->course->id, 'title' => 'Bases', 'order' => 1]);
        Lesson::create(['module_id' => $this->module->id, 'title' => 'Intro', 'type' => 'text', 'content' => '<p>Cours</p>']);
        QuizQuestion::create([
            'module_id' => $this->module->id,
            'question_text' => 'Langage du web ?',
            'options' => ['HTML', 'COBOL'],
            'correct_answers' => ['HTML'],
            'points' => 10,
        ]);
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

    private function enroll(int $progress = 100, string $status = 'evaluation_ready'): Enrollment
    {
        return Enrollment::create([
            'candidat_id' => $this->candidat->id,
            'course_id' => $this->course->id,
            'progress_percentage' => $progress,
            'status' => $status,
        ]);
    }

    private function review(UserExamSession $session, float $score): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $this->withHeaders($this->bearerFor($admin))
            ->postJson("/api/exam-submissions/{$session->id}/review", ['score' => $score])
            ->assertOk();
        $this->headers = $this->bearerFor($this->candidat->user);
    }

    private function startAndSubmit(): UserExamSession
    {
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$this->project->id}")->assertSuccessful();
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}", ['answers' => ['lien' => 'https://exemple.bj']])
            ->assertCreated();

        return UserExamSession::where('candidat_id', $this->candidat->id)->firstOrFail();
    }

    public function test_le_projet_exige_d_avoir_termine_les_modules(): void
    {
        $this->enroll(progress: 50, status: 'learning');

        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$this->project->id}")->assertStatus(403);
        $this->assertSame(0, UserExamSession::count());
    }

    public function test_deux_tentatives_exactement_avec_un_delai_de_24h(): void
    {
        $this->enroll();

        // Tentative 1 échouée : pas de blocage définitif
        $session = $this->startAndSubmit();
        $this->review($session, 8);
        $this->assertFalse($session->fresh()->is_blocked);

        // Démarrer une nouvelle session à côté ne contourne pas la limite
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$this->project->id}")->assertStatus(409);
        $this->assertSame(1, UserExamSession::count());

        // Relance trop tôt : refusée
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/{$session->id}/retry")->assertStatus(429);

        // Après 24 h : tentative 2 autorisée
        $this->travel(25)->hours();
        $this->headers = $this->bearerFor($this->candidat->user); // le token d'accès (30 min) a expiré entre-temps
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/{$session->id}/retry")->assertOk();
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}", ['answers' => ['lien' => 'https://exemple.bj/v2']])
            ->assertCreated();

        // Tentative 2 échouée : blocage définitif
        $this->review($session->fresh(), 9);
        $this->assertTrue($session->fresh()->is_blocked);

        $this->travel(25)->hours();
        $this->headers = $this->bearerFor($this->candidat->user); // le token d'accès (30 min) a expiré entre-temps
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/{$session->id}/retry")->assertStatus(403);
    }

    public function test_une_session_echouee_ne_peut_pas_etre_resoumise_sans_relance(): void
    {
        $this->enroll();
        $session = $this->startAndSubmit();
        $this->review($session, 5);

        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}", ['answers' => ['lien' => 'https://triche.bj']])
            ->assertStatus(422);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}/auto-submit", ['answers' => ['lien' => 'https://triche.bj']])
            ->assertStatus(422);

        $this->assertSame('failed', $session->fresh()->status);
    }

    public function test_la_note_est_sur_20_et_la_reussite_donne_le_certificat(): void
    {
        $enrollment = $this->enroll();
        $session = $this->startAndSubmit();

        $admin = User::factory()->create(['role' => 'ADMIN']);
        $this->withHeaders($this->bearerFor($admin))
            ->postJson("/api/exam-submissions/{$session->id}/review", ['score' => 85])
            ->assertStatus(422); // plus de note sur 100

        $this->review($session, 16);

        $enrollment->refresh();
        $this->assertSame('certified', $enrollment->status);
        $this->assertEquals(64, $enrollment->global_score); // 80 % × (16/20 × 100) + 20 % × quiz (0)
    }

    public function test_la_note_de_passage_d_un_projet_se_saisit_sur_20(): void
    {
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $payload = [
            'title' => 'Projet',
            'domain' => 'Web',
            'context_rich_text' => '<p>Contexte</p>',
            'inputs_schema' => [['key' => 'lien', 'type' => 'url', 'label' => 'Lien', 'required' => true]],
            'evaluation_criteria' => [['name' => 'Qualité', 'max_points' => 20]],
            'passing_score' => 70,
        ];
        $other = Course::create(['title' => 'Autre', 'validation_mode' => 'C']);

        $this->withHeaders($this->bearerFor($admin))->postJson("/api/exam-projects/{$other->id}", $payload)->assertStatus(422);
        $this->withHeaders($this->bearerFor($admin))->postJson("/api/exam-projects/{$other->id}", ['passing_score' => 14] + $payload)->assertCreated();
    }

    public function test_apres_le_temps_imparti_seul_le_brouillon_enregistre_a_temps_est_retenu(): void
    {
        $this->enroll();
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$this->project->id}")->assertCreated();
        $session = UserExamSession::firstOrFail();

        $this->withHeaders($this->headers)
            ->patchJson("/api/exam-sessions/{$session->id}/draft", ['answers' => ['lien' => 'https://brouillon.bj']])
            ->assertOk();

        // 60 min + 30 min de grâce + marge réseau dépassées
        $this->travel(95)->minutes();
        $this->headers = $this->bearerFor($this->candidat->user);

        $this->withHeaders($this->headers)
            ->patchJson("/api/exam-sessions/{$session->id}/draft", ['answers' => ['lien' => 'https://apres-coup.bj']])
            ->assertStatus(422);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}", ['answers' => ['lien' => 'https://apres-coup.bj']])
            ->assertStatus(422);
        $this->withHeaders($this->headers)
            ->postJson("/api/exam-submissions/{$this->project->id}/auto-submit", ['answers' => ['lien' => 'https://apres-coup.bj']])
            ->assertOk();

        $session->refresh();
        $this->assertSame('submitted', $session->status);
        $this->assertSame('https://brouillon.bj', $session->submitted_data['lien']);
    }

    public function test_le_quiz_ne_revele_les_reponses_qu_apres_reussite(): void
    {
        $this->enroll(progress: 0, status: 'learning');
        $question = QuizQuestion::firstOrFail();
        $url = "/api/candidat/modules/{$this->module->id}/submit-quiz";

        $failed = $this->withHeaders($this->headers)
            ->postJson($url, ['course_id' => $this->course->id, 'answers' => [$question->id => ['COBOL']]])
            ->assertOk();
        $failed->assertJsonPath('data.is_passed', false)->assertJsonPath('data.corrections', []);

        $passed = $this->withHeaders($this->headers)
            ->postJson($url, ['course_id' => $this->course->id, 'answers' => [$question->id => ['HTML']]])
            ->assertOk();
        $passed->assertJsonPath('data.is_passed', true)
            ->assertJsonPath("data.corrections.{$question->id}.is_correct", true);
    }

    public function test_le_quiz_d_une_formation_non_suivie_est_refuse(): void
    {
        $question = QuizQuestion::firstOrFail();

        $this->withHeaders($this->headers)
            ->postJson("/api/candidat/modules/{$this->module->id}/submit-quiz", ['course_id' => $this->course->id, 'answers' => [$question->id => ['HTML']]])
            ->assertStatus(403);
    }

    public function test_la_progression_atteint_100_et_ne_retire_pas_la_certification(): void
    {
        // Un module sans quiz ne bloque plus la progression
        $sansQuiz = Module::create(['course_id' => $this->course->id, 'title' => 'Lecture seule', 'order' => 2]);
        $lecture = Lesson::create(['module_id' => $sansQuiz->id, 'title' => 'Lecture', 'type' => 'text', 'content' => 'x']);
        $enrollment = $this->enroll(progress: 0, status: 'learning');

        foreach (Lesson::all() as $lesson) {
            $this->withHeaders($this->headers)
                ->postJson('/api/candidat/formations/lessons/complete', ['lesson_id' => $lesson->id, 'course_id' => $this->course->id])
                ->assertOk();
        }
        $question = QuizQuestion::firstOrFail();
        $this->withHeaders($this->headers)
            ->postJson("/api/candidat/modules/{$this->module->id}/submit-quiz", ['course_id' => $this->course->id, 'answers' => [$question->id => ['HTML']]])
            ->assertOk();

        $this->assertEquals(100, $enrollment->fresh()->progress_percentage);

        // Revoir une leçon après certification : le certificat reste valide
        $enrollment->update(['status' => 'certified', 'certificate_hash' => 'hash-test', 'certified_at' => now()]);
        $this->withHeaders($this->headers)
            ->postJson('/api/candidat/formations/lessons/complete', ['lesson_id' => $lecture->id, 'course_id' => $this->course->id])
            ->assertOk();

        $this->assertSame('certified', $enrollment->fresh()->status);
        $this->getJson('/api/certificates/verify/hash-test')->assertOk()->assertJsonPath('status', 'valid');
    }

    public function test_l_examen_final_est_reserve_aux_inscrits_et_ne_se_repasse_pas_apres_reussite(): void
    {
        $courseA = Course::create(['title' => 'Bureautique', 'validation_mode' => 'A']);
        Module::create(['course_id' => $courseA->id, 'title' => 'M1', 'order' => 1]);
        $q = FinalExamQuestion::create(['course_id' => $courseA->id, 'question_text' => 'Q', 'options' => ['a', 'b'], 'correct_answers' => ['a'], 'points' => 1]);

        $this->withHeaders($this->headers)
            ->postJson("/api/final-exam/{$courseA->id}/submit", ['answers' => [$q->id => ['a']]])
            ->assertStatus(403);

        Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $courseA->id, 'progress_percentage' => 100, 'status' => 'evaluation_ready']);
        FinalExamResults::create(['candidat_id' => $this->candidat->id, 'course_id' => $courseA->id, 'score' => 90, 'is_passed' => true]);

        $this->withHeaders($this->headers)
            ->postJson("/api/final-exam/{$courseA->id}/submit", ['answers' => [$q->id => ['b']]])
            ->assertStatus(409);
    }
}
