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
    protected function verificationUrl($notifiable)
    {
        // URL backend (pour le lien signé)
        $backendUrl = config('APP_URL'); // ex: http://localhost:8000

        $signedUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification())
            ]
        );

        // Remplacer seulement le domaine backend par le frontend
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $parsedBackend = parse_url($backendUrl, PHP_URL_HOST);
        $parsedFrontend = parse_url($frontendUrl, PHP_URL_HOST);

        return str_replace($parsedBackend, $parsedFrontend, $signedUrl);
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
