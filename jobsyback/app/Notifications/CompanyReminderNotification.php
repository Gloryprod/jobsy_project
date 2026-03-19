<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CompanyReminderNotification extends Notification
{
    use Queueable;

    protected $mission;
    protected $pendingCount;

    public function __construct($mission, $pendingCount)
    {
        $this->mission = $mission;
        $this->pendingCount = $pendingCount;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('⚠️ Échéance dépassée : Statut de vos offres de mission')
            ->line("L'échéance de réponse pour votre mission **{$this->mission->title}** est maintenant dépassée.")
            ->line("Résultat actuel : **{$this->pendingCount} candidat(s)** n'ont pas répondu à temps.")
            ->line("Vous pouvez maintenant choisir de :")
            ->line("1. Clôturer le recrutement avec les candidats ayant accepté.")
            ->line("2. Sélectionner de nouveaux candidats parmi la liste d'attente.")
            ->action('Gérer mes candidatures', url('/admin/missions/' . $this->mission->id))
            ->salutation("L'équipe Recrutement");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
    