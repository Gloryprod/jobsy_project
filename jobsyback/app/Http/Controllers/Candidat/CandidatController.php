<?php

namespace App\Http\Controllers\Candidat;

use App\Events\CvUploaded;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityRequest;
use App\Http\Requests\ConcoursRequest;
use App\Http\Requests\ContactRequest;
use App\Http\Requests\CvRequest;
use App\Http\Requests\DiplomeRequest;
use App\Http\Requests\ProfileInfoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Jobs\AnalyzeCVJob;
use App\Models\Candidat;


class CandidatController extends Controller
{
    public function candidatProfile(Request $request)
    {
        $candidat = $request->user()->candidat()
            ->with('contact')
            ->with('cv')
            ->with('diplomes')
            ->with('rank')
            ->first();

        return apiResponse(
            $candidat,
            'Profil du candidat récupéré avec succès',
            'success',
            200
        );
    }

    public function updateInfo(ProfileInfoRequest $request)
    {
        $candidat = $request->user()->candidat;
        $candidat->update($request->only([
            'date_naissance',
            'sexe',
            'nationalite',
            'ville',
            'bio',
            'adresse',
        ]));

        return apiResponse(
            $candidat,
            'Informations du candidat mises à jour avec succès',
            'success',
            200
        );
    }

    public function updateContact(ContactRequest $request)
    {
        $candidat = $request->user()->candidat;

        $contact = $candidat->contact()->updateOrCreate(
            ['candidat_id' => $candidat->id],
            $request->only([
                'telephone',
                'email_secondaire',
                'linkedin',
                'whatsapp',
            ])
        );

        return apiResponse(
            $contact,
            'Contact du candidat mis à jour avec succès',
            'success',
            200
        );
    }

    public function createDiplome(DiplomeRequest $request)
    {
        
        $candidat = $request->user()->candidat;
        
        $path = $request->file('fichier')->store('diplomes', 'public');

        $data = $request->only([
            'intitule',
        ]);

        if ($request->hasFile('fichier')) {
            $data['fichier'] = $path;
        }
       
        $candidat->diplomes()->create($data);
        $message = 'Diplôme ajouté avec succès';
        $status = 201;

        return apiResponse(
            $message,
            'success',
            $status
        );
    }

    public function createFormation(Request $request)
    {
        $candidat = $request->user()->candidat;

        $formation = null;
        if ($request->filled('id')) {
            $formation = $candidat->formations()
                ->where('id', $request->id)
                ->firstOrFail();
        }

        if ($request->hasFile('certificat')) {

            if ($formation && $formation->certificat) {
                Storage::disk('public')->delete($formation->certificat);
            }

            $path = $request->file('certificat')->store('certificats', 'public');
        }

        $data = $request->except(['id', 'certificat']);

        if (isset($path)) {
            $data['certificat'] = $path;
        }

        if ($formation) {
            $formation->update($data);
            $message = 'Formation mise à jour avec succès';
            $status = 200;
        } else {
            $candidat->formations()->create($data);
            $message = 'Formation ajoutée avec succès';
            $status = 201;
        }

        return apiResponse(
            null,
            $message,
            'success',
            $status
        );
    }

    public function saveCv(CvRequest $request)
    {

        $candidat = $request->user()->candidat;

        // if ($candidat->cv) {
        //     Storage::disk('public')->delete($candidat->cv->fichier);
        //     $candidat->cv()->delete();
        // }

        $path = $request->file('fichier')->store('cvs', 'public');

        $candidat->cv()->create([
            'fichier' => $path,
            'is_active' => true,
        ]);

        // event(new CvUploaded($candidat->cv->id));

        AnalyzeCVJob::dispatch($path, $candidat->id);

        return apiResponse(null, 'CV mis à jour avec succès', 'success', 201);
    }

    public function saveConcours(ConcoursRequest $request)
    {

        $candidat = $request->user()->candidat;

        if ($request->filled('id')) {
            $concours = $candidat->concours()->findOrFail($request->id);
            $concours->update($request->except('id'));
            $message = 'Concours mis à jour avec succès';
        } else {
            $candidat->concours()->create($request->all());
            $message = 'Concours ajouté avec succès';
        }

        return apiResponse(null, $message, 'success', 200);
    }

    public function saveCommunaute(CommunityRequest $request)
    {

        $candidat = $request->user()->candidat;

        if ($request->filled('id')) {
            $communaute = $candidat->communautes()->findOrFail($request->id);
            $communaute->update($request->except('id'));
            $message = 'Communauté mise à jour avec succès';
        } else {
            $candidat->communautes()->create($request->all());
            $message = 'Communauté ajoutée avec succès';
        }

        return apiResponse(null, $message, 'success', 200);
    }

    public function deleteCv(Request $request)
    {
        $candidat = $request->user()->candidat;

        if (!$candidat->cv) {
            return apiResponse(null, 'Aucun CV à supprimer', 'error', 404);
        }

        // Supprimer le fichier
        deleteFile($candidat->cv->fichier);

        // Supprimer en base
        $candidat->cv()->delete();

        return apiResponse(null, 'CV supprimé avec succès', 'success', 200);
    }

    public function deleteDiplome(Request $request, $id)
    {
        $candidat = $request->user()->candidat;

        $diplome = $candidat->diplomes()->findOrFail($id);

        if ($diplome->fichier) {
            deleteFile($diplome->fichier);
        }

        $diplome->delete();

        return apiResponse(null, 'Diplôme supprimé avec succès', 'success', 200);
    }

    public function deleteFormation(Request $request, $id)
    {
        $candidat = $request->user()->candidat;

        $formation = $candidat->formations()->findOrFail($id);

        if ($formation->certificat) {
            deleteFile($formation->certificat);
        }

        $formation->delete();

        return apiResponse(null, 'Formation supprimée avec succès', 'success', 200);
    }

    public function deleteConcours(Request $request, $id)
    {
        $candidat = $request->user()->candidat;

        $concours = $candidat->concours()->findOrFail($id);

        $concours->delete();

        return apiResponse(null, 'Concours supprimé avec succès', 'success', 200);
    }

    public function deleteCommunaute(Request $request, $id)
    {
        $candidat = $request->user()->candidat;

        $communaute = $candidat->communautes()->findOrFail($id);

        $communaute->delete();

        return apiResponse(null, 'Communauté supprimée avec succès', 'success', 200);
    }

    public function showProfile(Request $request, $id){
        $candidat = Candidat::with(['rank', 'skills.category', 'user', 'cv_datas'])->find($id);

        if (!$candidat) {
            return apiResponse(null, 'Candidat non trouvé', 'error', 404);
        }

       return apiResponse($candidat, 'Candidat récupéré avec succès', 'success', 200);
    }    
}
