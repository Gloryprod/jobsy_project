<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MissionOffersRequest extends FormRequest
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
            'start_date' => 'required|date|after:today',
            'start_time' => 'required|date_format:H:i',
            'place' => 'required|string|max:255',
            'onboarding_instructions' => 'nullable',
            'contact_person' => 'required|string|max:255',
            'expires_at' => 'required|date|after:today',
        ];
    }
}
