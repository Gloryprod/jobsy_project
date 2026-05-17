<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CourseRequest extends FormRequest
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
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'validation_mode' => 'required|in:A,B,C',
            'delivered_skills'      => 'required|array|min:1',
            'delivered_skills.*'    => 'string',
            'reward_xp' => 'required|integer|min:0',
            'reward_asset' => 'nullable|string|max:255',
        ];
    }
}
