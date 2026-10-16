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
            ->with('entreprise')
            ->get();

            return apiResponse(
                $missions,
                'Missions récupérées avec succès',
                'success',
                200
            );
        }

    public function show(Int $id)
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

    public function getMissionOffers(Request $request, Int $id)
    {
        // Seules les offres adressées au candidat connecté sont visibles
        $offer = MissionOffers::whereHas('application', fn ($q) => $q->where('candidat_id', $request->user()->candidat->id))
            ->find($id);

        if (!$offer) {
            return apiResponse(null, 'Offre de mission non trouvée', 'error', 404);
        }
        
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
        
        if ((int) $offer->application->candidat_id !== (int) $request->user()->candidat->id) {
            return apiResponse(null, 'Accès refusé', 'error', 403);
        }

        // On ne répond qu'une fois, et pas à une offre expirée
        if ($offer->accepted_at || $offer->declined_at) {
            return apiResponse(null, 'Vous avez déjà répondu à cette offre.', 'error', 409);
        }

        if ($request->status === 'accepted' && $offer->expires_at && $offer->expires_at->isPast()) {
            return apiResponse(null, 'Cette offre a expiré.', 'error', 410);
        }

        if ($request->status === 'accepted') {
            $offer->update([
                'accepted_at' => now(),
                'status' => "accepted"
            ]);
        } else {
            $offer->update(['declined_at' => now(), 'status' => 'declined']);
        }

        return apiResponse(null, 'Réponse enregistrée', 'success', 200);
    }

    public function myconfirmedmissions(Request $request){

        $missionOffers = MissionOffers::whereHas('application', 
            fn($q) => $q->where('candidat_id', $request->user()->candidat->id)
        )->whereNotNull('accepted_at')
        ->orderBy('created_at', 'desc')
        ->with('application.mission')->get();

        return apiResponse($missionOffers, '    ', 'success', 200);
    }

}
