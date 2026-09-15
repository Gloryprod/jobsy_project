<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use App\Models\Enrollment;
use Carbon\Carbon;

class CourseCatalogueController extends Controller
{
    public function index(Request $request){
        $courses = Course::with('modules')->get();

        $courseInfo = [];

        foreach ($courses as $course) {
            $isEnrolled = false;   
            
            $enrollment = Enrollment::where('course_id', $course->id)
            ->where('candidat_id', $request->user()->candidat->id)
            ->first(); 

            if ($request->user() && $request->user()->candidat) {
                if ($enrollment) {
                    $isEnrolled = true;
                }
            }

            $courseInfo[] = [
                'course' => $course,
                'is_enrolled' => $isEnrolled,
                'enrollment' => $enrollment
            ];
        }

        return apiResponse(
            $courseInfo,   
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

    public function enroll(Request $request, Int $courseId)
    {
        $candidatId = $request->user()->candidat->id;

        // 1. Vérifier si le cours existe et s'il est actif
        $course = Course::where('is_active', true)->findOrFail($courseId);

        if (!$course) {
            return apiResponse(
                null,
                'Cours introuvable ou inactif.',
                'error',
                404
            );
        }

        // 2. Vérifier si le candidat est déjà inscrit
        $existingEnrollment = Enrollment::where('course_id', $courseId)
            ->where('candidat_id', $candidatId)
            ->first();

        if ($existingEnrollment) {
            return apiResponse(
                [
                 'is_enrolled' => true,
                 'validation_mode' => $course->validation_mode
                ],
                'Vous êtes déjà inscrit à cette formation.',
                'success',
                200
            );
        }

        // 3. Créer l'inscription initiale en fonction du mode de validation
        // Pour le mode Standard, l'accès est direct et "delivery_status" n'est pas requis
        if($course->validation_mode == "B" || ($course->validation_mode == "C" && $course->type_contenu == "Kit")){

            $enrollment = Enrollment::create([
                'candidat_id'         => $candidatId,
                'course_id'           => $courseId,
                'delivery_status'     => "pending",
                'status'              => "waiting_kit"
            ]);

        }else{

            $enrollment = Enrollment::create([
                'candidat_id'         => $candidatId,
                'course_id'           => $courseId,
            ]);
        }

        

        return apiResponse(
            [
                'is_enrolled' => false,
                'validation_mode' => $course->validation_mode
            ],
            'Inscription validée avec succès ! Bienvenue dans votre formation.',
            'success',
            201
        );
    }

    public function myLearnings(Request $request)
    {
        // 1. Récupération du candidat connecté
        // Adaptable selon tes relations (ex: $request->user()->candidat->id ou $request->user()->id)
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json([
                'success' => false,
                'message' => 'Profil candidat non trouvé.',
            ], 404);
        }

        // 2. Récupération des enrollments avec la relation course et ses modules
        $enrollments = Enrollment::with(['course.modules'])
            ->where('candidat_id', $candidat->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        // 3. Retour au format standard
        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

}
