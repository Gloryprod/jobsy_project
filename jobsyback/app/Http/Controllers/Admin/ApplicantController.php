<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Candidat;
use App\Services\RankService;

class ApplicantController extends Controller
{
    public function showProfile(Request $request, $id) {
        $candidat = Candidat::with(['rank', 'skills.category', 'user', 'cv_datas', 'diplomes'])->find($id);

        if (!$candidat) {
            return apiResponse(null, 'Candidat non trouvé', 'error', 404);
        }

        return apiResponse($candidat, 'Candidat récupéré avec succès', 'success', 200);
    }

    /**
     * Validation du profil par un admin : le rang déduit du CV (dernier diplôme) est alors appliqué.
     */
    public function validateProfile(Request $request, $id, RankService $rankService) {
        $candidat = Candidat::findOrFail($id);

        $candidat->forceFill(['is_validate' => true])->save();
        $rankService->applyCvRank($candidat);

        return apiResponse(
            $candidat->fresh(['rank', 'skills.category', 'user', 'cv_datas', 'diplomes']),
            'Profil validé : rang mis à jour d\'après le CV',
            'success',
            200
        );
    }
}
