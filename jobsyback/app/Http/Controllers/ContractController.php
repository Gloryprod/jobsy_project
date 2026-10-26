<?php

namespace App\Http\Controllers;

use App\Models\MissionOffers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * Téléchargement du contrat d'une mission. Le PDF contient les noms et la rémunération :
 * il est rangé sur le disque privé et ne sort qu'ici, pour le candidat de l'offre ou l'entreprise de la mission.
 */
class ContractController extends Controller
{
    /**
     * Route: GET /api/mission-offers/{id}/contract
     */
    public function download(Request $request, int $id)
    {
        $offer = MissionOffers::with('application.mission')->find($id);
        $application = $offer?->application;

        if (!$offer || !$application) {
            return apiResponse(null, 'Offre de mission introuvable.', 'error', 404);
        }

        $user = $request->user();
        $estCandidat = $user->candidat && (int) $application->candidat_id === (int) $user->candidat->id;
        $estEntreprise = $user->entreprise && (int) $application->mission?->entreprise_id === (int) $user->entreprise->id;

        if (!$estCandidat && !$estEntreprise) {
            return apiResponse(null, 'Accès non autorisé.', 'error', 403);
        }

        $disque = Storage::disk(MissionOffers::CONTRACT_DISK);
        if (!$offer->contract_path || !$disque->exists($offer->contract_path)) {
            return apiResponse(null, "Le contrat de cette mission n'est pas disponible.", 'error', 404);
        }

        return $disque->download($offer->contract_path, "Contrat_Jobsy_{$application->id}.pdf", [
            'Content-Type' => 'application/pdf',
            // Document personnel : ni cache partagé ni copie conservée par un intermédiaire
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
