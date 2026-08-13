<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Enrollment extends Model
{
    protected $fillable = [
        'candidat_id',
        'course_id',
        'enrolled_at',
        'progress_percentage',
        'status',
        'average_quiz_score',
        'final_project_score',
        'global_score',
        'delivery_status',
        'project_path',
        'admin_feedback',
        'certificate_hash',
        'certified_at',
        'badge'
    ];

    protected $appends = ['badge_details'];

    protected $casts = [
        'certified_at' => 'datetime',
    ];

    public function candidat() {
        return $this->belongsTo(Candidat::class);
    }

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function updateProgress()
    {
        // 1. Récupérer tous los IDs des modules de cette formation
        // On suppose que ton modèle Course a une relation 'modules' ou 'sections'
        $moduleIds = Module::where('course_id', $this->course_id)->pluck('id');

        if ($moduleIds->isEmpty()) {
            $this->update(['progress_percentage' => 0]);
            return 0;
        }

        // 2. COMPTER LES CONTENUS (Capsules / Leçons)
        // Total des capsules physiques (vidéos, pdf) dans ces modules
        $totalLessons = Lesson::whereIn('module_id', $moduleIds)->count();
        
        // Leçons terminées par le candidat (via ta table de suivi de lecture, ex: lesson_progress)
        $completedLessonsCount = LessonProgress::where('candidat_id', $this->candidat_id)
            ->whereIn('lesson_id', $this->course->lessons->pluck('id'))
            ->count();

        // 3. COMPTER LES QUIZ (QCM)
        // Sur Jobsy, chaque module a 1 Quiz. Donc le total de quiz = le nombre de modules.
        $totalQuiz = $moduleIds->count();

        // Nombre de quiz validés (avec is_passed = true)
        $completedQuiz = ModuleResult::where('candidat_id', $this->candidat_id)
            ->whereIn('module_id', $moduleIds)
            ->where('is_passed', true)  
            ->count();

        // 4. CALCUL FINAL DU POURCENTAGE
        $totalElements = $totalLessons + $totalQuiz;
        $elementsValidés = $completedLessonsCount + $completedQuiz;

        $progressPercentage = 0;
        if ($totalElements > 0) {
            $progressPercentage = ($elementsValidés / $totalElements) * 100;
        }

        // Arrondir proprement (ex: 44.44 -> 44 ou 44.5)
        $progressPercentage = round($progressPercentage, 0); 

        // 5. Sauvegarde dans la colonne de ta table enrollments
        // Assure-toi que le nom de ta colonne correspond bien (ex: progress_percentage ou progress)
        $this->update([
            'progress_percentage' => $progressPercentage,
            'status' => $progressPercentage == 100 ? 'evaluation_ready' : 'learning'
        ]); 

        return $progressPercentage;
    }

    // public function updateLearnerGlobalScore(bool $isPassed)
    // {
    //     // Récupérer tous les résultats de quiz pour ce candidat et cette formation
    //     $sumQuizScore = ModuleResult::where('candidat_id', $this->candidat_id)
    //         ->whereHas('module', function($query) {
    //             $query->where('course_id', $this->course_id);
    //         })
    //         ->sum('score');

    //     $finalExamScore = FinalExamResults::where('candidat_id', $this->candidat_id)
    //         ->where('course_id', $this->course_id)
    //         ->first();

    //     // Calculer la moyenne des scores de quiz
    //     $globalScore = $sumQuizScore + ($finalExamScore ? $finalExamScore->score : 0);

    //     $hash = $this->certificate_hash;

    //     // 2. Si l'examen est réussi ET que le candidat n'a pas encore de hash, on en génère un TOUT NOUVEAU
    //     if ($isPassed && is_null($hash)) {
    //         $stringToHash = "jobsy-cert-{$this->candidat_id}-{$this->course_id}-" . now()->timestamp;
    //         $hash = hash('sha256', $stringToHash);
    //         $this->candidat->update(['score' => $this->candidat->score + $this->course->reward_xp]);

    //         // Récupération des compétences transmises par la formation
    //         $deliveredSkills = $this->course->delivered_skills ?? [];

    //         if (!empty($deliveredSkills) && is_array($deliveredSkills)) {
    //             // Appels des méthodes de catégorisation et de synchronisation
    //             processSkillsFromIA($this->candidat, $deliveredSkills);
    //         }
    //     }

    //     // Sauvegarder la moyenne dans la table enrollments
    //     $this->update([
    //         'average_quiz_score' => $sumQuizScore,
    //         'final_project_score' => $finalExamScore ? $finalExamScore->score : 0,  
    //         'global_score' => $globalScore,
    //         'status' => $isPassed ? 'certified' : 'failed',
    //         'certificate_hash'    => $isPassed ? $hash : $this->certificate_hash,
    //         'certified_at'        => $isPassed ? ($this->certified_at ?? \Carbon\Carbon::now()) : null
    //     ]);

    //     return $globalScore;
    // }

    public function updateLearnerGlobalScore(bool $isPassed)
    {
        // 1. Somme des scores (%) obtenus sur les modules de cette formation
        $sumQuizScore = ModuleResult::where('candidat_id', $this->candidat_id)
            ->whereHas('module', function($query) {
                $query->where('course_id', $this->course_id);
            })
            ->sum('score');

        // 2. Nombre total de modules associés à ce cours
        $nbrTotalModule = Module::where('course_id', $this->course_id)->count();

        // Calcul de la moyenne en % des quiz inter-modules
        $quizPercentage = $nbrTotalModule > 0 ? ($sumQuizScore / $nbrTotalModule) : 0;

        // 3. Récupérer le résultat de l'examen final ou du projet
        $finalExamScore = FinalExamResults::where('candidat_id', $this->candidat_id)
            ->where('course_id', $this->course_id)
            ->first();

        $examOrProjectScoreRaw = $finalExamScore ? $finalExamScore->score : 0;

        // 4. Calcul du score global normalisé sur 100% selon le mode de validation
        $globalScore = 0;
        $validationMode = strtoupper($this->course->validation_mode ?? 'A');

        switch ($validationMode) {
            case 'A':
            case 'B':
                // Formations Standards & Logistique : 30% Quiz + 70% Examen Final (/100)
                $globalScore = ($quizPercentage * 0.30) + ($examOrProjectScoreRaw * 0.70);
                break;

            case 'C':
                // Formations Experts : 20% Quiz + 80% Projet Pratique (/20 ramené sur /100)
                $projectScoreInPercent = ($examOrProjectScoreRaw / 20) * 100;
                $globalScore = ($quizPercentage * 0.20) + ($projectScoreInPercent * 0.80);
                break;

            default:
                $globalScore = $quizPercentage;
                break;
        }

        $globalScore = round(min(100, max(0, $globalScore)), 2);

        // 5. Détermination du badge selon le score global
        $badge = null;
        if ($isPassed && $globalScore >= 60) {
            $badge = match (true) {
                $globalScore >= 90 => 'GOLD',
                $globalScore >= 75 => 'SILVER',
                $globalScore >= 60 => 'BRONZE',
                default => null,
            };
        }

        // 6. Génération du certificat et attribution XP
        $hash = $this->certificate_hash;

        if ($isPassed && is_null($hash)) {
            $stringToHash = "jobsy-cert-{$this->candidat_id}-{$this->course_id}-" . now()->timestamp;
            $hash = hash('sha256', $stringToHash);
            $this->candidat->update(['score' => $this->candidat->score + $this->course->reward_xp]);

            $deliveredSkills = $this->course->delivered_skills ?? [];

            if (!empty($deliveredSkills) && is_array($deliveredSkills)) {
                processSkillsFromIA($this->candidat, $deliveredSkills);
            }
        }

        // 7. Sauvegarde dans la table enrollments
        $this->update([
            'average_quiz_score'  => round($quizPercentage, 2),
            'final_project_score' => $examOrProjectScoreRaw,  
            'global_score'        => $globalScore,
            'badge'               => $badge,
            'status'              => $isPassed ? 'certified' : 'failed',
            'certificate_hash'    => $isPassed ? $hash : $this->certificate_hash,
            'certified_at'        => $isPassed ? ($this->certified_at ?? \Carbon\Carbon::now()) : null
        ]);

        return $globalScore;
    }


    public function getBadgeDetailsAttribute(): ?array
    {
        return match ($this->badge) {
            'GOLD' => [
                'code'  => 'GOLD',
                'label' => 'Badge Or - Expert',
                'color' => '#EAB308', // Tailwind yellow-500
                'bg'    => '#FEF9C3',
                'icon'  => 'trophy-gold',
            ],
            'SILVER' => [
                'code'  => 'SILVER',
                'label' => 'Badge Argent - Avancé',
                'color' => '#6B7280', // Tailwind gray-500
                'bg'    => '#F3F4F6',
                'icon'  => 'award-silver',
            ],
            'BRONZE' => [
                'code'  => 'BRONZE',
                'label' => 'Badge Bronze - Validé',
                'color' => '#B45309', // Tailwind amber-700
                'bg'    => '#FEF3C7',
                'icon'  => 'medal-bronze',
            ],
            default => null,
        };
    }
}
