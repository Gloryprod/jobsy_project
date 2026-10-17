<?php

namespace App\Services;

use App\Models\Candidat;
use App\Models\CvDatas;
use App\Models\Rank;
use App\Notifications\RankPromotedNotification;

/**
 * Rang d'un candidat : le diplôme du CV fixe le rang de départ, puis l'expérience réelle (score)
 * le fait monter dès qu'elle atteint le seuil d'un rang supérieur. Le rang ne descend jamais.
 */
class RankService
{
    /**
     * Rang le plus élevé dont le seuil (ranks.points) est atteint par ce score.
     */
    public function rankFromScore(int $score): ?Rank
    {
        return Rank::where('points', '<=', max(0, $score))->orderByDesc('points')->first();
    }

    /**
     * À appeler après chaque gain d'XP (mission validée, formation certifiée).
     * Monte le candidat au rang que son score atteint, sans jamais le faire descendre
     * (un rang obtenu par diplôme reste acquis), et le prévient par une notification.
     *
     * @return bool true si le candidat a changé de rang
     */
    public function syncRankWithScore(Candidat $candidat): bool
    {
        $cible = $this->rankFromScore((int) $candidat->score);
        $actuel = $candidat->rank()->first();

        if (!$cible || ($actuel && $cible->points <= $actuel->points)) {
            return false;
        }

        $candidat->update(['rank_id' => $cible->id]);
        $candidat->setRelation('rank', $cible);

        // Envoyée après la validation de la transaction en cours, s'il y en a une
        $candidat->user?->notify(
            (new RankPromotedNotification($actuel?->rank, $cible->rank, (int) $candidat->score))->afterCommit()
        );

        return true;
    }

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
