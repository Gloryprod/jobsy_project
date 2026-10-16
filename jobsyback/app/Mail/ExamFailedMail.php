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

class ExamFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Candidat $candidat;
    public Course $course;
    public int $globalScore;

    public function __construct(Candidat $candidat, Course $course, int|float $globalScore)
    {
        $this->candidat = $candidat;
        $this->course = $course;
        $this->globalScore = (int) round($globalScore);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Résultat de votre évaluation : " . $this->course->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.exam.failed',
            with: [
                'candidatName' => $this->candidat->user->prenom ?? 'Candidat',
                'courseTitle'  => $this->course->title,
                'score'        => $this->globalScore,
                'retryUrl'     => rtrim(config('services.frontend_url'), '/') . "/dashboard/candidats/formations/" . $this->course->id . "/workspace",
            ]
        );
    }
}
