<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CourseRequest;
use App\Http\Requests\ModuleRequest;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use App\Traits\CanBulkDelete;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    use CanBulkDelete;

    protected function model() {
        return new Course();
    }

    public function index(Request $request){
        $courses = Course::with('modules')->get();

        return apiResponse(
            $courses,
            'Cours récupérés avec succès',
            'success',
            200
        );
    }

    public function store(CourseRequest $request)
    {

        $validated = $request->validated();

        $course = Course::create($validated);

        return apiResponse(
            $course,
            "Cours créé avec succès !",
            'success',
            200
        );

    }

    public function storeModule(ModuleRequest $request){
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();

            // 1. Création du module
            $module = Module::create($validated);

            // 2. Création des leçons via la relation
            if (!empty($validated['lessons'])) {
                foreach ($validated['lessons'] as $index => $lessonData) {
                    if ($request->hasFile("lessons.{$index}.content")) {
                        $file = $request->file("lessons.{$index}.content");
                        
                        // Sauvegarder le fichier dans storage/app/public/lessons
                        $path = $file->store('lessons', 'public');
                        
                        // Remplacer la valeur temporaire par le chemin final (ex: lessons/nom_du_fichier.pdf)
                        $lessonData['content'] = $path;
                    }
                    
                    $module->lessons()->create($lessonData);
                }
            }

            // 3. Création des questions de quiz
            if (!empty($validated['quiz_questions'])) {
                foreach ($validated['quiz_questions'] as $quizData) {
                    $module->quiz_questions()->create($quizData);
                }
            }

            return apiResponse(
                $module->load(['lessons', 'quiz_questions']), // Charge les relations pour la réponse
                "Module et contenu créés avec succès !",
                'success',
                201
            );
        });

    }

    public function editModule(ModuleRequest $request, Module $module) {
        return DB::transaction(function () use ($request, $module) {
            $validated = $request->validated();

            // 1. Mise à jour des infos de base du module
            $module->update($validated);

            // 2. Mise à jour des leçons
            if (isset($validated['lessons'])) {
                // OPTIONNEL : Supprimer physiquement les anciens fichiers avant de supprimer les leçons
                foreach ($module->lessons as $oldLesson) {
                    if ($oldLesson->type !== 'text' && Storage::disk('public')->exists($oldLesson->content)) {
                        Storage::disk('public')->delete($oldLesson->content);
                    }
                }

                // On vide les anciennes leçons
                $module->lessons()->delete();

                foreach ($validated['lessons'] as $index => $lessonData) {
                    // Si un nouveau fichier est uploadé
                    if ($request->hasFile("lessons.{$index}.content")) {
                        $file = $request->file("lessons.{$index}.content");
                        $path = $file->store('lessons', 'public');
                        $lessonData['content'] = $path;
                    } 
                    // Note : Si pas de fichier, $lessonData['content'] contient 
                    // soit le texte (si type text), soit l'ancien chemin renvoyé par le front.

                    $module->lessons()->create($lessonData);
                }
            }

            // 3. Mise à jour du quiz (Correction du nom de la relation ici)
            if (isset($validated['quiz_questions'])) {
                // Suppression des anciennes questions (on utilise bien quiz_questions)
                $module->quiz_questions()->delete(); 
                
                // On peut utiliser createMany pour aller plus vite
                $module->quiz_questions()->createMany($validated['quiz_questions']);
            }

            return apiResponse(
                $module->load(['lessons', 'quiz_questions']),
                "Module et contenu mis à jour avec succès !",
                'success',
                200
            );
        });
    }

    public function show(Course $course)
    {
        return response()->json($course);
    }

    public function update(CourseRequest $request, Course $course)
    {
        $course->update($request->validated());
        return response()->json(['message' => 'Cours mis à jour !']);
    }  
    
    public function destroy(Request $request, Course $course)
    {
        $course->delete();

        return apiResponse(
            null,
            'Cours supprimé avec succès'
        );
    }

    public function getModules(Course $course)
    {
        $modules = $course->modules()->with('lessons', 'quiz_questions')->orderBy('order', 'ASC')->get();

        return apiResponse(
            $modules,
            'Modules récupérés avec succès',
            'success',
            200
        );
    }
    
}
