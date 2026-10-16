<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;

class AdminDashboardController extends Controller
{
    public function stats(): JsonResponse
    {
        // Répartition des formations par statut pour le graphique / vue d'ensemble
        $enrollmentsByStatus = Enrollment::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'total_candidats' => Candidat::count(),
                'total_entreprises' => Entreprise::count(),
                'total_missions' => Mission::count(),
                'total_certifications' => Enrollment::where('status', 'certified')->count(),
                
                // Métriques de vitalité
                'avg_vitality' => (int) Candidat::avg('vitality'),
                'avg_streak' => (int) Candidat::avg('streak_count'),
                
                // Modération : Remplacement de pending_companies par pending_candidates
                'pending_candidates' => Candidat::where('is_validate', false)->count(),
                'pending_reviews' => Enrollment::where('status', 'pending_review')->count(),

                // Répartition détaillée des formations
                'formations_stats' => [
                    'enrolled' => $enrollmentsByStatus['enrolled'] ?? 0,
                    'waiting_kit' => $enrollmentsByStatus['waiting_kit'] ?? 0,
                    'learning' => $enrollmentsByStatus['learning'] ?? 0,
                    'evaluation_ready' => $enrollmentsByStatus['evaluation_ready'] ?? 0,
                    'pending_review' => $enrollmentsByStatus['pending_review'] ?? 0,
                    'certified' => $enrollmentsByStatus['certified'] ?? 0,
                    'failed' => $enrollmentsByStatus['failed'] ?? 0,
                ]
            ]
        ]);
    }
}
