<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseCatalogueController extends Controller
{
    public function index(Request $request){
        $courses = Course::with('modules')->get();

        return apiResponse(
            $courses,   
            'Cours récupérés avec succès',
            'success',
            200
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
