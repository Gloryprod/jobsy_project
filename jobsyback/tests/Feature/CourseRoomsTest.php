<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\QuizQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Les salles de l'espace de formation : chaque question de quiz dit si plusieurs réponses sont attendues,
 * le seuil est annoncé, et les leçons d'une formation à kit restent fermées tant que le kit n'est pas livré.
 */
class CourseRoomsTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private Course $course;
    private Lesson $lecon;

    protected function setUp(): void
    {
        parent::setUp();

        $this->candidat = Candidat::factory()->create();
        $this->course = Course::create(['title' => 'Préparation de commandes', 'validation_mode' => 'B', 'is_active' => true]);
        $module = Module::create(['course_id' => $this->course->id, 'title' => 'Bons de commande', 'order' => 1]);
        $this->lecon = Lesson::create(['module_id' => $module->id, 'title' => 'Lire un bon', 'type' => 'text', 'content' => 'Texte', 'duration_minutes' => 10, 'order' => 1]);
        QuizQuestion::create(['module_id' => $module->id, 'question_text' => 'Une seule ?', 'options' => ['A', 'B'], 'correct_answers' => ['A'], 'points' => 1]);
        QuizQuestion::create(['module_id' => $module->id, 'question_text' => 'Plusieurs ?', 'options' => ['A', 'B', 'C'], 'correct_answers' => ['A', 'C'], 'points' => 1]);
    }

    private function inscrire(string $statut): Enrollment
    {
        return Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $this->course->id, 'status' => $statut, 'delivery_status' => 'delivered']);
    }

    private function terminerLecon()
    {
        return $this->withHeaders($this->bearerFor($this->candidat->user))
            ->postJson('/api/candidat/formations/lessons/complete', ['lesson_id' => $this->lecon->id, 'course_id' => $this->course->id]);
    }

    public function test_chaque_question_dit_si_plusieurs_reponses_sont_attendues_sans_les_donner(): void
    {
        $this->inscrire('learning');

        $reponse = $this->withHeaders($this->bearerFor($this->candidat->user))
            ->getJson("/api/candidat/formations/{$this->course->id}/workspace-standard")
            ->assertOk()
            ->assertJsonPath('data.quiz_passing_score', 80)
            ->assertJsonPath('data.sections.0.capsules.1.questions.0.is_multiple', false)
            ->assertJsonPath('data.sections.0.capsules.1.questions.1.is_multiple', true);

        $this->assertStringNotContainsString('correct_answers', $reponse->getContent());
    }

    public function test_une_lecon_reste_fermee_tant_que_le_kit_n_est_pas_livre(): void
    {
        $this->inscrire('waiting_kit');

        $this->terminerLecon()->assertForbidden()->assertJsonPath('message', "Les leçons s'ouvrent une fois le kit de matériel livré.");
        $this->assertSame(0, LessonProgress::count());
    }

    public function test_une_lecon_se_termine_une_fois_le_kit_livre(): void
    {
        $this->inscrire('learning');

        $this->terminerLecon()->assertOk();
        $this->assertSame(1, LessonProgress::where('candidat_id', $this->candidat->id)->count());
    }
}
