<?php

namespace App\Observers;

use App\Models\MissionOffers;
use App\Services\BadgeEvaluatorService;

class MissionOffersObserver
{
    protected BadgeEvaluatorService $badgeEvaluator;

    public function __construct(BadgeEvaluatorService $badgeEvaluator)
    {
        $this->badgeEvaluator = $badgeEvaluator;
    }

    public function updated(MissionOffers $missionOffer): void
    {
        // Déclencher si la mission vient d'être validée (validated_at passe de null à une date)
        if ($missionOffer->wasChanged('validated_at') && !is_null($missionOffer->validated_at)) {
            $candidat = $missionOffer->application->candidat;
            
            if ($candidat) {
                $this->badgeEvaluator->evaluateMissionBadges($candidat);
            }
        }
    }
}
