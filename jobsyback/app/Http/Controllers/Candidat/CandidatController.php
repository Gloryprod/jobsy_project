<?php

namespace App\Http\Controllers\Candidat;

use App\Events\CvUploaded;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommunityRequest;
use App\Http\Requests\ConcoursRequest;
use App\Http\Requests\ContactRequest;
use App\Http\Requests\CvRequest;
use App\Http\Requests\DiplomeRequest;
use App\Http\Requests\FormationRequest;
use App\Http\Requests\ProfileInfoRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Jobs\AnalyzeCVJob;
use App\Models\Candidat;
use Illuminate\Support\Facades\Hash;


class CandidatController extends Controller
{
    public function candidatProfile(Request $request)
    {
        $candidat = $request->user()->candidat()
            ->with('contact')
            ->with('cv')
            ->with('diplomes')
            ->with('formations')
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

        $data = $request->only([
            'intitule',
            'niveau',
            'etablissement',
            'pays',
            'annee_obtention',
        ]);

        // Fichier optionnel, déjà validé par DiplomeRequest (pdf, jpg, png, 2 Mo)
        if ($request->hasFile('fichier')) {
            $data['fichier'] = $request->file('fichier')->store('diplomes', 'public');
        }

        $candidat->diplomes()->create($data);

        return apiResponse(null, 'Diplôme ajouté avec succès', 'success', 201);
    }

    public function createFormation(FormationRequest $request)
    {
        $candidat = $request->user()->candidat;

        $data = $request->only([
            'titre',
            'organisme',
        ]);

        // Fichier optionnel, déjà validé par FormationRequest (pdf, jpg, png, 2 Mo)
        if ($request->hasFile('certificat')) {
            $data['certificat'] = $request->file('certificat')->store('certificats', 'public');
        }

        $data['en_cours'] = false;

        $candidat->formations()->create($data);

        return apiResponse(null, 'Formation ajoutée avec succès', 'success', 201);
    }

    public function saveCv(CvRequest $request)
    {

        $candidat = $request->user()->candidat;

        // Un seul CV par candidat : l'ancien est remplacé. Sinon la relation hasOne renvoyait un CV arbitraire
        // (souvent l'ancien) et les fichiers personnels s'accumulaient sur le disque public.
        foreach (\App\Models\Cv::where('candidat_id', $candidat->id)->get() as $oldCv) {
            deleteFile($oldCv->fichier);
            $oldCv->delete();
        }

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

    /**
     * Profil d'un candidat vu par une entreprise (route role:ENTREPRISE).
     * Compétences et parcours toujours visibles ; coordonnées, adresse et date de naissance
     * seulement si le candidat a postulé chez elle ou accepté une de ses propositions.
     */
    public function showProfile(Request $request, $id){
        $candidat = Candidat::with(['rank', 'skills.category', 'user', 'cv_datas'])->find($id);

        if (!$candidat) {
            return apiResponse(null, 'Candidat non trouvé', 'error', 404);
        }

        $canSeeContact = $request->user()->entreprise?->hasRelationshipWith($candidat) ?? false;

        // Analyse brute du CV : jamais exposée (peut contenir coordonnées et données personnelles)
        $candidat->cv_datas?->makeHidden(['raw_ai_data']);
        $candidat->user->makeHidden(['email_verified_at', 'est_actif', 'role']);

        if (!$canSeeContact) {
            $candidat->makeHidden(['adresse', 'date_naissance']);
            $candidat->user->makeHidden(['email', 'telephone']);
        }

        $data = $candidat->toArray();
        $data['contact_visible'] = $canSeeContact;

       return apiResponse($data, 'Candidat récupéré avec succès', 'success', 200);
    }
    
    public function updatePassword(Request $request) {
        $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:8|confirmed',
        ]);

        $candidat = $request->user()->candidat;

        if (!Hash::check($request->currentPassword, $candidat->user->password)) {
            return apiResponse(null, 'Mot de passe actuel incorrect', 'error', 400);
        }

        $candidat->user->password = Hash::make($request->newPassword);
        $candidat->user->save();

        return apiResponse(
             null,
            "Mot de passe mis à jour avec succès !",
            'success',
            200
        );  
    }
}