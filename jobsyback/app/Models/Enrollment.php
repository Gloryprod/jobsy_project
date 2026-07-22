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
        'certified_at'
    ];

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

    public function updateLearnerGlobalScore(bool $isPassed)
    {
        // Récupérer tous les résultats de quiz pour ce candidat et cette formation
        $sumQuizScore = ModuleResult::where('candidat_id', $this->candidat_id)
            ->whereHas('module', function($query) {
                $query->where('course_id', $this->course_id);
            })
            ->sum('score');

        $finalExamScore = FinalExamResults::where('candidat_id', $this->candidat_id)
            ->where('course_id', $this->course_id)
            ->first();

        // Calculer la moyenne des scores de quiz
        $globalScore = $sumQuizScore + ($finalExamScore ? $finalExamScore->score : 0);

        $hash = $this->certificate_hash;

        // 2. Si l'examen est réussi ET que le candidat n'a pas encore de hash, on en génère un TOUT NOUVEAU
        if ($isPassed && is_null($hash)) {
            $stringToHash = "jobsy-cert-{$this->candidat_id}-{$this->course_id}-" . now()->timestamp;
            $hash = hash('sha256', $stringToHash);
            $this->candidat->update(['score' => $this->candidat->score + $this->course->reward_xp]);

        }

        // Sauvegarder la moyenne dans la table enrollments
        $this->update([
            'average_quiz_score' => $sumQuizScore,
            'final_project_score' => $finalExamScore ? $finalExamScore->score : 0,  
            'global_score' => $globalScore,
            'status' => $isPassed ? 'certified' : 'failed',
            'certificate_hash'    => $isPassed ? $hash : $this->certificate_hash,
            'certified_at'        => $isPassed ? ($this->certified_at ?? \Carbon\Carbon::now()) : null
        ]);

        return $globalScore;
    }
}
