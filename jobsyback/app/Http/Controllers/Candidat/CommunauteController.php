<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CommunauteController extends Controller
{
     public function index(Request $request)
    {
        $candidat = $request->user()->candidat;

        return apiResponse(
            $candidat->communautes()->latest()->get(),
            'Liste des communautés',
            'success',
            200
        );
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'required|string',
            'role' => 'nullable|string',
            'annee_entree' => 'nullable|digits:4|integer',
        ]);

        $candidat = $request->user()->candidat;

        $communaute = $candidat->communautes()->findOrFail($id);

        $communaute->update($request->only([
            'nom',
            'role',
            'annee_entree',
        ]));

        return apiResponse(
            $communaute,
            'Communauté mise à jour avec succès',
            'success',
            200
        );
    }
}
