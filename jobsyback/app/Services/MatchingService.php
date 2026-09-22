<?php 

namespace App\Services;

use App\Models\Mission;
use App\Models\Candidat;

class MatchingService
{
    /**
     * Calcule le score de matching 100% basé sur les compétences.
     *
     * @param Candidat $candidat
     * @param Mission $mission
     * @return array
     */
    public function calculateMatchScore(Candidat $candidat, Mission $mission): array
    {
        // 1. Compétences requises par la mission (ex: ['react', 'laravel', 'tailwind'])
        $requiredSkills = collect($mission->required_skills ?? [])
            ->map(fn($s) => mb_strtolower(trim($s)))
            ->unique();

        // 2. Compétences cumulées du candidat (déclarées + validées via formations)
        $candidateSkills = collect($candidate->skills ?? [])
            ->merge($candidate->delivered_skills ?? [])
            ->map(fn($s) => mb_strtolower(trim($s)))
            ->unique()
            ->values();

        // 3. Gestion du cas où la mission n'exige aucune compétence spécifique
        if ($requiredSkills->isEmpty()) {
            return [
                'match_score' => 100,
                'skills_breakdown' => [
                    'total_required' => 0,
                    'matched_count'  => 0,
                    'matched'        => [],
                    'missing'        => [],
                ]
            ];
        }

        // 4. Identification des compétences validées et manquantes
        $matchedSkills = $requiredSkills->intersect($candidateSkills)->values();
        $missingSkills = $requiredSkills->diff($candidateSkills)->values();

        // 5. Calcul du pourcentage exact d'adéquation
        $ratio = $matchedSkills->count() / $requiredSkills->count();
        $finalScore = (int) round($ratio * 100);

        return [
            'match_score' => $finalScore,
            'skills_breakdown' => [
                'total_required' => $requiredSkills->count(),
                'matched_count'  => $matchedSkills->count(),
                'matched'        => $matchedSkills->toArray(),
                'missing'        => $missingSkills->toArray(),
            ]
        ];
    }
}