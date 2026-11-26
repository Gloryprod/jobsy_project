<?php

namespace App\Notifications;

use App\Models\Application;
use App\Models\MissionProposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProposalAcceptedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public MissionProposal $proposal;
    public Application $application;

    public function __construct(MissionProposal $proposal, Application $application)
    {
        $this->proposal = $proposal;
        $this->application = $application;
    }

    /**
     * La notification dans l'application part tout de suite ; seul l'e-mail passe par la file d'attente.
     * Sans traitement de file en production, tout restait sinon bloqué, et un e-mail en échec ne doit pas faire échouer la requête.
     *
     * @return array<string, string>
     */
    public function viaConnections(): array
    {
        return ['database' => 'sync'];
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
    public function toMail(object $notifiable): MailMessage
    {
        // Le nom est porté par le compte utilisateur, pas par le profil candidat
        $candidatName = trim(($this->proposal->candidat->user->prenom ?? '') . " " . ($this->proposal->candidat->user->nom ?? '')) ?: 'Un candidat';

        $missionTitle = $this->proposal->mission->title ?? 'votre mission';

        return (new MailMessage)
            ->subject("🎉 Proposition acceptée par {$candidatName} !")
            ->greeting("Bonjour,")
            ->line("Bonne nouvelle ! **{$candidatName}** vient d'accepter votre proposition pour la mission **{$missionTitle}**.")
            ->line("Une candidature a été enregistrée automatiquement pour ce candidat.")
            ->action('Voir la candidature', frontendUrl("/dashboard/entreprises/missions/{$this->proposal->mission_id}/proposals"))
            ->line("Vous pouvez dès à présent le contacter ou finaliser sa proposition d'embauche.");
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type'            => 'proposal_accepted',
            'proposal_id'     => $this->proposal->id,
            'application_id'  => $this->application->id,
            'mission_id'      => $this->proposal->mission_id,
            'mission_title'   => $this->proposal->mission->title ?? '',
            'candidat_id'     => $this->proposal->candidat_id,
            'candidat_name'   => trim(($this->proposal->candidat->user->prenom ?? '') . ' ' . ($this->proposal->candidat->user->nom ?? '')) ?: 'Candidat',
            'message'         => "a accepté votre proposition de mission.",
        ];
    }
}
