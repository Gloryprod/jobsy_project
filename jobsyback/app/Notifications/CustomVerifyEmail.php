<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends VerifyEmail
{
    /**
     * Get the verification URL for the given notifiable.
     */
    /**
     * Lien signé vers l'API (la signature couvre l'hôte : il ne doit pas être réécrit),
     * qui valide l'email puis redirige vers la page /email-verified du front.
     */
    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification())
            ]
        );
    }


    /**
     * Build the mail representation of the notification.
     */
    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Confirmez votre email sur Jobsy !')
            ->greeting('Bonjour ' . $notifiable->prenom . ' !')
            ->line('Merci de vous être inscrit sur Jobsy. Pour activer votre compte, cliquez sur le bouton ci-dessous :')
            ->action('Confirmer mon email', $this->verificationUrl($notifiable))
            ->line('Si vous n’avez pas créé de compte, aucune action n’est requise.')
            ->salutation('À bientôt sur Jobsy 👋');
    }
}
