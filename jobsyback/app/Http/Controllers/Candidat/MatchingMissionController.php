<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Services\MatchingService;
use Illuminate\Http\Request;


class MatchingMissionController extends Controller
{
    protected MatchingService $matchingService;

    public function __construct(MatchingService $matchingService)
    {
        $this->matchingService = $matchingService;
    }
    /**
     * GET /api/missions/{missionId}/my-match-score
     * Affiche au candidat connecté son adéquation avec une mission.
     */
    public function getMyMatchScoreForMission(Request $request, Int $missionId)
    {
        $candidat = $request->user()->candidat;
        $mission = Mission::findOrFail($missionId);

        $matchResult = $this->matchingService->calculateMatchScore($candidat, $mission);

        return response()->json([
            'success'      => true,
            'mission_id'   => $mission->id,
            'match_result' => $matchResult
        ]);
    }
}
