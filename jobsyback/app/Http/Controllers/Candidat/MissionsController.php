<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Mission;
use App\Models\MissionOffers;

class MissionsController extends Controller
{
    public function index(Request $request){
        // return "DEBUG";
        $missions = Mission::where('active', true)
        ->whereNull('closed_at')
        ->orderBy('created_at', 'desc')
        ->get();

        return apiResponse(
            $missions,
            'Missions récupérées avec succès',
            'success',
            200
        );
    }

    public function show($id)
    {
        $mission = Mission::find($id);
        if (!$mission) {
            return apiResponse(null, 'Mission non trouvée', 'error', 404);
        }
        return apiResponse(
            $mission,
            'Mission récupérée avec succès',
            'success',
            200
        );
    }

    public function getMissionOffers($id)
    {
        $offer = MissionOffers::find($id);
        $offer->load('application.mission');
        
        return apiResponse(
            $offer,
            'Offre de mission récupérée avec succès',
            'success',
            200
        );
    }   

    public function respond(Request $request, $id)
    {
        $offer = MissionOffers::findOrFail($id);
        
        if ($offer->application->candidat_id !== $request->user()->candidat->id) {
            return apiResponse(null, 'Accès refusé', 'error', 403);
        }

        if ($request->status === 'accepted') {
            $offer->update(['accepted_at' => now()]);
        } else {
            $offer->update(['declined_at' => now()]);
        }

        return apiResponse(null, 'Réponse enregistrée', 'success', 200);
    }

}
