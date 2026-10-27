<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ExamProjects;
use App\Models\FinalExamQuestion;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\ModuleResult;
use App\Models\UserExamSession;
use Illuminate\Http\Request;
use App\Models\Enrollment;
use Carbon\Carbon;

class CourseCatalogueController extends Controller
{
    public function index(Request $request){
        // Inscriptions du candidat en une seule requête (au lieu d'une requête par cours)
        $enrollments = Enrollment::where('candidat_id', $request->user()->candidat->id)
            ->get()
            ->keyBy('course_id');

        // Cours actifs, plus ceux (désactivés depuis) que le candidat suit déjà
        $courses = Course::with('modules')
            ->where(fn ($q) => $q->where('is_active', true)->orWhereIn('id', $enrollments->keys()))
            ->get();

        $courseInfo = [];

        foreach ($courses as $course) {
            $enrollment = $enrollments->get($course->id);

            $courseInfo[] = [
                'course' => $course,
                'is_enrolled' => $enrollment !== null,
                'enrollment' => $enrollment
            ];
        }

        return apiResponse(
            $courseInfo,   
            'Cours récupérés avec succès',
            'success',
            200
        );
    }

    /**
     * Carte d'une formation (le « donjon ») : la formation, l'inscription du candidat et un résumé par module.
     * Ni contenu de leçon ni question de quiz : les leçons s'ouvrent dans l'espace de formation, après inscription,
     * et les réponses des quiz ne sont montrées qu'après un quiz réussi (CourseWorkspaceController::submitQuiz).
     * Route: GET /api/get_modules/{course}
     */
    public function getModules(Request $request, Course $course)
    {
        $candidatId = $request->user()->candidat->id;
        $enrollment = Enrollment::where('course_id', $course->id)->where('candidat_id', $candidatId)->first();

        // Même règle que le catalogue : une formation désactivée ne reste visible que pour ceux qui la suivent
        if (!$course->is_active && !$enrollment) {
            return apiResponse(null, 'Formation introuvable.', 'error', 404);
        }

        $modules = $course->modules()
            ->withCount(['lessons', 'quiz_questions'])
            ->withSum('lessons', 'duration_minutes')
            ->orderBy('order')
            ->get();

        // Avancement du candidat inscrit, avec les mêmes sources que Enrollment::updateProgress
        $leconsParModule = collect();
        $leconsTerminees = collect();
        $quizReussis = collect();
        if ($enrollment) {
            $leconsParModule = Lesson::whereIn('module_id', $modules->pluck('id'))->get(['id', 'module_id']);
            $leconsTerminees = LessonProgress::where('candidat_id', $candidatId)
                ->whereIn('lesson_id', $leconsParModule->pluck('id'))
                ->pluck('lesson_id')
                ->flip();
            $quizReussis = ModuleResult::where('candidat_id', $candidatId)
                ->whereIn('module_id', $modules->pluck('id'))
                ->where('is_passed', true)
                ->pluck('module_id')
                ->flip();
        }

        $resume = $modules->map(fn (Module $module) => [
            'id' => $module->id,
            'title' => $module->title,
            'description' => $module->description,
            'order' => $module->order,
            'lessons_count' => (int) $module->lessons_count,
            'duration_minutes' => (int) ($module->lessons_sum_duration_minutes ?? 0),
            'quiz_questions_count' => (int) $module->quiz_questions_count,
            // null tant que le candidat n'est pas inscrit
            'lessons_completed' => $enrollment
                ? $leconsParModule->where('module_id', $module->id)->filter(fn ($l) => $leconsTerminees->has($l->id))->count()
                : null,
            'quiz_passed' => $enrollment && $module->quiz_questions_count > 0 ? $quizReussis->has($module->id) : null,
        ]);

        // Le « boss » : examen final en QCM, ou projet pratique en mode Expert (C)
        $projet = $course->validation_mode === 'C' ? ExamProjects::where('course_id', $course->id)->first() : null;
        $examenFinal = $course->validation_mode === 'C'
            ? [
                'type' => 'project',
                'max_attempts' => UserExamSession::MAX_ATTEMPTS,
                'time_limit_minutes' => $projet?->time_limit_minutes,
                'passing_score' => $projet?->passing_score,
            ]
            : [
                'type' => 'quiz',
                'max_attempts' => null,
                'questions_count' => FinalExamQuestion::where('course_id', $course->id)->count(),
                'passing_score' => CourseWorkspaceController::SEUIL_EXAMEN_FINAL,
            ];

        return apiResponse(
            [
                'course' => $course->only([
                    'id', 'title', 'description', 'validation_mode', 'type_contenu',
                    'delivered_skills', 'reward_xp', 'reward_asset', 'is_active',
                ]),
                'enrollment' => $enrollment?->only(['id', 'status', 'progress_percentage', 'delivery_status']),
                'modules' => $resume,
                'quiz_passing_score' => CourseWorkspaceController::SEUIL_QUIZ_MODULE,
                'final_exam' => $examenFinal + ['retry_delay_hours' => CourseWorkspaceController::DELAI_NOUVELLE_TENTATIVE_HEURES],
            ],
            'Carte de la formation récupérée avec succès',
            'success',
            200
        );
    }

    public function enroll(Request $request, Int $courseId)
    {
        $candidatId = $request->user()->candidat->id;

        // 1. Vérifier si le cours existe et s'il est actif
        $course = Course::where('is_active', true)->findOrFail($courseId);

        if (!$course) {
            return apiResponse(
                null,
                'Cours introuvable ou inactif.',
                'error',
                404
            );
        }

        // 2. Vérifier si le candidat est déjà inscrit
        $existingEnrollment = Enrollment::where('course_id', $courseId)
            ->where('candidat_id', $candidatId)
            ->first();

        if ($existingEnrollment) {
            return apiResponse(
                [
                 'is_enrolled' => true,
                 'validation_mode' => $course->validation_mode
                ],
                'Vous êtes déjà inscrit à cette formation.',
                'success',
                200
            );
        }

        // 3. Créer l'inscription initiale en fonction du mode de validation
        // Pour le mode Standard, l'accès est direct et "delivery_status" n'est pas requis
        if($course->validation_mode == "B" || ($course->validation_mode == "C" && $course->type_contenu == "Kit")){

            $enrollment = Enrollment::create([
                'candidat_id'         => $candidatId,
                'course_id'           => $courseId,
                'delivery_status'     => "pending",
                'status'              => "waiting_kit"
            ]);

        }else{

            $enrollment = Enrollment::create([
                'candidat_id'         => $candidatId,
                'course_id'           => $courseId,
            ]);
        }

        

        return apiResponse(
            [
                'is_enrolled' => false,
                'validation_mode' => $course->validation_mode
            ],
            'Inscription validée avec succès ! Bienvenue dans votre formation.',
            'success',
            201
        );
    }

    public function myLearnings(Request $request)
    {
        // 1. Récupération du candidat connecté
        // Adaptable selon tes relations (ex: $request->user()->candidat->id ou $request->user()->id)
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json([
                'success' => false,
                'message' => 'Profil candidat non trouvé.',
            ], 404);
        }

        // 2. Récupération des enrollments avec la relation course et ses modules
        $enrollments = Enrollment::with(['course.modules'])
            ->where('candidat_id', $candidat->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        // 3. Retour au format standard
        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

}
