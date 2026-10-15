<?php

namespace App\Jobs;

use App\Models\Application;
use App\Services\ApplicationAIService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Notation IA d'une candidature, hors de la requête HTTP (jusqu'à plusieurs appels de 60 s à Groq).
 * « simple » : étape de motivation seule ; « full » : motivation + technique.
 */
class ScoreApplicationJob implements ShouldQueue
{
    use Queueable;

    public const SIMPLE = 'simple';
    public const FULL = 'full';

    public int $tries = 3;

    /** @var int[] secondes entre deux essais (IA saturée, quota Groq...) */
    public array $backoff = [30, 120];

    public function __construct(public int $applicationId, public string $mode)
    {
    }

    public function handle(ApplicationAIService $aiService): void
    {
        $application = Application::with(['mission', 'candidat.rank', 'assessment'])->find($this->applicationId);

        if (!$application || !$application->assessment) {
            return;
        }

        // Une notation complète (étape technique répondue) l'emporte toujours sur la note provisoire de l'étape 1
        if ($this->mode === self::SIMPLE && isset($application->assessment->step_2_data['responses'])) {
            return;
        }

        $analysis = $this->mode === self::FULL
            ? $aiService->analyzeFullApplication($application)
            : $aiService->analyzeSimpleApplication($application);

        $application->update([
            'global_score' => $analysis['score'],
            'badge' => $analysis['badge'],
            'ai_summary' => $analysis['summary'],
        ]);

        $application->assessment->update([
            'ai_feedback_details' => $analysis['details'],
        ]);
    }

    /**
     * IA indisponible après tous les essais : le recruteur est prévenu qu'il doit évaluer lui-même.
     */
    public function failed(?Throwable $exception): void
    {
        Log::error("Notation IA impossible pour la candidature {$this->applicationId} : " . $exception?->getMessage());

        Application::whereKey($this->applicationId)->update([
            'ai_summary' => "Évaluation automatique indisponible : candidature à examiner manuellement.",
        ]);
    }
}
