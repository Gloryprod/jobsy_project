<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ContactEntrepriseRequest extends FormRequest
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
        // 255 caractères : la taille des colonnes (au-delà, MySQL refuse l'écriture et l'API répondait par une erreur 500)
        return [
            'telephone' => 'nullable|string|max:255',
            'nom_promoteur' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'linkedin' => 'nullable|url|max:255',
            'facebook' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
            'twitter' => 'nullable|url|max:255',
        ];
    }
}
