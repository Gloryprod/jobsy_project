<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Candidat;
use App\Models\Course;

class ExamCertifiedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Candidat $candidat;
    public Course $course;
    public string $certificateHash;
    public int $globalScore;

    public function __construct(Candidat $candidat, Course $course, string $certificateHash, int|float $globalScore)
    {
        $this->candidat = $candidat;
        $this->course = $course;
        $this->certificateHash = $certificateHash;
        $this->globalScore = (int) round($globalScore);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Félicitations ! Vous êtes certifié(e) sur " . $this->course->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.exam.certified',
            with: [
                'candidatName' => $this->candidat->user->prenom ?? 'Candidat',
                'courseTitle'  => $this->course->title,
                'rewardXp'     => $this->course->reward_xp ?? 0,
                'certHash'     => $this->certificateHash,
                'score'        => $this->globalScore,
                // Page publique de vérification côté front (app/verify/[hash])
                'certUrl'      => rtrim(config('services.frontend_url'), '/') . "/verify/" . $this->certificateHash,
            ]
        );
    }
}
