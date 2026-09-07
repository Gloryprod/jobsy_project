<?php

namespace App\Services;

use App\Models\Candidat;
use App\Models\Badge;
use App\Models\MissionOffers;
use Illuminate\Support\Facades\DB;

class BadgeEvaluatorService
{
    /**
     * Méthode principale (Orchestrateur)
     */
    public function evaluateAllBadges(Candidat $candidat): void
    {
        $this->evaluateAcademicBadges($candidat);
        $this->evaluateMissionBadges($candidat);
        $this->evaluateCertificationBadges($candidat);
        // $this->evaluateBehaviorBadges($candidat);
    }
    
    /**
     * Évalue et met à jour les badges liés aux missions pour un candidat donné.
     */
    public function evaluateMissionBadges(Candidat $candidat): void
    {
        // 1. Charger toutes les missions validées du candidat
        $completedOffers = MissionOffers::whereHas('application', function ($query) use ($candidat) {
            $query->where('candidat_id', $candidat->id);
        })
        ->whereNotNull('validated_at')
        ->orderBy('validated_at', 'desc')
        ->get();

        $totalCompleted = $completedOffers->count();

        // Missions réussies avec une note >= 4/5
        $highRatedOffers = $completedOffers->filter(fn($offer) => $offer->rating >= 4);

        // Missions validées à l'heure
        $onTimeOffers = $completedOffers->filter(fn($offer) => $offer->is_on_time === true);

        // Série consécutive de missions réussies (Note >= 4 et à l'heure)
        $consecutiveSuccessful = 0;
        foreach ($completedOffers as $offer) {
            if ($offer->rating >= 4 && $offer->is_on_time === true) {
                $consecutiveSuccessful++;
            } else {
                break; // Interruption de la série
            }
        }

        // 2. Définition des règles
        $rules = [
            'MISS_01' => [
                'current' => min($highRatedOffers->count(), 1),
                'max' => 1,
                'should_unlock' => $highRatedOffers->count() >= 1,
            ],
            'MISS_02' => [
                'current' => min($consecutiveSuccessful, 10),
                'max' => 10,
                'should_unlock' => $consecutiveSuccessful >= 10,
            ],
            'MISS_03' => [
                'current' => min($totalCompleted, 50),
                'max' => 50,
                'should_unlock' => $totalCompleted >= 50,
            ],
            'BEHAV_01' => [
                'current' => min($onTimeOffers->count(), 5),
                'max' => 5,
                'should_unlock' => $onTimeOffers->count() >= 5,
            ],
        ];

        // 3. Mise à jour de la table pivot candidat_badges
        $this->syncBadges($candidat, $rules);
    }

    /**
     * Évalue et met à jour les badges académiques et CV (ACAD_01) pour un candidat.
     */
    public function evaluateAcademicBadges(Candidat $candidat): void
    {
        // 1. Charger la relation cv_datas
        $cvData = $candidat->cv_datas;

        $hasEducation = false;

        if ($cvData && !empty($cvData->education)) {
            $education = $cvData->education;

            // Décodage de sécurité si les données sont stockées sous forme de chaîne JSON brute
            if (is_string($education)) {
                $education = json_decode($education, true);
            }

            // Vérification de la présence d'au moins 1 diplôme / formation
            $hasEducation = is_array($education) && count($education) > 0;
        }

        // 2. Définition des règles pour la catégorie Académique
        $rules = [
            'ACAD_01' => [
                'current' => $hasEducation ? 1 : 0,
                'max' => 1,
                'should_unlock' => $hasEducation,
            ],
        ];

        // 3. Mise à jour de la table pivot candidat_badges
        $this->syncBadges($candidat, $rules);
    }

    /**
     * Formations & Certifs (CERT_01, CERT_02, CERT_03)
     */
    public function evaluateCertificationBadges(Candidat $candidat): void
    {
        // 1. Nombre de formations/certifications externes déclarées
        $externalCertificationsCount = $candidat->formations()->count();

        // 2. Nombre de certifications internes validées sur la plateforme (enrollments avec certificate_hash)
        $internalCertificationsCount = $candidat->enrollments()
            ->whereNotNull('certificate_hash')
            ->where('certificate_hash', '!=', '')
            ->count();

        // Total cumulé des certifications vérifiées
        $totalCertifications = $externalCertificationsCount + $internalCertificationsCount;

        // 3. Définition des règles
        $rules = [
            'CERT_01' => [
                'current' => min($totalCertifications, 1),
                'max' => 1,
                'should_unlock' => $totalCertifications >= 1,
            ],
            'CERT_02' => [
                'current' => min($totalCertifications, 5),
                'max' => 5,
                'should_unlock' => $totalCertifications >= 5,
            ],
            'CERT_03' => [
                'current' => min($totalCertifications, 10),
                'max' => 10,
                'should_unlock' => $totalCertifications >= 10,
            ],
        ];

        // 4. Synchronization dans la table pivot via la méthode réutilisable
        $this->syncBadges($candidat, $rules);
    }

    /**
     * Synchronise les règles calculées avec la table pivot `candidat_badges`
     */
    private function syncBadges(Candidat $candidat, array $rules): void
    {
        foreach ($rules as $badgeCode => $ruleData) {
            $badge = Badge::where('code', $badgeCode)->first();
            if (!$badge) {
                continue;
            }

            $pivot = DB::table('candidat_badges')
                ->where('candidat_id', $candidat->id)
                ->where('badge_id', $badge->id)
                ->first();

            if (!$pivot) {
                $candidat->badges()->attach($badge->id, [
                    'unlocked' => $ruleData['should_unlock'],
                    'unlocked_at' => $ruleData['should_unlock'] ? now() : null,
                    'progress_current' => $ruleData['current'],
                    'progress_max' => $ruleData['max'],
                ]);
            } elseif (!$pivot->unlocked) {
                $candidat->badges()->updateExistingPivot($badge->id, [
                    'progress_current' => $ruleData['current'],
                    'progress_max' => $ruleData['max'],
                    'unlocked' => $ruleData['should_unlock'],
                    'unlocked_at' => $ruleData['should_unlock'] ? now() : $pivot->unlocked_at,
                ]);
            }
        }
    }
}