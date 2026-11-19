<?php

namespace App\Http\Controllers;

use App\Models\Course;

class PublicCourseController extends Controller
{
    /**
     * Catalogue public des formations (page /formations, sans compte) : les formations actives,
     * avec seulement ce qu'une page publique doit montrer. Les modules, leçons et examens restent réservés aux inscrits.
     */
    public function index()
    {
        $courses = Course::where('is_active', true)
            ->withCount('modules')
            ->orderBy('title')
            ->get(['id', 'title', 'description', 'validation_mode', 'delivered_skills', 'reward_xp'])
            ->map(fn (Course $course) => $course->only(['id', 'title', 'description', 'validation_mode', 'delivered_skills', 'reward_xp', 'modules_count']));

        return apiResponse($courses, 'Formations récupérées avec succès', 'success', 200);
    }
}
