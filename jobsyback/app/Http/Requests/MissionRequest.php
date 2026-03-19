<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class MissionRequest extends FormRequest
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
            'title'       => 'required|string|max:255',
            'company'     => 'required|string|max:255',
            'location'    => 'required|string|max:255',
            'reward'      => 'required|numeric|min:0',
            'duration'    => 'nullable|string',
            'deadline'    => 'required|date|after:today',
            'description' => 'required|string|min:10',
            'skills'      => 'required|array|min:1',
            'skills.*'    => 'string',
            'urgency'     => ['required', Rule::in(['normal', 'urgent', 'premium'])],
            'category'    => 'required|string',
            'min_rank_required'    => 'required|string',
            'test_severity'    => ['required', Rule::in(['light', 'standard', 'expert'])],
            'applicants'  => 'nullable|integer|min:0',
            'type_contrat' => 'required|string|max:255',
        ];
    }
    
}
