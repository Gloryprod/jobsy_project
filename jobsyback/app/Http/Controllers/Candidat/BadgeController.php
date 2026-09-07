<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Badge;   
use App\Services\BadgeEvaluatorService; 

class BadgeController extends Controller
{
    /**
     * Récupérer l'inventaire complet du candidat (badges débloqués et en cours).
     */
    public function index(Request $request, BadgeEvaluatorService $badgeEvaluator)
    {
        /** @var \App\Models\Candidat $candidat */
        $candidat = $request->user()->candidat; // Adaptez selon votre logique d'auth

        // Évaluer les badges avant de les récupérer
        $badgeEvaluator->evaluateAllBadges($candidat);

        // Récupère tous les badges avec les données pivot pour ce candidat
        $badges = Badge::all()->map(function ($badge) use ($candidat) {
            $userBadge = $candidat->badges->firstWhere('id', $badge->id);

            $unlocked = $userBadge ? (bool) $userBadge->pivot->unlocked : false;
            $equipped = $userBadge ? (bool) $userBadge->pivot->equipped : false;
            
            $progressCurrent = $userBadge ? $userBadge->pivot->progress_current : 0;
            $progressMax = $userBadge ? $userBadge->pivot->progress_max : ($badge->criteria['max'] ?? 100);

            return [
                'id' => (string) $badge->id,
                'code' => $badge->code,
                'name' => $badge->name,
                'description' => $badge->description,
                'category' => $badge->category, // 'badge_mission', 'diplôme', 'certificat'
                'rarity' => $badge->rarity,     // 'commun', 'rare', 'épique', 'légendaire'
                'bonusValue' => (int) $badge->bonus_value,
                'bonusLabel' => $badge->bonus_label,
                'equipped' => $equipped,
                'unlocked' => $unlocked,
                'progress' => [
                    'current' => (int) $progressCurrent,
                    'max' => (int) $progressMax,
                ],
                'issuedAt' => $userBadge && $userBadge->pivot->unlocked_at 
                    ? \Carbon\Carbon::parse($userBadge->pivot->unlocked_at)->translatedFormat('M Y') 
                    : null,
                'skillsUnlocked' => $badge->criteria['skills'] ?? [],
                'diplomes' => $candidat->diplomes,
                'formations' => $candidat->formations,
                'certificatesInfos' => $candidat->enrollments()
                ->with('course')
                ->where('status', 'certified')
                ->whereNotNull('certificate_hash')
                ->where('certificate_hash', '!=', '')
                ->get()
                ->pluck('course') // Extrait le modèle Course de chaque enrollment
                ->filter()        // Supprime les éventuelles valeurs nulles
                ->values()        // Réindexe le tableau
                ->toArray(),
            ];
        });

        return response()->json($badges);
    }

    /**
     * Équiper ou déséquiper un badge sur le profil.
     */
    public function toggleEquip(Request $request, Int $badgeId)
    {
        $request->validate([
            'equipped' => 'required|boolean',
        ]);

        /** @var \App\Models\Candidat $candidat */
        $candidat = $request->user()->candidat;

        // Limite de 5 badges équipés simultanément
        if ($request->equipped) {
            $equippedCount = $candidat->badges()->wherePivot('equipped', true)->count();
            if ($equippedCount >= 5) {
                return response()->json([
                    'message' => 'Vous ne pouvez pas équiper plus de 5 badges sur votre profil.'
                ], 422);
            }
        }

        // Vérification du déblocage
        $pivot = $candidat->badges()->where('badge_id', $badgeId)->first();
        if (!$pivot || !$pivot->pivot->unlocked) {
            return response()->json([
                'message' => 'Impossible d\'équiper un badge non débloqué.'
            ], 403);
        }

        // Mise à jour de la table pivot
        $candidat->badges()->updateExistingPivot($badgeId, [
            'equipped' => $request->equipped,
            'equipped_at' => $request->equipped ? now() : null,
        ]);

        return response()->json([
            'message' => $request->equipped ? 'Badge équipé avec succès.' : 'Badge retiré du profil.',
            'equipped' => $request->equipped
        ]);
    }
}
