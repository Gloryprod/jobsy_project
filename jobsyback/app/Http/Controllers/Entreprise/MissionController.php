<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Http\Requests\MissionOffersRequest;
use App\Models\Mission;
use App\Http\Requests\MissionRequest;
use App\Models\Application;
use App\Models\MissionOffers;
use App\Notifications\CandidateSelectedNotification;
use App\Notifications\MissionClosedNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Traits\CanBulkDelete;

class MissionController extends Controller
{
    use CanBulkDelete;

    protected function model() {
        return new Mission;
    }

    public function index(Request $request){
        $missions = Mission::where('entreprise_id', $request->user()->entreprise->id)
        ->whereNull('closed_at')
        ->orderBy('created_at', 'desc')
        ->with('applications.mission_offers')->get();

        return apiResponse(
            $missions,
            'Missions récupérées avec succès',
            'success',
            200
        );
    }

    public function getclosedJobs(Request $request){
        $missions = Mission::where('entreprise_id', $request->user()->entreprise->id)
        ->whereNotNull('closed_at')
        ->orderBy('created_at', 'desc')
        ->with('applications.mission_offers')->get();

        return apiResponse(
            $missions,
            'Missions récupérées avec succès',
            'success',
            200
        );
    }

    public function store(MissionRequest $request)
    {
        $entreprise = $request->user()->entreprise;

        $validated = $request->validated();
        $validated['entreprise_id'] = $entreprise->id;

        $mission = Mission::create($validated);

        return apiResponse(
            $mission,
            "Mission créée avec succès !",
            'success',
            200
        );

    }

    public function show(Mission $mission)
    {
        return response()->json($mission);
    }

    public function update(MissionRequest $request, Mission $mission)
    {
        $mission->update($request->validated());
        return response()->json(['message' => 'Mission mise à jour !']);
    }

    public function deactivate(Mission $mission)
    {
        if ($mission->active) {
            $mission->update([
                'active' => 0
            ]);
            return apiResponse(
                null,
                "Mission désactivée avec succès !",
                'success',
                200
            );
        }

        $mission->update([
            'active' => 1
        ]);

        return apiResponse(
            null,
            "Mission activée avec succès !",
            'success',
            200
        );

    }

    public function close(Mission $mission)
    {
        $mission->update(['closed_at' => now()]);

        $pendingApplications = $mission->applications()
            ->whereIn('status', ['pending', 'draft'])
            ->get();

        foreach ($pendingApplications as $application) {
            $application->update(['status' => 'rejected']);
            
            $application->candidat->user->notify(new MissionClosedNotification($mission));
        }

        return response()->json(['message' => 'Mission clôturée et candidats restants notifiés.']);
    }

    public function destroy(Request $request, Mission $mission)
    {
        $mission->delete();

        return apiResponse(
            null,
            'Mission supprimée avec succès'
        );
    }
    
    public function getApplications(Mission $mission)
    {
        $applications = $mission->applications()
        ->with(['candidat.user', 'assessment'])
        ->orderByRaw("FIELD(badge, 'EXPERT', 'CONFIRMED', 'JUNIOR', 'REJECTED') ASC")
        ->orderBy('global_score', 'desc')
        ->get();

        return apiResponse(
            $applications,
            'Applications récupérées avec succès',
            'success',
            200
        );
    }

    public function selectApplicants(MissionOffersRequest $request, $applicationId) {
        $application = Application::findOrFail($applicationId);
        $application->update(['status' => 'accepted']);

        $validated = $request->validated();
        $validated['application_id'] = $application->id;

        $offer = MissionOffers::where('application_id', $application->id)->first();

        if($offer){
            $offer->delete();
        }

        $mission_offers = MissionOffers::create($validated); 

        $application->candidat->user->notify(new CandidateSelectedNotification($mission_offers));

        return apiResponse(
            null,
            "Candidat sélectionné avec succès !",
            'success',
            200
        );
    }

    
}