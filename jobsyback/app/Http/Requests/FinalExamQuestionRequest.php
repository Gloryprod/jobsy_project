<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;         

class FinalExamQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // À sécuriser via tes middlewares/policies admin plus tard
    }

    public function rules(): array
    {
        return [
            'question_text' => [
                'required',
                'string',
                'max:1000',
                // Cette ligne gère automatiquement la création ET la modification
                Rule::unique('final_exam_questions')->ignore($this->question)
            ],
            'options' => 'required|array|min:2', // Au moins 2 choix possibles
            'options.*' => 'required|string|max:255',
            'correct_answers' => 'required|array|min:1', // Au moins 1 bonne réponse
            'correct_answers.*' => 'required|string|max:255',
            'points' => 'integer|min:1',
        ];
    }

    // Validation personnalisée après les règles de base
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $options = $this->input('options') ?? [];
            $correctAnswers = $this->input('correct_answers') ?? [];

            // Vérifier que chaque bonne réponse est bien incluse dans le tableau des options
            foreach ($correctAnswers as $answer) {
                if (!in_array($answer, $options)) {
                    $validator->errors()->add(
                        'correct_answers', 
                        "La réponse '{$answer}' doit faire partie des options fournies."
                    );
                }
            }
        });
    }
}
