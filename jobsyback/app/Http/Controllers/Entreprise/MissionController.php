<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\Mission;
use App\Http\Requests\MissionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MissionController extends Controller
{
    public function index(Request $request){
        return apiResponse(
            $mission = Mission::all(),
            'Profil du candidat récupéré avec succès',
            'success',
            200
        );
    }

    public function store(MissionRequest $request)
    {
        $entreprise = $request->user()->entreprise;

        $validated = $request->validated();
        $validated['entreprise_id'] = $entreprise->id;

        $mission = Mission::create($validated);

        return apiResponse(
            $mission,
            "Mission créée avec succès !",
            'success',
            200
        );

    }

    public function show(Mission $mission)
    {
        return response()->json($mission);
    }

    public function update(MissionRequest $request, Mission $mission)
    {
        $mission->update($request->validated());
        return response()->json(['message' => 'Mission mise à jour !']);
    }

    public function destroy(Request $request, Mission $mission)
    {
        $mission->delete();

        return apiResponse(
            null,
            'Mission supprimée avec succès'
        );
    }

    
}