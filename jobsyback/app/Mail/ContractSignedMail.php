<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Attachment;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContractSignedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public $application;
    public $pdfContent;
    public function __construct($application, $pdfContent)
    {
        $this->application = $application;
        $this->pdfContent = $pdfContent;
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
                // 'entreprise' => $this->application->entreprise->nom_entreprise,
                // 'salaire' => $this->application->job->salaire,
                // 'date_debut' => $this->application->job->date_debut,
                // Ajoute ici toutes les infos de la mission dont tu as besoin
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
            Attachment::fromData(fn () => $this->pdfContent, 'Contrat_Jobsy.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
