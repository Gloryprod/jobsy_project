<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'nom' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|email|unique:users,email',
            // Même exigence que le formulaire du front et la réinitialisation (sinon contournable par un appel direct)
            'password' => [
                'required', 'string', 'min:8',
                'regex:/[a-z]/',       // minuscule
                'regex:/[A-Z]/',       // majuscule
                'regex:/[0-9]/',       // chiffre
                'regex:/[^a-zA-Z0-9]/' // caractère spécial
            ],
            'role' => 'required|in:JEUNE,ENTREPRISE',
            'bio' => 'nullable|string',
            'adresse' => 'nullable|string',
            'nom_entreprise' => 'nullable|string',
            'secteur_activite' => 'nullable|string',
            'localisation' => 'nullable|string',
            'description' => 'nullable|string',
            'site_web' => 'nullable|string',
        ];
    }

    //  public function failedValidation(Validator $validator)
    // {
    //     throw new HttpResponseException(response()->json([
    //         'status' => 'error',
    //         'message' => 'Erreur de validation',
    //         'errors' => $validator->errors(),
    //     ], 422));
    // }
}   
