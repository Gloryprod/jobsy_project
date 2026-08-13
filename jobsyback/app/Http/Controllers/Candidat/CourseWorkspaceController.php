<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonProgress;
use App\Models\Module;
use App\Models\ModuleResult;
use App\Models\FinalExamQuestion;
use App\Models\FinalExamResults;
use App\Models\UserExamSession;
use App\Models\ExamProjects;
use Carbon\Carbon;

class CourseWorkspaceController extends Controller
{
    public function getCourse(Request $request, Int $courseId){
        $course = Course::where('id', $courseId)
        ->select('validation_mode')
        ->first();

        return response()->json([
            'status' => 'success',
            'course' => $course
        ]);
    }

    /**
     * Charger le contenu complet d'une formation avec l'état de progression du candidat
     */
    public function showStandardWorkspace(Request $request, Int $courseId)
    {
        // 1. Récupérer l'ID du candidat connecté (à adapter selon ton auth, ex: auth()->user()->candidat->id)
        $candidatId = $request->user()->candidat->id;

        // 2. Charger le cours, ses modules, ses leçons et les questions de quiz associées au module
        $course = Course::with(['modules.lessons', 'modules.quiz_questions'])
            ->findOrFail($courseId);
        

        // 3. Vérifier l'inscription à la formation
        $enrollment = Enrollment::where('course_id', $courseId)
            ->where('candidat_id', $candidatId)
            ->firstOrFail();

        $finalExamScore = FinalExamResults::where('candidat_id', $candidatId)
            ->where('course_id', $courseId)
            ->first();

        $project = ExamProjects::where('course_id', $course->id)->first();

        $session = null;

        if($project){
            $session = UserExamSession::where('candidat_id', $candidatId)
            ->where('exam_project_id', $project->id)
            ->first();
        }
        
        $isValidForProgress = false;

        switch ($course->validation_mode) {
            case 'A':
                $isValidForProgress = true;
                break;

            case 'B':
                $isValidForProgress = ($enrollment->status !== 'waiting_kit');
                break;

            case 'C':
                if ($course->type_contenu === 'Digital') {
                    $isValidForProgress = true;
                } elseif ($course->type_contenu === 'Kit') {
                    $isValidForProgress = ($enrollment->status !== 'waiting_kit');
                }
                break;
        }

        if ($isValidForProgress) {
            $enrollment->updateProgress();

            if ($finalExamScore) {
                $enrollment->updateLearnerGlobalScore($finalExamScore->is_passed);
            }
        }

        // if ($enrollment) {
        //     if($course->validation_mode == "A" || 
        //     ($course->validation_mode == "B" && $enrollment->status !== "waiting_kit" ) ||
        //     ($course->validation_mode == "C" && (($course->type_contenu == "Digital") || ($course->type_contenu == "Kit" && $enrollment->status !== "waiting_kit" )) )
        //     ){
            
        //         $enrollment->updateProgress();

        //         if($finalExamScore){
        //             $enrollment->updateLearnerGlobalScore($finalExamScore->is_passed);
        //         }
        //     }
        // }

        $can_retry = true;
        $timeRemaining = 0;
        $isPermanentlyBlocked = false;
        $attemptsCount = $session ? $session->attempts_count : 0;
        if ($finalExamScore && !$finalExamScore->is_passed) {
            // $updatedAt = $finalExamScore->updated_at;
            // $liberationDate = $updatedAt->copy()->addHours(24);
            // // $liberationDate = "2026-07-21 11:35:00";
            // $now = Carbon::now();
            // $timeRemaining = $now->diffInSeconds($liberationDate, false);

            // $can_retry = $timeRemaining > 0 ? false : true;

            // --- CAS 1 : FORMATIONS EN MODE C (Projet Pratique / Expert) ---
            if ($course->validation_mode === 'C') {

                // A. Vérification du blocage définitif (2 tentatives consommées OU indicateur is_blocked actif)
                if ($attemptsCount >= 2 || ($session && $session->is_blocked)) {
                    $can_retry = false;
                    $isPermanentlyBlocked = true;
                    $timeRemaining = 0;
                } 
                // B. Première tentative échouée -> Vérification du délai des 24h
                else {
                    $updatedAt = $finalExamScore->updated_at;
                    // $liberationDate = $updatedAt->copy()->addHours(24);
                    $liberationDate = "2026-08-03 16:35:00";
                    $now = Carbon::now();

                    $diffInSeconds = $now->diffInSeconds($liberationDate, false);

                    if ($diffInSeconds > 0) {
                        $can_retry = false;
                        $timeRemaining = $diffInSeconds;
                    } else {
                        $can_retry = true; // 24h écoulées -> Autorisé à lancer la 2ème (et dernière) tentative
                        $timeRemaining = 0;
                    }
                }
            } 
            
            // --- CAS 2 : AUTRES MODES (A ou B) ---
            else {
                // Tentatives illimitées, mais obligation de respecter le délai de 24h après chaque échec
                $updatedAt = $finalExamScore->updated_at;
                $liberationDate = $updatedAt->copy()->addHours(24);
                $now = Carbon::now();

                $diffInSeconds = $now->diffInSeconds($liberationDate, false);

                if ($diffInSeconds > 0) {
                    $can_retry = false;
                    $timeRemaining = $diffInSeconds;
                } else {
                    $can_retry = true; // 24h écoulées -> Autorisé à retenter (3ème, 4ème fois, etc.)
                    $timeRemaining = 0;
                }
            }
        }

        // 4. Récupérer la liste des IDs des leçons déjà terminées par ce candidat
        $completedLessonIds = LessonProgress::where('candidat_id', $candidatId)
            ->whereIn('lesson_id', $course->lessons->pluck('id'))
            ->pluck('lesson_id')
            ->toArray();

        // 5. Formater la structure pour correspondre exactement à ce que ton Front Next.js attend
        $sections = $course->modules->map(function ($module) use ($completedLessonIds, $candidatId) {
            
            // Formatage des capsules (Leçons)
            $capsules = $module->lessons->map(function ($lesson) use ($completedLessonIds, $candidatId) {
                return [
                    'id' => 'lesson-' . $lesson->id,
                    'db_id' => $lesson->id,
                    'title' => $lesson->title,
                    'type' => $lesson->type, // text, video
                    'duration' => $lesson->duration_minutes . ' min',
                    'content_text' => $lesson->type === 'text' ? $lesson->content : null,
                    'video_url' => $lesson->type === 'video' ? $lesson->content : null,
                    'pdf_url' => $lesson->type === 'pdf' ? $lesson->content : null,
                    'is_completed' => in_array($lesson->id, $completedLessonIds),
                ];
            })->toArray();

            // S'il y a des questions de quiz dans ce module, on ajoute la capsule QCM à la fin de la section
            if ($module->quiz_questions->count() > 0) {
                $capsules[] = [
                    'id' => 'qcm-' . $module->id,
                    'module_id' => $module->id,
                    'title' => "Quiz : " . $module->title,
                    'type' => 'qcm',
                    'duration' => $module->quiz_questions->count() . ' questions',
                    'is_completed' => $module->results()->where('candidat_id', $candidatId)->where('module_id', $module->id)->where('is_passed', true)->exists(),
                    'questions' => $module->quiz_questions->map(function ($q) {
                        return [
                            'id' => $q->id,
                            'question_text' => $q->question_text,
                            'options' => $q->options, // Déjà converti en array par ton cast
                            'points' => $q->points
                        ];
                    })
                ];
            }

            return [
                'id' => $module->id,
                'title' => $module->title,
                'capsules' => $capsules
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [ 
                'course_title' => $course->title,
                'validation_mode' => $course->validation_mode,
                'type_contenu' => $course->type_contenu,
                'enrollment_id' => $enrollment->id,
                'delivery_status' => $enrollment->delivery_status,
                'progress_percentage' => $enrollment->progress_percentage,
                'status' => $enrollment->status,
                'certificate_hash' => $enrollment->certificate_hash,
                'sections' => $sections,
                'can_retry' => $can_retry,
                'time_remaining' => $timeRemaining,
                'attempts_count' => $attemptsCount,
                'is_permanently_blocked' => $isPermanentlyBlocked,
            ]
        ]);
    }

    /**
     * Marquer une capsule (leçon) comme terminée et recalculer la progression
     */
    public function completeLesson(Request $request)
    {
        $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'course_id' => 'required|exists:courses,id'
        ]);

        $candidatId = $request->user()->candidat->id;

        // 1. Enregistrer la progression si pas déjà fait
        LessonProgress::firstOrCreate([
            'candidat_id' => $candidatId,
            'lesson_id' => $request->lesson_id
        ]);

        // 2. Calculer le nouveau pourcentage de progression pour le cours entier
        $enrollment = Enrollment::where('course_id', $request->course_id)
                ->where('candidat_id', $candidatId)
                ->first();

        $newProgress = 0;

        if ($enrollment) {
            // updateProgress() calcule, sauvegarde, et on récupère sa valeur en direct
            $newProgress = $enrollment->updateProgress(); 
            
            // Alternative : $enrollment->refresh(); pour mettre à jour tout l'objet
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Progression sauvegardée',
            'progress_percentage' => $newProgress
        ]);
    }

    public function submitQuiz(Request $request, Int $moduleId)
    {
        // 1. Validation de la requête entrante
        $request->validate([
            'course_id' => 'required|integer',
            'answers'   => 'required|array', // Reçoit : [ "id_question" => ["Option A", "Option B"] ]
        ]);

        // Récupération du candidat connecté (via ton guard auth:api ou sanctuarisé)
        $candidatId = $request->user()->candidat->id; 
        $courseId = $request->input('course_id');
        
        // 2. Récupérer le module avec ses questions de quiz
        $module = Module::with('quiz_questions')->findOrFail($moduleId);
        $questions = $module->quiz_questions;
        
        if ($questions->count() === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucune question trouvée pour ce module.'
            ], 404);
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $userAnswers = $request->input('answers');
        $corrections = []; // Pour renvoyer un feedback au front si besoin

        // 3. Calcul du score question par question
        foreach ($questions as $question) {
            $totalPoints += $question->points;
            
            // On récupère ce que le candidat a coché (tableau vide s'il n'a rien coché)
            $submitted = isset($userAnswers[$question->id]) ? $userAnswers[$question->id] : [];
            
            // Nos bonnes réponses (déjà converties en tableau PHP grâce au $casts)
            $actualCorrect = $question->correct_answers ?? []; 

            // Tri des tableaux pour ignorer l'ordre des clics lors de la comparaison
            sort($submitted);
            sort($actualCorrect);

            $totalCorrect = count($actualCorrect);

            if($totalCorrect == 1 && count($submitted) == 1 && $submitted[0] === $actualCorrect[0]) {
                // Cas du choix unique : 1 point si la réponse est juste
                $earnedPoints += $question->points;
            } else if ($totalCorrect > 1) {
                // Cas du choix multiple : on attribue les points au prorata des bonnes réponses cochées
                $goodSelections = count(array_intersect($submitted, $actualCorrect));
                $badSelections = count(array_diff($submitted, $actualCorrect));

                // Calcul du score net pour éviter le spam de cases
                $netScore = max(0, $goodSelections - $badSelections);
                $earnedPoints += ($netScore / $totalCorrect) * $question->points;
            }
            
            // Vérification de la réussite complète de la question pour le feedback
            $isCorrect = ($earnedPoints === $question->points);

            // On prépare un petit tableau de correction (utile pour l'affichage de l'historique)
            $corrections[$question->id] = [
                'is_correct' => $isCorrect,
                'correct_answers' => $question->correct_answers // On lui montre les vraies réponses
            ];
        }

        // Calcul du pourcentage final
        $scorePercentage = ($totalPoints > 0) ? ($earnedPoints / $totalPoints) * 100 : 0;
        $isPassed = $scorePercentage >= 80; // Note de passage à 80% pour Jobsy

        // 4. Enregistrement ou mise à jour de la tentative en base de données
        $moduleResult = ModuleResult::updateOrCreate(
            [
                'candidat_id' => $candidatId,
                'module_id'   => $moduleId,
            ],
            [
                'score'       => round($scorePercentage, 2),
                'is_passed'   => $isPassed,
            ]
        );

        // 5. Si le QCM est validé, on déclenche la mise à jour de la progression globale
        if ($isPassed) {
            $enrollment = Enrollment::where('course_id', $courseId)
                ->where('candidat_id', $candidatId)
                ->first();

            if ($enrollment) {
                // Ici tu appelles ta méthode existante qui recalcule le % global de la formation
                $enrollment->updateProgress(); 
            }
        }

        // 6. Réponse standardisée pour Next.js
        return response()->json([
            'status' => 'success',
            'data' => [
                'is_passed'   => $isPassed,
                'score'       => round($scorePercentage, 2),
                'corrections' => $corrections,
                'message'     => $isPassed 
                    ? 'Félicitations ! Vous avez validé ce module avec succès.' 
                    : 'Score insuffisant (minimum 80%). Prenez le temps de relire le cours et réessayez !'
            ]
        ]);
    }

    public function showFinalExamQuestions(Int $courseId, Request $request){
        $course = Course::findOrFail($courseId);

        $questions = FinalExamQuestion::where('course_id', $courseId)
        ->get();

        $secureQuestions = $questions->map(function ($question) {
            return [
                'id' => $question->id,
                'question_text' => $question->question_text,
                'options' => $question->options,
                'points' => $question->points,
                'is_multiple' => count($question->correct_answers) > 1,
            ];
        });

        $candidatId = $request->user()->candidat->id;

        $lastResult = FinalExamResults::where('candidat_id', $candidatId)
            ->where('course_id', $courseId)
            ->first();

        if ($lastResult && !$lastResult->is_passed) {
            $updatedAt = $lastResult->updated_at;
            $liberationDate = $updatedAt->copy()->addHours(24);
            // $liberationDate = "2026-06-10 21:46:07";
            $now = Carbon::now();
            $timeRemaining = $now->diffInSeconds($liberationDate, false);

            if ($timeRemaining > 0) {
                // S'il est bloqué, on s'arrête là ! On renvoie l'info à Next.js
                return response()->json([
                    'status' => 'blocked',
                    'message' => 'Vous devez attendre 24h avant de repasser l\'examen.',
                    'data' => [
                        'can_retry' => false,
                        'time_remaining' => intval($timeRemaining), // En secondes, à convertir en front pour affichage
                        'questions' => $secureQuestions
                    ]
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'course_title' => $course->title,
                'questions' => $secureQuestions,
                'can_retry' => true,
                'time_remaining' => 0,
            ]
        ]);
    }

    public function submitFinalExam(Request $request, Int $courseId){
        $candidat = $request->user()->candidat; 

        $lastResult = FinalExamResults::where('candidat_id', $candidat->id)
                                  ->where('course_id', $courseId)
                                  ->first();

        if ($lastResult && !$lastResult->is_passed) {
            $updatedAt = $lastResult->updated_at;
            $liberationDate = $updatedAt->copy()->addHours(24);
            // $liberationDate = "2026-06-10 21:46:07";
            $now = Carbon::now();
            $timeRemaining = $now->diffInSeconds($liberationDate, false);

            if ($timeRemaining > 0) {
                return response()->json([
                    'status' => 'blocked',
                    'message' => 'Vous devez attendre 24h avant de repasser l\'examen.',
                ]);
            }
        }

        $course = Course::findOrFail($courseId);
        
        // 2. Récupérer toutes les vraies questions de l'examen pour ce cours
        $questions = FinalExamQuestion::where('course_id', $courseId)->get();
        
        if ($questions->isEmpty()) {
            return response()->json([
                'status' => 'error',
                'message' => "Cet examen ne contient aucune question pour le moment."
            ], 422);
        }

        $totalPoints = 0;
        $earnedPoints = 0;
        $submittedAnswers = $request->input('answers', []);

        // 3. Boucle de correction
        foreach ($questions as $question) {
            $totalPoints += $question->points;

            // Récupérer les réponses du candidat et les bonnes réponses
            $candidatAnswers = $submittedAnswers[$question->id] ?? [];

            // Nettoyage des tableaux
            $cleanCandidat = collect($candidatAnswers)->map(fn($item) => trim($item))->toArray();
            $cleanCorrect = collect($question->correct_answers)->map(fn($item) => trim($item))->toArray();

            $totalCorrectAnswers = count($cleanCorrect);

            // CAS 1 : Choix unique (une seule bonne réponse possible)
            if ($totalCorrectAnswers === 1) {
                if (count($cleanCandidat) === 1 && $cleanCandidat[0] === $cleanCorrect[0]) {
                    $earnedPoints += $question->points;
                }
            } 
            // CAS 2 : Choix multiples (Répartition des points au prorata)
            else if ($totalCorrectAnswers > 1 && count($cleanCandidat) > 0) {
                
                $goodSelectionsCount = 0;
                $badSelectionsCount = 0;

                foreach ($cleanCandidat as $answer) {
                    if (in_array($answer, $cleanCorrect)) {
                        $goodSelectionsCount++; // Le candidat a coché une réponse juste
                    } else {
                        $badSelectionsCount++;  // Le candidat a coché une réponse fausse
                    }
                }

                // Calcul du delta : bonnes réponses moins les mauvaises pour éviter le spam de cases
                $netCorrect = $goodSelectionsCount - $badSelectionsCount;

                if ($netCorrect > 0) {
                    // Calcul du prorata : (Net de bonnes réponses / Total attendu) * Points de la question
                    $questionScore = ($netCorrect / $totalCorrectAnswers) * $question->points;
                    $earnedPoints += $questionScore;
                }
                // Si $netCorrect <= 0, le candidat a mis autant ou plus de fausses réponses que de vraies : 0 point.

                // Vérification de la réussite complète de la question pour le feedback
                $isCorrect = ($earnedPoints === $question->points);

                // On prépare un petit tableau de correction (utile pour l'affichage de l'historique)
                $corrections[$question->id] = [
                    'is_correct' => $isCorrect,
                    'correct_answers' => $question->correct_answers // On lui montre les vraies réponses
                ];
            }
        }

        // 4. Calcul du score final en pourcentage
        $scorePercentage = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100) : 0;
        
        // Seuil de réussite fixé à 75% (tu peux le rendre dynamique sur ton modèle Course si besoin)
        $seuilReussite = 75; 
        $isPassed = $scorePercentage >= $seuilReussite;

        // 5. Enregistrement ou mise à jour du score en base de données
        $result = FinalExamResults::updateOrCreate(
            [
                'candidat_id' => $candidat->id,
                'course_id' => $course->id,
            ],
            [
                'score' => $scorePercentage,
                'is_passed' => $isPassed,
            ]
        );

        $enrollment = Enrollment::where('course_id', $courseId)
            ->where('candidat_id', $candidat->id)
            ->first();

        // 6. Déclencheur de changement de statut U
        // Vérifier lors des tests si la condition est necessaire

        if ($enrollment) {
            // Caluler et mettre à jour le score global du candidat pour cette formation
            $enrollment->updateLearnerGlobalScore($isPassed); 
        }           

        sendResultEmail($isPassed, $enrollment->global_score, $candidat, $course, $enrollment->certificate_hash);

        return response()->json([
            'status' => 'success',
            'message' => $isPassed ? 'Examen réussi !' : 'Examen échoué.',
            'data' => [
                'score' => $scorePercentage,
                'earned_points' => $earnedPoints,
                'total_points' => $totalPoints,
                'is_passed' => $isPassed
            ]
        ]);
    }

    public function accesLogisticCourse(Request $request, Enrollment $enrollment)
    {
        if ($enrollment->candidat_id !== $request->user()->candidat->id) {
            return response()->json([
                'status' => 'error',
                'message' => "Action non autorisée.",
            ], 403);
        }

        if ($enrollment->delivery_status === 'pending') {
            
            return response()->json([
                'status' => 'error',
                'message' => "Vous ne pouvez pas encore accéder au cours. La livraison du kit n'est pas encore validée. Veuillez patienter ou contacter le support administratif.",
            ], 403); 

        }else{

            $enrollment->update([
                'status' => 'learning'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => "Félicitations pour la réception de votre kit. Accédez maintenant au cours !",
            ]); // Code 200 par défaut

        }

    }
}