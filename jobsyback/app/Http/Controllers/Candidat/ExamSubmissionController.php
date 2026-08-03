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
     * Permet à l'étudiant de demarrer l'examen
     */
    public function start(Request $request, ExamProjects $project): JsonResponse
    {
        $candidat = $request->user()->candidat;

        // 2. Recherche d'une session déjà existante
        $existingSession = UserExamSession::where('candidat_id', $candidat->id)
            ->where('exam_project_id', $project->id)
            ->latest()
            ->first();

        if ($existingSession) {
            // S'il y a déjà une session en cours, on la retourne
            if ($existingSession->status === 'in_progress') {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Session déjà en cours récupérée.',
                    'session' => $existingSession,
                ], 200);
            }

            // Si la session est déjà soumise ou en cours de révision
            if (in_array($existingSession->status, ['submitted', 'under_review', 'approved'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Vous avez déjà soumis cet examen.',
                    'session' => $existingSession,
                ], 400);
            }
            
            // Note: Si le statut est 'failed', le déclenchement d'un retry doit passer par une autre API
        }

        // 3. Création de la nouvelle session
        $session = UserExamSession::create([
            'candidat_id' => $candidat->id,
            'exam_project_id' => $project->id,
            'status' => 'in_progress',
            'submitted_data' => null,
            'started_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Session d\'examen démarrée avec succès.',
            'session' => $session,
        ], 201);
    }

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

        if ($session->is_blocked || $session->attempts_count >= 2) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez atteint le nombre maximal de 2 tentatives autorisées pour ce projet pratique.'
            ], 403);
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
            'attempts_count' => $session->attempts_count + 1,
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

    /**
     * Sauvegarde automatique du brouillon en cours de composition (Debounce React 1.5s)
     * Route: PATCH /api/exam-sessions/{sessionId}/draft
     */
    public function saveDraft(Request $request, int $sessionId): JsonResponse
    {
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json(['message' => "Profil candidat introuvable."], 403);
        }

        $session = UserExamSession::where('id', $sessionId)
            ->where('candidat_id', $candidat->id)
            ->firstOrFail();

        // Seule une session en cours peut recevoir un brouillon
        if ($session->status !== 'in_progress') {
            return response()->json([
                'message' => 'Impossible de sauvegarder le brouillon d\'une session non active.'
            ], 422);
        }

        // Fusion des anciennes réponses avec les nouvelles reçues
        $currentAnswers = $session->submitted_data ?? [];
        $newAnswers = array_merge($currentAnswers, $request->input('answers', []));

        $session->update([
            'submitted_data' => $newAnswers,
        ]);

        return response()->json([
            'message' => 'Brouillon sauvegardé.',
            'session' => $session
        ], 200);
    }

    /**
     * CAS A : Soumission automatique (fin du chrono avec au moins une réponse).
     * Bypasse la validation stricte des champs requis (min 10 chars, required, etc.).
     * Route: POST /api/exam-submissions/{projectId}/auto-submit
     */
    public function autoSubmit(Request $request, int $projectId): JsonResponse
    {
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json(['message' => "Profil candidat introuvable."], 403);
        }

        $session = UserExamSession::where('candidat_id', $candidat->id)
            ->where('exam_project_id', $projectId)
            ->first();

        if ($session && in_array($session->status, ['submitted', 'under_review', 'approved'])) {
            return response()->json([
                'message' => 'Cette session a déjà été soumise.'
            ], 422);
        }

        // Sauvegarde directe sans validation de validation de schéma
        $session = UserExamSession::updateOrCreate(
            [
                'candidat_id' => $candidat->id,
                'exam_project_id' => $projectId,
            ],
            [
                'status' => 'submitted',
                'submitted_data' => $request->input('answers', []),
                'submitted_at' => Carbon::now(),
                'admin_id' => null,
                'detailed_marks' => null,
                'final_score' => null,
                'admin_feedback' => null,
                'reviewed_at' => null,
            ]
        );

        return response()->json([
            'message' => 'Examen soumis automatiquement à la fin du temps d\'épreuve.',
            'session' => $session
        ], 200);
    }

    /**
     * CAS B : Copie blanche à la fin des 30 minutes extra.
     * Marque directement la session comme 'failed'.
     * Route: POST /api/exam-sessions/{sessionId}/mark-failed-empty
     */
    public function markFailedEmpty(Request $request, int $sessionId): JsonResponse
    {
        $candidat = $request->user()->candidat;

        $isBlocked = false;

        if (!$candidat) {
            return response()->json(['message' => "Profil candidat introuvable."], 403);
        }

        $session = UserExamSession::where('id', $sessionId)
            ->where('candidat_id', $candidat->id)
            ->firstOrFail();

        if($session->attempts_count >= 2){          
            $isBlocked = true;
        }

        $session->update([
            'status' => 'failed',
            'is_blocked' => $isBlocked,
            'final_score' => 0,
            'admin_feedback' => "Copie blanche : Aucun livrable transmis dans le temps imparti.",
            'submitted_at' => Carbon::now(),
            'reviewed_at' => Carbon::now(),
        ]);

        // Enregistrement ou mise à jour du score en base de données
        $result = FinalExamResults::updateOrCreate(
            [
                'candidat_id' => $session->candidat_id,
                'course_id' => $session->examProject->course_id,
            ],
            [
                'score' => 0,
                'is_passed' => false,
            ]
        );

        // Déclencheur de changement de statut d'inscription
        $enrollment = Enrollment::where('course_id', $session->examProject->course_id)
            ->where('candidat_id', $session->candidat_id)
            ->first();

        if ($enrollment) {
            // Caluler et mettre à jour le score global du candidat pour cette formation
            $enrollment->updateLearnerGlobalScore($result->is_passed); 
        }

        return response()->json([
            'message' => 'Session marquée comme échouée (copie blanche).',
            'session' => $session
        ], 200);
    }

    /**
     * Téléversement temporaire du fichier/livrable de l'étudiant
     * Route: POST /api/upload-temp-file
     */
    public function uploadTempFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:pdf,zip,rar,png,jpg,jpeg|max:20480', // Max 20Mo
        ], [
            'file.required' => 'Veuillez sélectionner un fichier.',
            'file.mimes' => 'Formats acceptés : PDF, ZIP, RAR, PNG, JPG, JPEG.',
            'file.max' => 'Le fichier ne doit pas dépasser 20 Mo.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->hasFile('file') && $request->file('file')->isValid()) {
            // Stockage dans storage/app/public/exam_deliverables
            $path = $request->file('file')->store('exam_deliverables', 'public');
            
            // Génération de l'URL publique accessible depuis React
            $url = asset('storage/' . $path);

            return response()->json([
                'status' => 'success',
                'url' => $url,
            ], 200);
        }

        return response()->json(['message' => 'Impossible de traiter le fichier téléversé.'], 400);
    }
}