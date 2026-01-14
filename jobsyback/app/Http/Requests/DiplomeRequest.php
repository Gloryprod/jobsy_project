<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DiplomeRequest extends FormRequest
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
            'id' => 'nullable|exists:diplomes,id',
            'intitule' => 'required|string|max:255|unique:diplomes,intitule,' . $this->input('id'),
            'niveau' => 'nullable|string|max:100',
            'etablissement' => 'nullable|string|max:255',
            'pays' => 'nullable|string|max:100',
            'annee_obtention' => 'nullable|integer|min:1950|max:' . date('Y'),
            'fichier' => 'nullable|file|mimes:pdf,jpg,png|max:2048',
        ];
    }

    public function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => 'Erreur de validation',
            'errors' => $validator->errors(),
        ], 422));
    }
}
