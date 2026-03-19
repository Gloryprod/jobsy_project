<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Http\Requests\ApplicationRequest;
use App\Models\Application;
use App\Models\ApplicationAssessments;
use App\Models\Candidat;
use App\Models\Mission;
use App\Services\ApplicationAIService;
use Illuminate\Http\Request;

class CandidatureController extends Controller
{

    public function apply_job(ApplicationRequest $request, $candidat_id, $mission_id, ApplicationAIService $aiService){
        $mission = Mission::find($mission_id);
        $candidat = Candidat::find($candidat_id);

        if (!$mission || !$candidat) {
            return apiResponse(
                "Mission ou candidat introuvable !",
                'error',
                404
            );
        }

        $application = $mission->applications()->updateOrCreate(
           [ 'candidat_id' => $candidat_id],
           [ 'status' => 'draft'],
        );

        $assessment = $application->assessment()->firstOrCreate([]);

        if (!$assessment->step_1_data) {
            $motivationQuestionsJson = $aiService->generateMotivationQuestions($candidat, $mission);
            
            $assessment->update([
                'step_1_data' => json_decode($motivationQuestionsJson, true)
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

    public function submit_step_one(Request $request, $applicationId, ApplicationAIService $aiService ){

        $request->validate([
            'responses' => 'required|array',
        ]);

        $application = Application::find($applicationId);
        $assessment = ApplicationAssessments::find($application->assessment->id);
        $candidat = $application->candidat;

        $step1Data = $assessment->step_1_data;
        $step1Data['responses'] = $request->responses;
        
        $assessment->update([
            'step_1_data' => $step1Data
        ]);

        if ($candidat->rank->rank === 'E' || $candidat->rank->rank === 'D') {

            $analysis = json_decode($aiService->analyzeSimpleApplication($application));

            $application->update([
                'global_score' => $analysis->score,
                'badge' => $analysis->badge,
                'ai_summary' => $analysis->summary,
                'status' => 'pending',
                'completed_at' => now(),
            ]);

            $assessment->update([
                'ai_feedback_details' => $analysis->details
            ]);

            return apiResponse(
                $application,
                "Candidature finalisée avec succès !",
                'success',
                200
            );
            
        }

        try {
            $questionsStep2 = $aiService->generateTechnicalQuestions($application);
            
            $assessment->update([
                'step_2_data' => json_decode($questionsStep2, true)
            ]);

            return apiResponse(
                [
                    'next_questions' => $assessment->step_2_data['questions']
                ],
                "Étape 2 générée avec succès !",
                'success',
                200
            );

        } catch (\Exception $e) {
            return apiResponse(
                "Erreur génération étape 2",
                'error',
                500
            );
        }

        
    }

    public function finalize_assessment(Request $request, $applicationId, ApplicationAIService $aiService) {
        $application = Application::find($applicationId);
        $assessment = $application->assessment;

        $step2Data = $assessment->step_2_data;
        $step2Data['responses'] = $request->responses;  

        $assessment->update([
            'step_2_data' => $step2Data,
        ]);

        $analysis = json_decode($aiService->analyzeFullApplication($application));

        $application->update([
            'global_score' => $analysis->score,
            'badge' => $analysis->badge,
            'ai_summary' => $analysis->summary,
            'status' => 'pending',
            'completed_at' => now(),
        ]);

        $assessment->update([
            'ai_feedback_details' => $analysis->details
        ]);

        return apiResponse(
            $application,
            "Candidature finalisée avec succès !",
            'success',
            200
        );
    }

    public function getApplications(Candidat $candidat) {
        $applications = $candidat->applications()
        ->with(['mission', 'assessment'])
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
