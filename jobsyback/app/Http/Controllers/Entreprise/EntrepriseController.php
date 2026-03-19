<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContactEntrepriseRequest;
use App\Http\Requests\EntrepriseRequest;
use App\Models\Entreprise;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class EntrepriseController extends Controller
{
    public function index(Request $request)
    {
        $contact = $request->user()->entreprise()->with('contact_entreprise')->first();

        return apiResponse(
            $contact,
            'Contact de l\'entreprise récupéré avec succès',
            'success',
            200
        );
    }

    public function update(EntrepriseRequest $request, $id)
    {
        $entreprise = Entreprise::findOrFail($id);

        $data = $request->validated();

        if ($request->hasFile('logo')) {
            if ($entreprise->logo) {
                Storage::disk('public')->delete($entreprise->logo);
            }

            $path = $request->file('logo')->store('logos', 'public');
            $data['logo'] = $path;
        }

        $entreprise->update($data);

        return response()->json([
            'data' => $entreprise,
            'message' => 'Mise à jour réussie',
            'status' => 'success'
        ], 200);
    }

    public function updateContact(ContactEntrepriseRequest $request, $id)
    {
        $entreprise = Entreprise::findOrFail($id);

        $data = $request->validated();

        $contact = $entreprise->contact_entreprise()->updateOrCreate(
            ['entreprise_id' => $entreprise->id],
            $request->only([
                'telephone',
                'nom_promoteur',
                'email',
                'linkedin',
                'facebook',
                'instagram',
                'twitter',
            ])
        );

        return apiResponse(
            $contact,
            "Contact de l'entreprise mis à jour avec succès",
            'success',
            200
        );

    }

    public function updatePassword(Request $request) {
        $request->validate([
            'currentPassword' => 'required',
            'newPassword' => 'required|min:8|confirmed',
        ]);

        $entreprise = $request->user()->entreprise;

        if (!Hash::check($request->currentPassword, $entreprise->user->password)) {
            return apiResponse(null, 'Mot de passe actuel incorrect', 'error', 400);
        }

        $entreprise->user->password = Hash::make($request->newPassword);
        $entreprise->user->save();

        return apiResponse(
            null,
            "Mot de passe mis à jour avec succès !",
            'success',
            200
        ); 
    }
    
}
