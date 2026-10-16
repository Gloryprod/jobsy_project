<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPasswordNotification extends ResetPassword
{
    public function toMail($notifiable)
    {
        $frontendUrl = rtrim(frontendUrl(), '/');

        $resetUrl = $frontendUrl . '/reset-password?token='
            . $this->token
            . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe')
            ->greeting('Bonjour 👋')
            ->line('Vous recevez cet email parce qu’une demande de réinitialisation de mot de passe a été effectuée.')
            ->action('Réinitialiser mon mot de passe', $resetUrl)
            ->line('Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet email.')
            ->salutation('— L’équipe Jobsy');
    }
}
