<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\ExamProjects;
use App\Models\FinalExamQuestion;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\ModuleResult;
use App\Models\QuizQuestion;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Carte d'une formation (GET /api/get_modules/{course}) : un résumé par module, sans contenu de leçon
 * ni question de quiz, et l'avancement réel d'un candidat inscrit.
 */
class CourseMapTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private Course $course;
    private Module $premier;
    private Module $second;
    private array $lecons = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->candidat = Candidat::factory()->create();
        $this->course = Course::create(['title' => 'Accueil client', 'validation_mode' => 'A', 'type_contenu' => 'Digital', 'reward_xp' => 150, 'is_active' => true]);

        // Créés dans le désordre : la carte doit suivre « order »
        $this->second = Module::create(['course_id' => $this->course->id, 'title' => 'Gérer une réclamation', 'order' => 2]);
        $this->premier = Module::create(['course_id' => $this->course->id, 'title' => 'Saluer et orienter', 'order' => 1]);

        foreach ([[$this->premier, 10], [$this->premier, 15], [$this->second, 20]] as $i => [$module, $minutes]) {
            $this->lecons[] = Lesson::create(['module_id' => $module->id, 'title' => "Leçon {$i}", 'type' => 'text', 'content' => "<p>Contenu secret {$i}</p>", 'duration_minutes' => $minutes, 'order' => $i]);
        }

        QuizQuestion::create(['module_id' => $this->premier->id, 'question_text' => 'Que dire en premier ?', 'options' => ['Bonjour', 'Suivant'], 'correct_answers' => ['Bonjour'], 'points' => 1]);
        QuizQuestion::create(['module_id' => $this->premier->id, 'question_text' => 'Et ensuite ?', 'options' => ['Écouter', 'Partir'], 'correct_answers' => ['Écouter'], 'points' => 1]);
        FinalExamQuestion::create(['course_id' => $this->course->id, 'question_text' => 'Examen', 'options' => ['a', 'b'], 'correct_answers' => ['a'], 'points' => 1]);
    }

    private function carte(?Course $course = null)
    {
        return $this->withHeaders($this->bearerFor($this->candidat->user))
            ->getJson('/api/get_modules/' . ($course ?? $this->course)->id);
    }

    public function test_la_carte_ne_contient_ni_contenu_de_lecon_ni_question_ni_reponse(): void
    {
        $reponse = $this->carte()->assertOk();

        $brut = $reponse->getContent();
        $this->assertStringNotContainsString('correct_answers', $brut);
        $this->assertStringNotContainsString('Bonjour', $brut);
        $this->assertStringNotContainsString('Que dire en premier', $brut);
        $this->assertStringNotContainsString('Contenu secret', $brut);
        $reponse->assertJsonMissingPath('data.modules.0.lessons')->assertJsonMissingPath('data.modules.0.quiz_questions');
    }

    public function test_un_resume_par_module_dans_l_ordre(): void
    {
        $this->carte()
            ->assertOk()
            ->assertJsonPath('data.course.title', 'Accueil client')
            ->assertJsonPath('data.enrollment', null)
            ->assertJsonPath('data.modules.0.title', 'Saluer et orienter')
            ->assertJsonPath('data.modules.0.lessons_count', 2)
            ->assertJsonPath('data.modules.0.duration_minutes', 25)
            ->assertJsonPath('data.modules.0.quiz_questions_count', 2)
            ->assertJsonPath('data.modules.0.lessons_completed', null)
            ->assertJsonPath('data.modules.0.quiz_passed', null)
            ->assertJsonPath('data.modules.1.title', 'Gérer une réclamation')
            ->assertJsonPath('data.modules.1.quiz_questions_count', 0)
            ->assertJsonPath('data.quiz_passing_score', 80)
            ->assertJsonPath('data.final_exam.type', 'quiz')
            ->assertJsonPath('data.final_exam.questions_count', 1)
            ->assertJsonPath('data.final_exam.passing_score', 75)
            ->assertJsonPath('data.final_exam.retry_delay_hours', 24);
    }

    public function test_l_avancement_d_un_inscrit_suit_ses_lecons_et_ses_quiz(): void
    {
        Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $this->course->id, 'status' => 'learning', 'progress_percentage' => 60]);
        LessonProgress::create(['candidat_id' => $this->candidat->id, 'lesson_id' => $this->lecons[0]->id, 'completed_at' => now()]);
        LessonProgress::create(['candidat_id' => $this->candidat->id, 'lesson_id' => $this->lecons[1]->id, 'completed_at' => now()]);
        ModuleResult::create(['candidat_id' => $this->candidat->id, 'module_id' => $this->premier->id, 'score' => 100, 'is_passed' => true]);
        // La progression d'un autre candidat ne compte pas
        $autre = Candidat::factory()->create();
        LessonProgress::create(['candidat_id' => $autre->id, 'lesson_id' => $this->lecons[2]->id, 'completed_at' => now()]);

        $this->carte()
            ->assertOk()
            ->assertJsonPath('data.enrollment.status', 'learning')
            ->assertJsonPath('data.enrollment.progress_percentage', 60)
            ->assertJsonPath('data.modules.0.lessons_completed', 2)
            ->assertJsonPath('data.modules.0.quiz_passed', true)
            ->assertJsonPath('data.modules.1.lessons_completed', 0)
            ->assertJsonPath('data.modules.1.quiz_passed', null);
    }

    public function test_un_quiz_rate_n_est_pas_reussi(): void
    {
        Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $this->course->id, 'status' => 'learning']);
        ModuleResult::create(['candidat_id' => $this->candidat->id, 'module_id' => $this->premier->id, 'score' => 40, 'is_passed' => false]);

        $this->carte()->assertOk()->assertJsonPath('data.modules.0.quiz_passed', false);
    }

    public function test_une_formation_desactivee_reste_visible_seulement_pour_ses_inscrits(): void
    {
        $this->course->update(['is_active' => false]);
        $this->carte()->assertNotFound();

        Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $this->course->id, 'status' => 'certified']);
        $this->carte()->assertOk()->assertJsonPath('data.enrollment.status', 'certified');
    }

    public function test_le_boss_d_une_formation_expert_est_un_projet_a_deux_tentatives(): void
    {
        $expert = Course::create(['title' => 'Gestion de stock', 'validation_mode' => 'C', 'type_contenu' => 'Digital', 'is_active' => true]);
        ExamProjects::create([
            'course_id' => $expert->id, 'title' => 'Inventaire', 'domain' => 'Logistique', 'context_rich_text' => '<p>Projet</p>',
            'inputs_schema' => [], 'evaluation_criteria' => [], 'passing_score' => 70, 'time_limit_minutes' => 90,
        ]);

        $this->carte($expert)
            ->assertOk()
            ->assertJsonPath('data.final_exam.type', 'project')
            ->assertJsonPath('data.final_exam.max_attempts', 2)
            ->assertJsonPath('data.final_exam.time_limit_minutes', 90)
            ->assertJsonPath('data.final_exam.passing_score', 70);
    }
}
