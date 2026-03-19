<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Entreprise;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request){
        $entreprises = Entreprise::with('user', 'contact_entreprise')->get();
        return apiResponse(
            $entreprises,
            'Entreprises récupérées avec succès',
            'success',
            200
        );
    }

    public function getMissionsEntreprise($id) {
        $entreprise = Entreprise::with([
            'missions.applications.mission_offers', // Charge l'offre liée à la candidature
            'missions.applications.candidat.user'  // Descend de candidature -> candidat -> user
        ])->find($id);

        if (!$entreprise) {
            return apiResponse(null, 'Entreprise non trouvée', 'error', 404);
        }

        return apiResponse($entreprise->missions, 'Missions de l\'entreprise récupérées avec succès', 'success', 200);
    }
}
