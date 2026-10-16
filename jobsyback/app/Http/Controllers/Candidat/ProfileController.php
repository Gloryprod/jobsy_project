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
