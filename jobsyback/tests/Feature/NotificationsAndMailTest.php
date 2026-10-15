<?php

namespace Tests\Feature;

use App\Mail\{ContractSignedMail, ExamCertifiedMail, ExamFailedMail};
use App\Models\{Candidat, Course, Entreprise, Mission, MissionProposal, Application};
use App\Notifications\{CandidateSelectedNotification, CompanyReminderNotification, ProposalAcceptedNotification};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * M11 / M17 et emails : notifications lisibles par tous les rôles, liens vers le front, envois en file d'attente.
 */
class NotificationsAndMailTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.frontend_url' => 'https://app.jobsy.bj']);
    }

    public function test_une_entreprise_lit_et_marque_ses_notifications(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'title' => 'Hôtesse salon']);
        $entreprise->user->notifyNow(new CompanyReminderNotification($mission, 2), ['database']);

        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)->getJson('/api/notifications/unread')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.data.mission_title', 'Hôtesse salon')
            ->assertJsonPath('data.0.data.type', 'offers_expired');

        $this->withHeaders($headers)->patchJson('/api/notifications/mark-as-read')->assertOk();
        $this->withHeaders($headers)->getJson('/api/notifications/unread')->assertJsonCount(0, 'data');
    }

    public function test_les_liens_des_emails_menent_au_front(): void
    {
        $mission = Mission::factory()->create();
        $offer = $this->makeOffer($mission);
        $user = $offer->application->candidat->user;

        $mail = (new CandidateSelectedNotification($offer))->toMail($user);
        $this->assertSame("https://app.jobsy.bj/dashboard/candidats/missions/offers/{$offer->id}", $mail->actionUrl);

        $reminder = (new CompanyReminderNotification($mission, 1))->toMail($mission->entreprise->user);
        $this->assertSame("https://app.jobsy.bj/dashboard/entreprises/missions/{$mission->id}/confirmedApplicants", $reminder->actionUrl);
    }

    public function test_la_proposition_acceptee_indique_le_nom_du_candidat(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $candidat = Candidat::factory()->create();
        $candidat->user->update(['prenom' => 'Ayaba', 'nom' => 'Hounsou']);
        $proposal = MissionProposal::create([
            'mission_id' => $mission->id, 'candidat_id' => $candidat->id, 'entreprise_id' => $entreprise->id,
            'subject' => 'Proposition', 'message' => 'Bonjour', 'status' => 'accepted', 'sent_at' => now(),
        ]);
        $application = Application::create(['mission_id' => $mission->id, 'candidat_id' => $candidat->id, 'status' => 'accepted']);

        $notification = new ProposalAcceptedNotification($proposal->load('candidat.user', 'mission'), $application);

        $this->assertStringContainsString('Ayaba Hounsou', $notification->toMail($entreprise->user)->subject);
        $this->assertSame('Ayaba Hounsou', $notification->toArray($entreprise->user)['candidat_name']);
    }

    public function test_les_emails_de_resultat_d_examen_se_generent(): void
    {
        $candidat = Candidat::factory()->create();
        $course = Course::create(['title' => 'Excel', 'validation_mode' => 'A', 'reward_xp' => 150]);

        $certified = (new ExamCertifiedMail($candidat, $course, 'abc123', 87.5))->render();
        $this->assertStringContainsString('https://app.jobsy.bj/verify/abc123', $certified);
        $this->assertStringContainsString('88 / 100', $certified);

        $failed = (new ExamFailedMail($candidat, $course, 42))->render();
        $this->assertStringContainsString("https://app.jobsy.bj/dashboard/candidats/formations/{$course->id}/workspace", $failed);
    }

    public function test_le_contrat_part_en_file_d_attente_avec_le_pdf_du_disque(): void
    {
        Storage::fake('public');
        Mail::fake();

        $entreprise = Entreprise::factory()->create();
        $offer = $this->makeOffer(Mission::factory()->create(['entreprise_id' => $entreprise->id]), null, ['status' => 'service_started']);

        $this->withHeaders($this->bearerFor($entreprise->user))
            ->postJson("/api/mission-offers/{$offer->id}/update-status", ['status' => 'in_progress', 'is_on_time' => true])
            ->assertOk();

        Storage::disk('public')->assertExists("contrats/contrat_{$offer->application_id}.pdf");
        Mail::assertQueued(ContractSignedMail::class, fn ($mail) => $mail->contractPath === "contrats/contrat_{$offer->application_id}.pdf");
        $this->assertTrue($offer->fresh()->is_on_time);
    }

    public function test_deux_candidats_peuvent_avoir_le_meme_diplome_mais_pas_en_double(): void
    {
        $first = Candidat::factory()->create();
        $second = Candidat::factory()->create();

        $this->withHeaders($this->bearerFor($first->user))
            ->postJson('/api/candidat/diplome', ['intitule' => 'Licence en informatique'])->assertCreated();
        $this->withHeaders($this->bearerFor($second->user))
            ->postJson('/api/candidat/diplome', ['intitule' => 'Licence en informatique'])->assertCreated();
        $this->withHeaders($this->bearerFor($second->user))
            ->postJson('/api/candidat/diplome', ['intitule' => 'Licence en informatique'])->assertStatus(422);
    }
}
