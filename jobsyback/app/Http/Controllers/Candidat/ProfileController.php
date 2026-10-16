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

        if (!$candidat) {
            return apiResponse(null, 'Profil candidat introuvable.', 'error', 404);
        }

        // --- MISE À JOUR DU STREAK ET DE LA VITALITÉ À CHAQUE CHARGEMENT DU PROFIL ---
        $now = \Carbon\Carbon::now();
        $lastActivity = $candidat->last_activity_at ? \Carbon\Carbon::parse($candidat->last_activity_at) : null;

        $streakCount = $candidat->streak_count ?? 1;
        $vitality = $candidat->vitality ?? 100;

        if (!$lastActivity) {
            // Première activité enregistrée
            $streakCount = 1;
            $vitality = 100;
        } elseif ($lastActivity->isYesterday()) {
            // Activité hier -> On incrémente le streak d'un jour
            $streakCount += 1;
            $vitality = min(100, $vitality + 5); // Petit bonus de vitalité
        } elseif ($lastActivity->isToday()) {
            // Déjà actif aujourd'hui, on ne change rien au streak
        } else {
            // Plus de 48h sans connexion -> Baisse de vitalité et reset du streak
            $streakCount = 1;
            $vitality = max(20, $vitality - 15);
        }

        // Enregistrement des métriques de gamification
        $candidat->update([
            'streak_count' => $streakCount,
            'vitality' => $vitality,
            'last_activity_at' => $now,
        ]);

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
                if(!$candidat->rank){
                    $candidat->update([
                        'rank_id' => $rankInfo->id,
                        'niveau_etude' => $dernierDiplome['Degree'],
                        'domaine_competence' => $cv_data->raw_ai_data['Title'] ?? null,
                        'score' => $rankInfo->points
                    ]);
                }
                
                return apiResponse(
                    $candidat->with('rank', 'skills')->find($candidat->id),
                    'Profil mis à jour avec le rang ' ,
                    'success'
                );
            }
        }

        return apiResponse(null, 'Impossible d\'identifier le rang.', 'error', 400);

    }   
    
}
