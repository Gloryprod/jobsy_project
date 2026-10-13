<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\Candidat;
use App\Models\Mission;
use App\Services\MatchingService;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    protected MatchingService $matchingService;

    public function __construct(MatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }

    /**
     * GET /api/entreprise/missions/{missionId}/suggested-candidates
     * Propose les candidats triés par score de compétences pour une mission.
     */
    public function getSuggestedCandidates(Request $request, Mission $mission)
    {
        // 1. Définition du score minimal (50 par défaut, ou dynamique via URL ?min_score=60)
        $minScore = (int) $request->query('min_score', 50);

        // 2. Chargement des candidats (pensez à inclure 'skills' pour optimiser le matching)
        $candidates = Candidat::with(['user', 'skills', 'enrollments', 'equippedBadges'])->get();

        // 3. Transformation et filtrage
        $suggested = $candidates
            ->map(function ($candidate) use ($mission) {
                $matchResult = $this->matchingService->calculateMatchScore($candidate, $mission);

                return [
                    'id'               => $candidate->id,
                    'full_name'        => trim($candidate->user->nom . " " . $candidate->user->prenom),
                    'title'            => $candidate->domaine_competence ?: "Apprenti Junior Jobsy",
                    'match_score'      => $matchResult['match_score'],
                    'skills_breakdown' => $matchResult['skills_breakdown'],
                    'equipped_badges'  => $candidate->equippedBadges,
                ];
            })
            // 4. Filtrage strict sur le score minimal (≥ 50)
            ->filter(fn($item) => $item['match_score'] >= $minScore)
            ->sortByDesc('match_score')
            ->values();

        return response()->json([
            'success'          => true,
            'mission_id'       => $mission->id,
            'mission_title'    => $mission->title,
            'required_skills'  => $mission->skills ?? [],
            'total_candidates' => $suggested->count(),
            'candidates'       => $suggested,
        ]);
    }

    /**
     * GET /api/entreprise/candidates/{candidateId}/full-profile
     * Consultation détaillée du profil candidat par l'entreprise recruteuse.
     */
    public function getCandidateProfileForCompany(Int $candidateId)
    {
        $candidate = Candidat::with([
            'user',
            'diplomes',
            'formations',
            'enrollments',
            'equippedBadges',
        ])->findOrFail($candidateId);

        // Cumul propre des compétences
        $allSkills = $candidate->skills
            ->pluck('name')
            ->unique()
            ->values();

        return response()->json([
            'success' => true,
            'candidate' => [
                'id'                => $candidate->id,
                'full_name'         => $candidate->user->nom . " " . $candidate->user->prenom,
                'title'             => $candidate->domaine_competence || "Apprenti Junior Jobsy",
                'all_skills'        => $allSkills,
                'declared_skills'   => $candidate->skills ?? [],
                'equipped_badges'   => $candidate->equippedBadges,
                'diplomes'          => $candidate->diplomes,
                'formations'          => $candidate->formations,
                'certificatesInfos' => $candidate->enrollments()
                ->with('course')
                ->where('status', 'certified')
                ->whereNotNull('certificate_hash')
                ->where('certificate_hash', '!=', '')
                ->get()
                ->pluck('course', 'certificate_hash') // Extrait le modèle Course de chaque enrollment
                ->filter()        // Supprime les éventuelles valeurs nulles
                ->values()        // Réindexe le tableau
                ->toArray(),
            ]
        ]);
    }


}
