<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

/**
 * Le candidat change de rang grâce à son expérience réelle (« réévaluation » dans le tableau de bord).
 * Stockée en base uniquement : elle apparaît dans les notifications du candidat, sans email.
 */
class RankPromotedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ?string $ancienRang,
        public string $nouveauRang,
        public int $score,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $depuis = $this->ancienRang ? "du rang {$this->ancienRang} au rang {$this->nouveauRang}" : "au rang {$this->nouveauRang}";

        return [
            'type' => 'rank_promoted',
            'previous_rank' => $this->ancienRang,
            'rank' => $this->nouveauRang,
            'score' => $this->score,
            // La page des notifications affiche mission_title comme titre
            'mission_title' => "Réévaluation : rang {$this->nouveauRang}",
            'message' => "Avec {$this->score} XP d'expérience réelle, tu passes {$depuis}. Les missions de rang {$this->nouveauRang} te sont ouvertes.",
        ];
    }
}
