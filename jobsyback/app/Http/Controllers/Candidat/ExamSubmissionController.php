<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\ExamProjects;
use App\Models\UserExamSession;
use App\Models\FinalExamResults;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ExamSubmissionController extends Controller
{
    /**
     * Permet à l'étudiant de soumettre ses livrables
     */
    public function submit(Request $request, int $projectId): JsonResponse
    {
        $project = ExamProjects::findOrFail($projectId);
        
        // Récupération du candidat lié à l'utilisateur connecté
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json([
                'message' => "Profil candidat introuvable pour l'utilisateur connecté."
            ], 403);
        }

        $candidatId = $candidat->id;

        // 1. Sécurité : Vérifier si l'étudiant a déjà une session en cours, soumise ou approuvée
        $existingSession = UserExamSession::where('candidat_id', $candidatId)
            ->where('exam_project_id', $projectId)
            ->first();

        if ($existingSession && in_array($existingSession->status, ['submitted', 'under_review', 'approved'])) {
            return response()->json([
                'message' => 'Vous avez déjà soumis votre projet d\'examen. Modification impossible sans l\'accord d\'un administrateur.'
            ], 422);
        }

        // 2. Validation dynamique basée sur le inputs_schema du projet d'examen
        $rules = [];
        $messages = [];

        foreach ($project->inputs_schema as $field) {
            $key = 'answers.' . $field['key'];
            
            $fieldRules = [];
            $fieldRules[] = $field['required'] ? 'required' : 'nullable';

            if ($field['type'] === 'url') {
                $fieldRules[] = 'url';
            } elseif ($field['type'] === 'textarea') {
                $fieldRules[] = 'string';
                $fieldRules[] = 'min:10';
            } elseif ($field['type'] === 'file') {
                // S'attend à recevoir l'URL du fichier sauvegardé préalablement
                $fieldRules[] = 'string'; 
            }

            $rules[$key] = $fieldRules;
            $messages[$key . '.required'] = "Le champ \"" . $field['label'] . "\" est obligatoire.";
            $messages[$key . '.url'] = "Le champ \"" . $field['label'] . "\" doit être une URL valide.";
            $messages[$key . '.min'] = "Le champ \"" . $field['label'] . "\" doit contenir au moins 10 caractères.";
        }

        $validator = Validator::make($request->all(), $rules, $messages);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // 3. Création ou mise à jour de la session d'examen (ex: en cas d'un ancien statut 'failed')
        $session = UserExamSession::updateOrCreate(
            [
                'candidat_id' => $candidatId,
                'exam_project_id' => $projectId,
            ],
            [
                'status' => 'submitted',
                'submitted_data' => $request->input('answers'),
                'submitted_at' => Carbon::now(),
                'admin_id' => null,
                'detailed_marks' => null,
                'final_score' => null,
                'admin_feedback' => null,
                'reviewed_at' => null,
            ]
        );

        return response()->json([
            'message' => 'Votre projet d\'examen a été soumis avec succès ! Un correcteur l\'analysera prochainement.',
            'session' => $session
        ], 201);
    }

    /**
     * Récupérer le statut actuel/soumission de l'étudiant connecté pour un projet donné
     */
    public function getStudentSubmission(Request $request, int $courseId): JsonResponse
    {
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json([
                'message' => "Candidat introuvable."
            ], 403);
        }

        // Récupérer le projet d'examen demandé
        $project = ExamProjects::where('course_id', $courseId)->first();

        $session = UserExamSession::where('candidat_id', $candidat->id)
            ->where('exam_project_id', $project->id)
            ->first();

        $enrollment = Enrollment::where('course_id', $courseId)
                ->where('candidat_id', $candidat->id)
                ->first();

        return response()->json([
            'status' => 'success',
            'project' => $project,
            'session' => $session,
            'enrollment' => $enrollment
        ], 200);
    }

    /**
     * Réinitialise une session échouée pour permettre une nouvelle tentative.
     */
    public function retry(Request $request, int $sessionId): JsonResponse
    {
        $candidat = $request->user()->candidat;

        // Récupérer la session appartenant au candidat
        $session = UserExamSession::where('id', $sessionId)
            ->whereHas('candidat', function ($query) use ($candidat) {
                $query->where('id', $candidat->id);
            })
            ->firstOrFail();

        // Vérification du statut
        if ($session->status !== 'failed') {
            return response()->json([
                'message' => 'Cette session ne peut pas être relancée.'
            ], 400);
        }

        // Remise à zéro des données de soumission et passage en in_progress
        $session->update([
            'status' => 'in_progress',
            'submitted_data' => null,
            'final_score' => null,
            'admin_feedback' => null,
            'submitted_at' => null,
            'reviewed_at' => null,
            'started_at' => now(), // Recommence le chrono d'examen
        ]);

        $finalExamScore = FinalExamResults::where('candidat_id', $session->candidat_id)
            ->where('course_id', $session->examProject->course_id)
            ->first();
        $finalExamScore->delete();      

        return response()->json([
            'message' => 'Session réinitialisée. Vous pouvez repasser l\'examen.',
            'session' => $session->fresh()
        ]);
    }
}