<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExamProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): bool|array
    {
        return [
            'title' => 'required|string|max:255',
            'domain' => 'required|string|max:100',
            'context_rich_text' => 'required|string',
            
            // Validation fine du JSON inputs_schema
            'inputs_schema' => 'required|array|min:1',
            'inputs_schema.*.key' => 'required|string',
            'inputs_schema.*.type' => 'required|in:textarea,url,file',
            'inputs_schema.*.label' => 'required|string|max:255',
            'inputs_schema.*.placeholder' => 'nullable|string|max:255',
            'inputs_schema.*.required' => 'required|boolean',
            
            // Validation fine du JSON evaluation_criteria
            'evaluation_criteria' => 'required|array|min:1',
            'evaluation_criteria.*.name' => 'required|string|max:255',
            'evaluation_criteria.*.max_points' => 'required|integer|min:1',
            
            'passing_score' => 'required|integer|min:10|max:100',
            'time_limit_minutes' => 'nullable|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Le titre du projet est requis.',
            'context_rich_text.required' => 'La mise en contexte détaillée est obligatoire.',
            'inputs_schema.required' => 'Vous devez définir au moins un champ de réponse pour l\'étudiant.',
            'inputs_schema.*.label.required' => 'Chaque champ de réponse doit avoir un libellé.',
            'evaluation_criteria.required' => 'Vous devez spécifier au moins un critère d\'évaluation.',
            'evaluation_criteria.*.max_points.min' => 'Un critère doit valoir au moins 1 point.',
        ];
    }
}