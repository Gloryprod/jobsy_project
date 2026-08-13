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

    public function __construct(Candidat $candidat, Course $course, string $certificateHash, int $globalScore)
    {
        $this->candidat = $candidat;
        $this->course = $course;
        $this->certificateHash = $certificateHash;
        $this->globalScore = $globalScore;
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
                'certUrl'      => config('app.url') . "/certificates/" . $this->certificateHash,
            ]
        );
    }
}

class ExamFailedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Candidat $candidat;
    public Course $course;
    public int $globalScore;

    public function __construct(Candidat $candidat, Course $course, int $globalScore)
    {
        $this->candidat = $candidat;
        $this->course = $course;
        $this->globalScore = $globalScore;
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
                'retryUrl'     => config('app.url') . "/dashboard/candidats/formations/" . $this->course->id . "/workspace",
            ]
        );
    }
}