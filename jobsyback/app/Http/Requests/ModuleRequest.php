<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\SanitizesHtmlFields;
use Illuminate\Foundation\Http\FormRequest;

class ModuleRequest extends FormRequest
{
    use SanitizesHtmlFields;

    protected array $htmlFields = ['description'];

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
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'required|integer|min:1',

            // Validation des leçons
            'lessons' => 'nullable|array',
            'lessons.*.title' => 'required|string',
            'lessons.*.type' => 'required|in:video,text,pdf,quiz_check',
            // Texte, chemin déjà stocké, ou fichier. Un fichier n'est accepté que dans le format de la leçon :
            // un HTML/SVG servi depuis /storage s'exécuterait sur le domaine de l'API, à côté des cookies de session.
            'lessons.*.content' => [
                'required',
                function ($attribute, $value, $fail) {
                    if (!$value instanceof \Illuminate\Http\UploadedFile) {
                        return;
                    }

                    $index = explode('.', $attribute)[1] ?? null;
                    $type = $this->input("lessons.{$index}.type");
                    $allowed = ['pdf' => ['pdf'], 'video' => ['mp4', 'webm', 'mov', 'qt']][$type] ?? [];

                    if (!in_array(strtolower((string) $value->guessExtension()), $allowed, true)) {
                        $fail("Fichier refusé pour une leçon de type « {$type} » (formats acceptés : " . (implode(', ', $allowed) ?: 'aucun fichier') . ").");
                    }
                },
            ],
            'lessons.*.duration_minutes' => 'required|integer',
            'lessons.*.order' => [
                'required',
                'integer',
                function ($attribute, $value, $fail) {
                    // On récupère tous les "order" du tableau lessons envoyé
                    $orders = collect($this->input('lessons'))->pluck('order');
                    
                    // On compte combien de fois cette valeur apparaît dans le tableau
                    if ($orders->whereStrict(null, $value)->count() > 1) {
                        $fail("L'ordre {$value} est utilisé plusieurs fois dans vos leçons.");
                    }
                },
            ],

            // Validation des quiz
            'quiz_questions' => 'nullable|array',
            'quiz_questions.*.question_text' => 'required|string',
            'quiz_questions.*.points' => 'required|integer',
            'quiz_questions.*.options' => 'required|array',
            'quiz_questions.*.correct_answers' => 'required|array',
        ];
    }
}
