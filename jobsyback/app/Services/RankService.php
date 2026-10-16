<?php

namespace App\Services;

use App\Models\Candidat;
use App\Models\CvDatas;
use App\Models\Rank;

/**
 * Rang d'un candidat déduit de son dernier diplôme (données CV extraites par l'IA).
 */
class RankService
{
    /**
     * Rang correspondant au diplôme le plus récent du CV, ou null si le CV n'a pas encore été analysé.
     *
     * @return array{rank: Rank, degree: string, title: ?string}|null
     */
    public function rankFromCv(Candidat $candidat): ?array
    {
        $cvData = CvDatas::where('candidat_id', $candidat->id)->first();

        if (!$cvData) {
            return null;
        }

        $diplomes = $cvData->raw_ai_data['Education'] ?? [];

        $dernierDiplome = collect($diplomes)->sortByDesc(function ($item) {
            preg_match('/\d{4}$/', trim((string) ($item['Duration'] ?? '')), $matches);

            return isset($matches[0]) ? (int)$matches[0] : 0;
        })->first();

        if (!$dernierDiplome || empty($dernierDiplome['Degree'])) {
            return null;
        }

        $rank = Rank::where('rank', identifyRankCode(strtolower($dernierDiplome['Degree'])))->first();

        return $rank ? [
            'rank' => $rank,
            'degree' => $dernierDiplome['Degree'],
            'title' => $cvData->raw_ai_data['Title'] ?? null,
        ] : null;
    }

    /**
     * Applique le rang du CV s'il est supérieur au rang actuel (jamais de rétrogradation),
     * sans faire perdre l'XP déjà gagnée (missions, formations).
     */
    public function applyCvRank(Candidat $candidat): bool
    {
        $result = $this->rankFromCv($candidat);

        if (!$result) {
            return false;
        }

        $current = $candidat->rank;

        if ($current && $result['rank']->points <= $current->points) {
            return false;
        }

        $candidat->update([
            'rank_id' => $result['rank']->id,
            'niveau_etude' => $result['degree'],
            'domaine_competence' => $candidat->domaine_competence ?: $result['title'],
            'score' => max((int) $candidat->score, (int) $result['rank']->points),
        ]);

        return true;
    }
}
