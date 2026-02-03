<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Http\Requests\DiplomeRequest;
use App\Models\CvDatas;
use Illuminate\Http\Request;

class DiplomeController extends Controller
{
    public function index(Request $request)
    {
        $candidat = $request->user()->candidat;

        return apiResponse(
            $candidat->diplomes()->latest()->get(),
            'Liste des diplômes',
            'success',
            200
        );
    }

    public function update(DiplomeRequest $request, $id)
    {
        $diplome = $request->user()
            ->candidat
            ->diplomes()
            ->findOrFail($id);

        $diplome->update($request->only([
            'intitule',
            'etablissement',
            'annee'
        ]));

        return apiResponse(
            $diplome,
            'Diplôme mis à jour',
            'success',
            200
        );
    }

}
