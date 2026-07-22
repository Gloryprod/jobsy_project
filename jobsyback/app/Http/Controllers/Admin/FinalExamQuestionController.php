<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\FinalExamQuestionRequest;
use App\Models\Course;
use App\Models\FinalExamQuestion;

class FinalExamQuestionController extends Controller
{
    public function index(Int $courseId)
    {
        $course = Course::findOrFail($courseId);
        $questions = FinalExamQuestion::where('course_id', $courseId)->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'course_title' => $course->title,
                'questions' => $questions
            ]
        ]);
    }

    /**
     * Enregistre une nouvelle question pour l'examen final
     */
    public function store(FinalExamQuestionRequest $request, int $courseId)
    {
        // Vérifier que le cours existe
        Course::findOrFail($courseId);

        // Créer la question (le modèle s'occupe du cast array -> JSON)
        $question = FinalExamQuestion::create([
            'course_id' => $courseId,
            'question_text' => $request->question_text,
            'options' => $request->options,
            'correct_answers' => $request->correct_answers,
            'points' => $request->input('points', 1),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Question ajoutée avec succès à l\'examen final.',
            'data' => $question
        ], 201);
    }


    public function update(FinalExamQuestionRequest $request, int $courseId, int $questionId)
    {
        // Vérifier que le cours existe
        Course::findOrFail($courseId);

        // Récupérer la question à mettre à jour
        $question = FinalExamQuestion::where('course_id', $courseId)
            ->where('id', $questionId)
            ->firstOrFail();

        // Mettre à jour la question (le modèle s'occupe du cast array -> JSON)
        $question->update([
            'course_id' => $courseId,
            'question_text' => $request->question_text,
            'options' => $request->options,
            'correct_answers' => $request->correct_answers,
            'points' => $request->input('points', 1),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Question modifiée avec succès.',
            'data' => $question
        ], 201);
    }

    /**
     * Affiche les détails d'une question de l'examen final
     */
    public function show(int $questionId)
    {
        $question = FinalExamQuestion::findOrFail($questionId);

        return response()->json($question);
    }

    /**
     * Supprime une question de l'examen final
     */
    public function destroy(int $courseId, int $questionId)
    {
        $question = FinalExamQuestion::where('course_id', $courseId)
            ->where('id', $questionId)
            ->firstOrFail();

        $question->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Question supprimée avec succès.'
        ]);
    }
}
