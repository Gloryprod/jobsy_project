<?php 

namespace App\Services;

use App\Models\Mission;
use App\Models\Candidat;
use FontLib\Table\Type\name;
use Illuminate\Support\Facades\Log;

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
        $requiredSkills = collect($mission->skills ?? [])
            ->map(fn($s) => mb_strtolower(trim($s)))
            ->unique();

        // 2. Compétences cumulées du candidat
        $candidateSkills = $candidat->skills
            ->pluck('name')
            ->map(fn($s) => mb_strtolower(trim($s)))
            ->unique();
    

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

        // dd($requiredSkills, $candidateSkills, $matchedSkills, $missingSkills, $finalScore);

        Log::info('RequiredSkill ', ['requiredSkills' => $requiredSkills]);
        Log::info('CandidatSkill : ', ['candidateSkills' => $candidateSkills]);
        Log::info('matchedSkills : ', ['matchedSkills' => $matchedSkills]);
        Log::info('missingSkills : ', ['missingSkills' => $missingSkills]);
        Log::info('Score Final Candidat #' . $candidat->id, ['total' => $finalScore]);

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