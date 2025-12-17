<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'password' => 'required|string|min:6',
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
}   
