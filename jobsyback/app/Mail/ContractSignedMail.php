<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Contrat de mission envoyé au candidat et à l'entreprise.
 * En file d'attente : le PDF est relu depuis le disque (on ne sérialise pas de binaire dans le job).
 */
class ContractSignedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $application;
    public string $contractPath;

    /**
     * Create a new message instance.
     *
     * @param string $contractPath chemin du PDF sur le disque « public » (ex. contrats/contrat_12.pdf)
     */
    public function __construct($application, string $contractPath)
    {
        $this->application = $application;
        $this->contractPath = $contractPath;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Votre contrat Jobsy est prêt !',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.contrat',
            with: [
                'poste' => $this->application->mission->title,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromStorageDisk('public', $this->contractPath)
                ->as('Contrat_Jobsy.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
