<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EntrepriseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom_entreprise' => 'nullable|string|max:255',
            'secteur_activite' => 'nullable|string|max:255',
            'localisation' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'site_web'         => 'nullable|url|max:255',
            'date_creation' => 'nullable|date',
            'nom_officiel' => 'nullable|string|max:255',
            'taille' => 'nullable|string|max:255',
            'logo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',        
        ];
    }
}
