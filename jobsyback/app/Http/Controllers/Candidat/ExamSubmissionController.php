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

/**
 * Projet pratique d'examen (formations mode C).
 * Règles appliquées côté serveur (le chrono du navigateur n'est qu'un affichage) :
 * - une seule session par candidat et par projet, UserExamSession::MAX_ATTEMPTS tentatives via retry() ;
 * - accès réservé aux inscrits ayant terminé les modules ;
 * - temps imparti + période de grâce vérifiés à chaque écriture.
 */
class ExamSubmissionController extends Controller
{
    /** Marge réseau tolérée après la fin de la période de grâce. */
    private const NETWORK_TOLERANCE_MINUTES = 2;

    /**
     * Permet à l'étudiant de demarrer l'examen
     */
    public function start(Request $request, ExamProjects $project): JsonResponse
    {
        $candidat = $request->user()->candidat;

        if (!$this->hasCompletedCourse($candidat->id, $project->course_id)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terminez tous les modules de la formation avant de démarrer le projet d\'examen.'
            ], 403);
        }

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

            // Session échouée : une nouvelle tentative passe obligatoirement par retry() (limite et délai)
            return response()->json([
                'status' => 'error',
                'message' => 'Cette tentative est terminée. Utilisez la relance pour repasser le projet.',
                'session' => $existingSession,
            ], 409);
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
        $candidat = $request->user()->candidat;

        // 1. Une session démarrée (start/retry) et toujours en cours est obligatoire
        $session = $this->activeSession($candidat->id, $projectId);

        if (!$session) {
            return response()->json([
                'message' => 'Aucune session d\'examen en cours : démarrez ou relancez le projet avant de soumettre.'
            ], 422);
        }

        if ($this->isPastDeadline($session, $project)) {
            return response()->json([
                'message' => 'Le temps imparti est écoulé : votre dernier brouillon enregistré sera soumis automatiquement.'
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
                // URL du fichier téléversé au préalable (upload-temp-file) : http(s) obligatoire,
                // sinon un « javascript:... » deviendrait un lien piégé dans l'écran de correction admin
                $fieldRules[] = 'url';
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

        // 3. Soumission de la session en cours
        $session->update([
            'status' => 'submitted',
            'submitted_data' => $request->input('answers'),
            'submitted_at' => Carbon::now(),
            'admin_id' => null,
            'detailed_marks' => null,
            'final_score' => null,
            'admin_feedback' => null,
            'reviewed_at' => null,
        ]);

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

        $session = $project
            ? UserExamSession::where('candidat_id', $candidat->id)->where('exam_project_id', $project->id)->first()
            : null;

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
            ->where('candidat_id', $candidat->id)
            ->firstOrFail();

        // Vérification du statut
        if ($session->status !== 'failed') {
            return response()->json([
                'message' => 'Cette session ne peut pas être relancée.'
            ], 400);
        }

        if ($session->is_blocked || $session->isLastAttempt()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous avez atteint le nombre maximal de ' . UserExamSession::MAX_ATTEMPTS . ' tentatives autorisées pour ce projet pratique.'
            ], 403);
        }

        $finalExamScore = FinalExamResults::where('candidat_id', $session->candidat_id)
            ->where('course_id', $session->examProject->course_id)
            ->first();

        // Délai de 24 h après un échec, comme affiché dans l'espace de formation
        if ($finalExamScore && $finalExamScore->updated_at->copy()->addHours(24)->isFuture()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Vous devez attendre 24 h après un échec avant de repasser le projet.',
                'time_remaining' => (int) now()->diffInSeconds($finalExamScore->updated_at->copy()->addHours(24)),
            ], 429);
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

        $finalExamScore?->delete();

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
        $request->validate([
            'answers' => 'nullable|array',
            'answers.*' => 'nullable|string|max:20000',
        ]);

        $candidat = $request->user()->candidat;

        $session = UserExamSession::where('id', $sessionId)
            ->where('candidat_id', $candidat->id)
            ->firstOrFail();

        // Seule une session en cours peut recevoir un brouillon
        if ($session->status !== 'in_progress') {
            return response()->json([
                'message' => 'Impossible de sauvegarder le brouillon d\'une session non active.'
            ], 422);
        }

        // Après la période de grâce, le brouillon est figé : c'est lui qui sera soumis
        if ($this->isPastDeadline($session, $session->examProject)) {
            return response()->json([
                'message' => 'Le temps imparti est écoulé : le brouillon ne peut plus être modifié.'
            ], 422);
        }

        // Fusion des anciennes réponses avec les nouvelles reçues
        $currentAnswers = $session->submitted_data ?? [];
        $newAnswers = array_merge($currentAnswers, $this->cleanAnswers($session->examProject, $request->input('answers', [])));

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
     * Après la période de grâce, seul le dernier brouillon enregistré à temps est retenu.
     * Route: POST /api/exam-submissions/{projectId}/auto-submit
     */
    public function autoSubmit(Request $request, int $projectId): JsonResponse
    {
        $request->validate([
            'answers' => 'nullable|array',
            'answers.*' => 'nullable|string|max:20000',
        ]);

        $candidat = $request->user()->candidat;
        $project = ExamProjects::findOrFail($projectId);

        $session = $this->activeSession($candidat->id, $projectId);

        if (!$session) {
            return response()->json([
                'message' => 'Aucune session d\'examen en cours pour ce projet.'
            ], 422);
        }

        $answers = $session->submitted_data ?? [];

        if (!$this->isPastDeadline($session, $project)) {
            $answers = array_merge($answers, $this->cleanAnswers($project, $request->input('answers', [])));
        }

        $session->update([
            'status' => 'submitted',
            'submitted_data' => $answers,
            'submitted_at' => now(),
            'admin_id' => null,
            'detailed_marks' => null,
            'final_score' => null,
            'admin_feedback' => null,
            'reviewed_at' => null,
        ]);

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

        $session = UserExamSession::where('id', $sessionId)
            ->where('candidat_id', $candidat->id)
            ->firstOrFail();

        // Seule une session encore en cours peut être déclarée copie blanche (pas une copie soumise ou validée)
        if ($session->status !== 'in_progress') {
            return response()->json([
                'message' => 'Cette session n\'est plus en cours.',
                'session' => $session
            ], 422);
        }

        $session->update([
            'status' => 'failed',
            'is_blocked' => $session->isLastAttempt(),
            'final_score' => 0,
            'admin_feedback' => "Copie blanche : Aucun livrable transmis dans le temps imparti.",
            'submitted_at' => now(),
            'reviewed_at' => now(),
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

            // Envoyer l'email de résultat
            sendResultEmail(false, $enrollment->global_score, $candidat, $session->examProject->course, null);
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

    /**
     * Brouillon / soumission automatique (sans validation stricte) : seuls les champs du projet sont gardés,
     * et un champ lien ou fichier n'est conservé que s'il s'agit d'une URL http(s).
     */
    private function cleanAnswers(ExamProjects $project, array $answers): array
    {
        $clean = [];

        foreach ($project->inputs_schema ?? [] as $field) {
            $value = $answers[$field['key']] ?? null;

            if (!is_string($value)) {
                continue;
            }

            if (in_array($field['type'], ['url', 'file'], true)
                && (!preg_match('#^https?://#i', $value) || filter_var($value, FILTER_VALIDATE_URL) === false)) {
                continue;
            }

            $clean[$field['key']] = $value;
        }

        return $clean;
    }

    /**
     * Session en cours (démarrée par start() ou retry()) du candidat pour ce projet.
     */
    private function activeSession(int $candidatId, int $projectId): ?UserExamSession
    {
        return UserExamSession::where('candidat_id', $candidatId)
            ->where('exam_project_id', $projectId)
            ->where('status', 'in_progress')
            ->first();
    }

    /**
     * Temps imparti + période de grâce + marge réseau dépassés ? (aucune limite si le projet n'en a pas)
     */
    private function isPastDeadline(UserExamSession $session, ExamProjects $project): bool
    {
        if (!$project->time_limit_minutes || !$session->started_at) {
            return false;
        }

        return now()->greaterThan(
            $session->started_at->copy()->addMinutes(
                $project->time_limit_minutes + UserExamSession::GRACE_MINUTES + self::NETWORK_TOLERANCE_MINUTES
            )
        );
    }

    /**
     * Inscrit à la formation et tous les modules terminés.
     */
    private function hasCompletedCourse(int $candidatId, int $courseId): bool
    {
        return Enrollment::where('course_id', $courseId)
            ->where('candidat_id', $candidatId)
            ->where('progress_percentage', '>=', 100)
            ->exists();
    }
}
