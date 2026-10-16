<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Services\RankService;
use Illuminate\Http\Request;
use App\Models\CvDatas;
use App\Models\Rank;

class ProfileController extends Controller
{
    public function setProfileElements(Request $request, RankService $rankService){
        $candidat = $request->user()->candidat;

        // Profil pas encore validé par un admin : rang de départ E
        if (!$candidat->is_validate) {

            $rankInfo = Rank::where('rank', "E")->first();

            if ($rankInfo) {
                if(!$candidat->rank){
                    $candidat->update([
                        'rank_id' => $rankInfo->id,
                        'score' => $rankInfo->points
                    ]);
                }

                return apiResponse(
                    $candidat->with('rank', 'skills')->find($candidat->id),
                    'Profil mis à jour avec le rang' ,
                    'success'
                );
            }
        }

        if (!CvDatas::where('candidat_id', $candidat->id)->exists()) {
            return apiResponse(
                $candidat->id,
                'Données de CV non trouvées, veuillez réessayer le téléchargement de votre CV.',
                'error',
                404
            );
        }

        // Profil validé : rang déduit du dernier diplôme du CV (uniquement à la hausse)
        $rankService->applyCvRank($candidat);

        return apiResponse(
            $candidat->with('rank', 'skills')->find($candidat->id),
            'Profil mis à jour avec le rang ' ,
            'success'
        );
    }

}
