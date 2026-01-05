<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ConcoursController extends Controller
{
    public function index(Request $request)
    {
        $candidat = $request->user()->candidat;

        return apiResponse(
            $candidat->concours()->latest()->get(),
            'Liste des concours',
            'success',
            200
        );
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string',
            'organisateur' => 'nullable|string',
            'annee' => 'nullable|digits:4|integer',
            'resultat' => 'nullable|string',
        ]);

        $candidat = $request->user()->candidat;

        $concours = $candidat->concours()->findOrFail($id);

        $concours->update($request->only([
            'nom',
            'organisateur',
            'annee',
            'resultat',
        ]));

        return apiResponse(
            $concours,
            'Concours mis à jour avec succès',
            'success',
            200
        );
    }
}
