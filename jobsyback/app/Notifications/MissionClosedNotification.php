<?php

namespace App\Notifications;

use App\Models\Mission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MissionClosedNotification extends Notification
{
    use Queueable;
    protected $mission;

    /**
     * Create a new notification instance.
     */
    public function __construct(Mission $mission)
    {
        $this->mission = $mission;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Mise à jour de votre candidature : ' . $this->mission->title)
            ->greeting("Bonjour {$notifiable->prenom},")
            ->line("Nous vous informons que le processus de recrutement pour la mission **\"{$this->mission->title}\"** est désormais clôturé.")
            ->line("Malgré la qualité de votre profil, celui-ci n'a pas été retenu pour cette mission spécifique.")
            ->line("L'entreprise a terminé sa sélection parmi l'ensemble des candidatures reçues.")
            ->action('Voir d\'autres opportunités', url('/dashboard/missions/explorer'))
            ->line("Nous vous encourageons vivement à continuer de postuler à d'autres offres correspondant à vos compétences.")
            ->salutation("L'équipe de recrutement.");
    }

    /**
     * Données stockées en base de données pour ton dashboard React
     */
    public function toArray($notifiable): array
    {
        return [
            'mission_id' => $this->mission->id,
            'mission_title' => $this->mission->title,
            'company_name' => $this->mission->company,
            'type' => 'mission_closed',
            'message' => "Le recrutement pour la mission {$this->mission->title} est terminé.",
            'closed_at' => now()->toDateTimeString(),
        ];
    }
}
