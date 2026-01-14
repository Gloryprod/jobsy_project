<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CvDatas;
use App\Models\Rank;

class ProfileController extends Controller
{
    public function setProfileElements(Request $request){
        $candidat = $request->user()->candidat;

        if (!$candidat->is_validate) {

            $rankInfo = Rank::where('rank', "E")->first();

            if ($rankInfo) {
                $candidat->update([
                    'rank_id' => $rankInfo->id,
                ]);

                return apiResponse(
                    $candidat->with('rank')->find($candidat->id),
                    'Profil mis à jour avec le rang' ,
                    'success'
                );
            }
        }

        $cv_data = CvDatas::where('candidat_id', $candidat->id)->first();

        if (!$cv_data) {
            return apiResponse(
                $candidat->id,
                'Données de CV non trouvées, veuillez réessayer le téléchargement de votre CV.',
                'error',
                404
            );
        }

        $diplomes = $cv_data->raw_ai_data['Education'] ?? [];

        // return apiResponse(
        //     $diplomes,
        //     'Profil mis à jour avec le rang ' ,
        //     'success'
        // );

        $dernierDiplome = collect($diplomes)->sortByDesc(function ($item) {
            preg_match('/\d{4}$/', trim($item['Duration']), $matches);
            
            return isset($matches[0]) ? (int)$matches[0] : 0;
        })->first();

        if ($dernierDiplome) {
            $diplomaTitle = strtolower($dernierDiplome['Degree']);
            
            $rankCode = identifyRankCode($diplomaTitle);

            $rankInfo = Rank::where('rank', $rankCode)->first();

            if ($rankInfo) {
                $candidat->update([
                    'rank_id' => $rankInfo->id,
                    'niveau_etude' => $dernierDiplome['Degree'],
                    'domaine_competence' => $cv_data->raw_ai_data['Title'] ?? null,
                ]);

                return apiResponse(
                    $candidat->with('rank')->find($candidat->id),
                    'Profil mis à jour avec le rang ' ,
                    'success'
                );
            }
        }

        return apiResponse(null, 'Impossible d\'identifier le rang.', 'error', 400);

    }   
    
}
