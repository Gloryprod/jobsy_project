<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\ExamProjects;
use App\Models\UserExamSession;
use App\Http\Requests\StoreExamProjectRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\FinalExamResults;
use App\Models\Enrollment;

class ExamProjectController extends Controller
{
    /**
     * 1. LISTE : Récupérer le projet d'examen d'un cours spécifique
     * (Une formation experte possède généralement un seul projet d'examen pratique final)
     */
    public function getByCourse(int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);
        
        // On récupère le projet d'examen lié à ce cours
        $project = ExamProjects::where('course_id', $courseId)->first();

        if (!$project) {
            return response()->json([
                'message' => 'Aucun projet d\'examen final n\'a été configuré pour cette formation.',
                'project' => null
            ], 200);
        }

        return response()->json([
            'project' => $project
        ], 200);
    }

    /**
     * 2. CRÉATION : Enregistrer un nouveau projet d'examen
     */
    public function store(StoreExamProjectRequest $request, int $courseId): JsonResponse
    {
        $course = Course::findOrFail($courseId);

        // Sécurité : On vérifie s'il n'y a pas déjà un examen pour ce cours
        $existingProject = ExamProjects::where('course_id', $courseId)->exists();
        if ($existingProject) {
            return response()->json([
                'message' => 'Un projet d\'examen existe déjà pour cette formation. Veuillez le modifier.'
            ], 422);
        }

        // Les données validées sont automatiquement castées en JSON par le modèle grâce à l'étape précédente
        $project = ExamProjects::create(array_merge(
            $request->validated(),
            ['course_id' => $course->id]
        ));

        return response()->json([
            'message' => 'Le projet d\'examen a été configuré avec succès pour cette formation.',
            'project' => $project
        ], 201);
    }

    /**
     * 3. SHOW : Afficher les détails d'un projet d'examen spécifique
     */
    public function show(int $id): JsonResponse
    {
        $project = ExamProjects::with('course')->findOrFail($id);

        return response()->json([
            'project' => $project
        ], 200);
    }

    /**
     * 4. UPDATE : Mettre à jour un projet d'examen existant
     */
    public function update(StoreExamProjectRequest $request, int $courseId, int $id): JsonResponse
    {
        $project = ExamProjects::where('course_id', $courseId)->findOrFail($id);

        $project->update($request->validated());

        return response()->json([
            'message' => 'Le projet d\'examen a été mis à jour avec succès.',
            'project' => $project
        ], 200);
    }

    /**
     * 5. DELETE : Supprimer le projet d'examen
     */
    public function destroy(int $courseId, int $id): JsonResponse
    {
        $project = ExamProjects::where('course_id', $courseId)->findOrFail($id);
        
        $project->delete();

        return response()->json([
            'message' => 'Le projet d\'examen a été supprimé avec succès.'
        ], 200);
    }

    public function getSubmissions(int $projectId): JsonResponse
    {
        $project = ExamProjects::findOrFail($projectId);

        UserExamSession::where('exam_project_id', $projectId)
        ->where('status', 'submitted')
        ->update(['status' => 'under_review']);

        $submissions = UserExamSession::with(['candidat.user', 'examProject'])
            ->where('exam_project_id', $projectId)
            ->whereIn('status', ['submitted', 'under_review', 'approved', 'failed'])
            ->orderBy('submitted_at', 'desc')
            ->get();

        return response()->json([
            'project' => $project,
            'submissions' => $submissions
        ]);
    }

    /**
     * Évaluation et notation d'une soumission.
     */
    public function review(Request $request, int $sessionId): JsonResponse
    {
        $request->validate([
            'score' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $session = UserExamSession::findOrFail($sessionId);
        $project = ExamProjects::findOrFail($session->exam_project_id);

        $score = (float) $request->input('score');
        $feedback = $request->input('feedback');

        // Détermination automatique du statut en fonction du score de passage
        $passed = $score >= $project->passing_score;
        $newStatus = $passed ? 'approved' : 'failed';
        $isBlocked = false;
        if($newStatus == "failed" && $session->attempts_count <=2){
            $isBlocked = true;
        }

        $session->update([
            'final_score' => $score,
            'admin_feedback' => $feedback,
            'admin_id' => $request->user()->id,
            'status' => $newStatus,
            'is_blocked' => $isBlocked,
            'reviewed_at' => now(), // si tu as cette colonne
        ]);

        // Enregistrement ou mise à jour du score en base de données
        $result = FinalExamResults::updateOrCreate(
            [
                'candidat_id' => $session->candidat_id,
                'course_id' => $project->course_id,
            ],
            [
                'score' => $score,
                'is_passed' => $passed,
            ]
        );

        $enrollment = Enrollment::where('course_id', $project->course_id)
            ->where('candidat_id', $session->candidat_id)
            ->first();

        if ($enrollment) {
            // Caluler et mettre à jour le score global du candidat pour cette formation
            $enrollment->updateLearnerGlobalScore($passed); 
        }

        sendResultEmail($passed, $enrollment->global_score, $session->candidat, $project->course, $enrollment->certificate_hash);

        return response()->json([
            'message' => 'Soumission évaluée avec succès.',
            'session' => $session
        ]);
    }
}