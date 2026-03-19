<?php

namespace App\Notifications;

use App\Models\Mission;
use App\Models\MissionOffers;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CandidateSelectedNotification extends Notification implements ShouldQueue
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
        return (new MailMessage)
            ->subject('Félicitations ! Vous avez été sélectionné pour une mission sur Jobsy 🎉')
            ->greeting("Bonjour {$notifiable->prenom} !")
            ->line("Nous avons le plaisir de vous informer que vous avez été retenu pour la mission : " . $this->offer->application->mission->title)
            ->line("Date de début : " . $this->offer->start_date->format('d/m/Y') . " à " . $this->offer->start_time)            
            ->line("Lieu : " . $this->offer->place)
            ->action('Confirmer ma participation', url('/dashboard/candidats/missions/offers/' . $this->offer->id))
            ->line('Veuillez confirmer votre disponibilité avant le ' . $this->offer->expires_at->format('d/m/Y H:i'))
            ->line('Merci de votre confiance !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */

    public function toArray($notifiable): array
    {
        return [
            'offer_id' => $this->offer->id,
            'mission_title' => $this->offer->application->mission->title,
            'company' => $this->offer->application->mission->company,
            'start_date' => $this->offer->start_date,
            'message' => "Votre candidature pour le poste ou la mission de {$this->offer->application->mission->title} a été acceptée.",
            'type' => 'mission_selection'
        ];
    }
}
