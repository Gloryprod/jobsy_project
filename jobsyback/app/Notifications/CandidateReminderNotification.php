<?php

namespace App\Notifications;

use App\Models\MissionOffers;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CandidateReminderNotification extends Notification
{
    use Queueable;

    protected $offer;
    
    public function __construct(MissionOffers $offer)
    {
        $this->offer = $offer;
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
        $hoursLeft = now()->diffInHours($this->offer->expires_at);

        return (new MailMessage)
            ->subject('⏳ Action requise : Votre offre de mission expire bientôt')
            ->greeting("Bonjour {$notifiable->prenom},")
            ->line("Ceci est un rappel pour la mission chez **{$this->offer->application->mission->company}**.")
            ->line("Il ne vous reste que **{$hoursLeft} heures** pour confirmer ou décliner l'offre avant qu'elle n'expire.")
            ->action('Répondre maintenant', url('/dashboard/offers/' . $this->offer->id))
            ->line("Si vous n'êtes pas disponible, merci de décliner l'offre.");
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'reminder_urgent',
            'message' => "Urgent : Plus que quelques heures pour répondre à l'offre {$this->offer->application->mission->title}.",
            'expires_at' => $this->offer->expires_at
        ];
    }
}
