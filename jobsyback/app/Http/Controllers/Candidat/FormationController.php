<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Support\FichiersPrives;
use Illuminate\Http\Request;

class FormationController extends Controller
{
    public function index(Request $request)
    {
        $candidat = $request->user()->candidat;

        return apiResponse(
            $candidat->formations()->latest()->get(),
            'Liste des formations',
            'success',
            200
        );
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'titre' => 'sometimes|required|string',
            'organisme' => 'sometimes|nullable|string',
            'date_debut' => 'sometimes|nullable|date',
            'date_fin' => 'sometimes|nullable|date',
            'en_cours' => 'sometimes|boolean',
            'certificat' => 'sometimes|nullable|file|mimes:pdf,jpg,png',
        ]);

        $formation = $request->user()
            ->candidat
            ->formations()
            ->findOrFail($id);

        // Gestion du fichier certificat (si présent) : l'ancien fichier, personnel, ne reste pas sur le disque
        if ($request->hasFile('certificat')) {
            deleteFile($formation->certificat);
            $path = $request->file('certificat')->store('certificats', FichiersPrives::DISQUE);
            $formation->certificat = $path;
        }

        $formation->update($request->except('certificat'));

        return apiResponse(
            $formation,
            'Formation mise à jour avec succès',
            'success',
            200
        );
    }
}
