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
use Illuminate\Support\Facades\Gate;
use App\Traits\CanBulkDelete;

class MissionController extends Controller
{
    use CanBulkDelete;

    protected function model() {
        return new Mission;
    }

    // La suppression groupée ne touche que les missions de l'entreprise connectée, sans offre engagée
    protected function bulkDeleteQuery() {
        $engaged = Mission::where('entreprise_id', request()->user()->entreprise->id)
            ->get()
            ->filter->hasEngagedOffers()
            ->modelKeys();

        return Mission::where('entreprise_id', request()->user()->entreprise->id)
            ->whereNotIn('id', $engaged);
    }

    public function index(Request $request){
        $missions = Mission::where('entreprise_id', $request->user()->entreprise->id)
        ->whereNull('closed_at')
        ->orderBy('created_at', 'asc')
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
        Gate::authorize('manage', $mission);

        return response()->json($mission);
    }

    public function update(MissionRequest $request, Mission $mission)
    {
        Gate::authorize('manage', $mission);

        $validated = $request->validated();

        $mission->update($validated);

        return response()->json(['message' => 'Mission mise à jour !']);
    }

    public function deactivate(Mission $mission)
    {
        Gate::authorize('manage', $mission);

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
        Gate::authorize('manage', $mission);

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
        Gate::authorize('manage', $mission);

        if ($mission->hasEngagedOffers()) {
            return apiResponse(null, "Cette mission a une offre acceptée ou des fonds bloqués : terminez ou annulez-la avant de la supprimer.", 'error', 409);
        }

        $mission->delete();

        return apiResponse(
            null,
            'Mission supprimée avec succès'
        );
    }
    
    public function getApplications(Mission $mission)
    {
        if ($mission->entreprise_id !== request()->user()->entreprise->id) {
            return apiResponse(null, 'Accès non autorisé à cette mission.', 'error', 403);
        }
        
        // Brouillons exclus : le candidat n'a pas encore postulé (et ses coordonnées ne doivent pas être visibles)
        // CASE plutôt que FIELD() : FIELD n'existe qu'en MySQL ; les candidatures pas encore notées passent en dernier
        $applications = $mission->applications()
        ->where('status', '!=', 'draft')
        ->with(['candidat.user', 'candidat.rank', 'assessment'])
        ->orderByRaw("CASE badge WHEN 'EXPERT' THEN 1 WHEN 'CONFIRMED' THEN 2 WHEN 'JUNIOR' THEN 3 WHEN 'REJECTED' THEN 4 ELSE 5 END")
        ->orderBy('global_score', 'desc')
        ->get();

        return apiResponse(
            $applications,
            'Applications récupérées avec succès',
            'success',
            200
        );
    }

    public function selectApplicants(MissionOffersRequest $request, Int $applicationId) {
        $application = Application::findOrFail($applicationId);

        // Ajout : vérifier que la mission liée appartient bien à l'entreprise connectée
        if ($application->mission->entreprise_id !== $request->user()->entreprise->id) {
            return apiResponse(null, 'Accès non autorisé à cette candidature.', 'error', 403);
        }

        if ($application->status === 'draft') {
            return apiResponse(null, "Ce candidat n'a pas encore finalisé sa candidature.", 'error', 422);
        }

        $offer = MissionOffers::where('application_id', $application->id)->first();

        if ($offer && !$offer->isReplaceable()) {
            return apiResponse(null, "Une offre est déjà acceptée ou financée pour ce candidat : elle ne peut pas être remplacée.", 'error', 409);
        }

        $application->update(['status' => 'accepted']);

        $validated = $request->validated();
        $validated['application_id'] = $application->id;

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

    public function getConfirmedApplicants(Request $request, Int $id){
        // 404 si la mission n'appartient pas à l'entreprise connectée
        $request->user()->entreprise->missions()->findOrFail($id);

        $offers = MissionOffers::whereHas('application', function($q) use ($id) {
            $q->where('mission_id', $id);
        })
        ->with(['application.candidat.user', 'application.mission', 'application.mission.entreprise.wallet'])
        ->orderBy('created_at', 'desc')
        ->get();

        return apiResponse(
            $offers,
            "Offres récupérées avec succès",
            'success',
            200
        );
    }

    
}