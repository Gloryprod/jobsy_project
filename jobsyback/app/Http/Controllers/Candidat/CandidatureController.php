<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicationRequest;
use App\Jobs\ScoreApplicationJob;
use App\Models\Rank;
use App\Models\Application;
use App\Models\ApplicationAssessments;
use App\Models\Candidat;
use App\Models\Mission;
use App\Services\ApplicationAIService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class CandidatureController extends Controller
{
    private const DATE_LIMITE_PASSEE = "La date limite de cette mission est passée : elle n'accepte plus de candidatures.";

    public function apply_job(ApplicationRequest $request, Int $candidat_id, Int $mission_id, ApplicationAIService $aiService){
        $candidat = $request->user()->candidat;

        // On ne postule que pour soi-même
        if (!$candidat || (int) $candidat->id !== $candidat_id) {
            return apiResponse(null, 'Action non autorisée.', 'error', 403);
        }

        $mission = Mission::where('active', true)->whereNull('closed_at')->find($mission_id);

        if (!$mission) {
            return apiResponse(null, "Mission introuvable ou fermée.", 'error', 404);
        }

        // Une candidature se démarre et s'envoie avant la fin du jour limite
        if ($mission->isPastDeadline()) {
            return apiResponse(null, self::DATE_LIMITE_PASSEE, 'error', 410);
        }

        // Rang minimum exigé par l'entreprise (E par défaut : ouvert à tous)
        $requiredPoints = Rank::where('rank', $mission->min_rank_required ?: 'E')->value('points');
        if ($requiredPoints !== null && (int) ($candidat->rank?->points ?? 0) < (int) $requiredPoints) {
            return apiResponse(null, "Cette mission est réservée aux profils de rang {$mission->min_rank_required} ou supérieur.", 'error', 403);
        }

        $application = $mission->applications()->firstOrCreate(
           [ 'candidat_id' => $candidat->id],
           [ 'status' => 'draft'],
        );

        // Une candidature déjà soumise ne peut pas être recommencée (sinon la note IA pourrait être retentée à volonté)
        if ($application->status !== 'draft') {
            return apiResponse(null, "Vous avez déjà postulé à cette mission.", 'error', 409);
        }

        $assessment = $application->assessment()->firstOrCreate([]);

        if (!$assessment->step_1_data) {
            // Questions validées (ou questions de secours si l'IA est indisponible)
            $assessment->update([
                'step_1_data' => $aiService->generateMotivationQuestions($candidat, $mission)
            ]);
        }

        return apiResponse(
            [
                'application' => $application,
                'questions' => $assessment->step_1_data['questions']
            ],
                "Candidature soumise avec succès !",
                'success',
                200
        );

    }

    public function submit_step_one(Request $request, Int $applicationId, ApplicationAIService $aiService ){

        $request->validate([
            'responses' => 'required|array',
            'responses.*' => 'nullable|string|max:5000',
        ]);

        $application = $request->user()->candidat->applications()->find($applicationId);

        if (!$application || !$application->assessment) {
            return apiResponse(null, "Candidature introuvable !", 'error', 404);
        }

        // L'étape 1 n'est notée qu'une fois : après soumission, la candidature quitte l'état « draft »
        if ($application->status !== 'draft') {
            return apiResponse(null, "Cette étape a déjà été soumise.", 'error', 409);
        }

        // Un brouillon commencé avant la date limite ne peut plus être envoyé après
        if ($application->mission?->isPastDeadline()) {
            return apiResponse(null, self::DATE_LIMITE_PASSEE, 'error', 410);
        }

        $assessment = $application->assessment;
        $candidat = $application->candidat;

        $step1Data = $assessment->step_1_data;
        $step1Data['responses'] = $request->responses;


        $assessment->update([
            'step_1_data' => $step1Data
        ]);

        // Profils opérationnels (rangs E/D) : l'entretien s'arrête à la motivation, notée en arrière-plan
        if (in_array($candidat->rank?->rank, ['E', 'D'], true)) {

            $application->update([
                'status' => 'pending',
                'completed_at' => now(),
            ]);

            ScoreApplicationJob::dispatch($application->id, ScoreApplicationJob::SIMPLE);

            return apiResponse(
                $application,
                "Candidature finalisée avec succès !",
                'success',
                200
            );

        }

        // Mission ponctuelle : candidature déjà recevable après la motivation (note provisoire),
        // la note complète remplacera celle-ci une fois l'étape technique répondue
        if($application->mission->type_contrat === 'Mission Ponctuelle') {
            $application->update([
                'status' => 'pending',
                'completed_at' => now(),
            ]);

            ScoreApplicationJob::dispatch($application->id, ScoreApplicationJob::SIMPLE);
        }

        // Questions de l'étape 2 : nécessaires immédiatement (questions de secours si l'IA est indisponible)
        $assessment->update([
            'step_2_data' => $aiService->generateTechnicalQuestions($application->fresh(['mission', 'candidat.rank', 'assessment']))
        ]);

        return apiResponse(
            [
                'next_questions' => $assessment->step_2_data['questions']
            ],
            "Étape 2 générée avec succès !",
            'success',
            200
        );
    }

    public function finalize_assessment(Request $request, Int $applicationId) {
        $request->validate([
            'responses' => 'required|array',
            'responses.*' => 'nullable|string|max:5000',
        ]);

        $application = $request->user()->candidat->applications()->find($applicationId);

        if (!$application || !$application->assessment) {
            return apiResponse(null, "Candidature introuvable !", 'error', 404);
        }

        // L'étape 2 doit avoir été générée et n'est notée qu'une seule fois
        $step2 = $application->assessment->step_2_data;
        if (empty($step2['questions']) || isset($step2['responses'])) {
            return apiResponse(null, "Cette étape a déjà été soumise ou n'est pas disponible.", 'error', 409);
        }

        // Encore un brouillon : la candidature n'a pas été reçue avant la date limite. Une candidature déjà
        // reçue à temps (mission ponctuelle, recevable dès l'étape 1) peut toujours compléter son étape technique.
        if ($application->status === 'draft' && $application->mission?->isPastDeadline()) {
            return apiResponse(null, self::DATE_LIMITE_PASSEE, 'error', 410);
        }

        $assessment = $application->assessment;

        $step2Data = $assessment->step_2_data;
        $step2Data['responses'] = $request->responses;  

        $assessment->update([
            'step_2_data' => $step2Data,
        ]);

        $application->update([
            'status' => 'pending',
            'completed_at' => now(),
        ]);

        // Notation complète en arrière-plan (le front affiche la confirmation sans attendre la note)
        ScoreApplicationJob::dispatch($application->id, ScoreApplicationJob::FULL);

        return apiResponse(
            $application,
            "Candidature finalisée avec succès !",
            'success',
            200
        );
    }

    public function getApplications(Request $request, Candidat $candidat) {
        if ((int) $request->user()->candidat?->id !== (int) $candidat->id) {
            return apiResponse(null, 'Action non autorisée.', 'error', 403);
        }

        $applications = $candidat->applications()
        ->with(['mission', 'assessment', 'mission_offers'])
        ->orderBy('created_at', 'desc')
        ->get();

        return apiResponse(
            $applications,
            'Applications récupérées avec succès',
            'success',
            200
        );
    }
    
}
