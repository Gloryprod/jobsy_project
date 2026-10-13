<?php

namespace App\Mail;

use App\Models\MissionProposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;

class MissionProposalMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public MissionProposal $proposal;
    public string $acceptUrl;
    public string $declineUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(MissionProposal $proposal)
    {
        $this->proposal = $proposal->load(['mission', 'candidat', 'entreprise']);

        // Génération de liens signés pour sécuriser l'action du candidat sans obligation de connexion immédiate
        $this->acceptUrl = URL::signedRoute('proposals.accept', [
            'proposal' => $this->proposal->id
        ]);

        $this->declineUrl = URL::signedRoute('proposals.decline', [
            'proposal' => $this->proposal->id
        ]);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->proposal->subject ?? 'Proposition de mission - Jobsy',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.mission_proposal',
            with: [
                'candidat'   => $this->proposal->candidat,
                'mission'    => $this->proposal->mission,
                'entreprise' => $this->proposal->entreprise,
                'messageBody'=> $this->proposal->message,
                'acceptUrl'  => $this->acceptUrl,
                'declineUrl' => $this->declineUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
