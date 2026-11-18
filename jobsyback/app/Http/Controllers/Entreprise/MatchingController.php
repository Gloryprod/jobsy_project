<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\Candidat;
use App\Models\Mission;
use App\Models\Rank;
use App\Services\MatchingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

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
        Gate::authorize('manage', $mission);

        // 1. Définition du score minimal (50 par défaut, ou dynamique via URL ?min_score=60)
        $minScore = (int) $request->query('min_score', 50);

        // 2. Seuls les candidats qui peuvent postuler : rang suffisant (même règle que CandidatureController::apply_job)
        //    et pas encore candidats à cette mission (ils sont déjà dans la liste des candidatures)
        // shortcut: le score est calculé en PHP pour chaque candidat éligible ; à passer en SQL ou en cache si la base grossit
        $requiredPoints = (int) (Rank::where('rank', $mission->min_rank_required ?: 'E')->value('points') ?? 0);
        $candidates = Candidat::with(['user', 'skills', 'enrollments', 'equippedBadges', 'rank'])
            ->when($requiredPoints > 0, fn ($query) => $query->whereHas('rank', fn ($rank) => $rank->where('points', '>=', $requiredPoints)))
            ->whereDoesntHave('applications', fn ($application) => $application->where('mission_id', $mission->id)->where('status', '!=', 'draft'))
            ->get();

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
                    'rank'             => $candidate->rank?->only(['rank', 'label', 'code_hexa']),
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
    public function getCandidateProfileForCompany(Request $request, Int $candidateId)
    {
        $candidate = Candidat::with([
            'user',
            'diplomes',
            'formations',
            'enrollments',
            'equippedBadges',
        ])->findOrFail($candidateId);

        // Scans de diplômes et certificats (pièces personnelles) : seulement après candidature ou proposition acceptée
        if (!($request->user()->entreprise?->hasRelationshipWith($candidate) ?? false)) {
            $candidate->diplomes->each->makeHidden(['fichier']);
            $candidate->formations->each->makeHidden(['certificat']);
        }

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
                'title'             => $candidate->domaine_competence ?: "Apprenti Junior Jobsy",
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
                ->filter(fn ($enrollment) => $enrollment->course)
                // Cours suivi + hash du certificat, pour le lien de vérification publique (/verify/{hash})
                ->map(fn ($enrollment) => $enrollment->course->toArray() + ['certificate_hash' => $enrollment->certificate_hash])
                ->values()
                ->toArray(),
            ]
        ]);
    }


}
