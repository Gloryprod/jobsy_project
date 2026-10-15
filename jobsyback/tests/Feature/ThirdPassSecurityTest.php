<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, Course, Cv, Enrollment, Entreprise, ExamProjects, Mission, Transaction, User, UserExamSession, Wallet};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Troisième passe : liens piégés dans les livrables, fichiers de leçons, brouillons exposés, débit,
 * offres écrasées, séquestre libéré, mission supprimée en cours, remplacement du CV.
 */
class ThirdPassSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const PIEGE = 'javascript:fetch("/api/candidats/updateWithdrawalStatus/1",{method:"POST"})';

    public function test_un_lien_javascript_ne_peut_pas_etre_glisse_dans_un_livrable(): void
    {
        Mail::fake();
        $candidat = Candidat::factory()->create();
        $course = Course::create(['title' => 'Web', 'validation_mode' => 'C']);
        Enrollment::create(['candidat_id' => $candidat->id, 'course_id' => $course->id, 'progress_percentage' => 100, 'status' => 'evaluation_ready']);
        $project = ExamProjects::create([
            'course_id' => $course->id, 'title' => 'Projet', 'domain' => 'Web', 'context_rich_text' => '<p>x</p>',
            'inputs_schema' => [
                ['key' => 'archive', 'type' => 'file', 'label' => 'Archive', 'required' => true],
                ['key' => 'notes', 'type' => 'textarea', 'label' => 'Notes', 'required' => false],
            ],
            'evaluation_criteria' => [['name' => 'Qualité', 'max_points' => 20]],
            'passing_score' => 12,
        ]);
        $headers = $this->bearerFor($candidat->user);

        $this->withHeaders($headers)->postJson("/api/exam-sessions/start/{$project->id}")->assertCreated();
        $session = UserExamSession::firstOrFail();

        // Soumission normale : le champ fichier doit être une URL http(s)
        $this->withHeaders($headers)
            ->postJson("/api/exam-submissions/{$project->id}", ['answers' => ['archive' => self::PIEGE]])
            ->assertStatus(422);

        // Brouillon et auto-soumission (sans validation stricte) : le lien piégé et les champs inconnus sont écartés
        $this->withHeaders($headers)
            ->patchJson("/api/exam-sessions/{$session->id}/draft", ['answers' => ['archive' => self::PIEGE, 'notes' => 'Mes notes', 'intrus' => 'x']])
            ->assertOk();
        $this->withHeaders($headers)
            ->postJson("/api/exam-submissions/{$project->id}/auto-submit", ['answers' => ['archive' => self::PIEGE]])
            ->assertOk();

        $this->assertSame(['notes' => 'Mes notes'], $session->fresh()->submitted_data);
    }

    public function test_un_fichier_html_ne_peut_pas_etre_televerse_comme_lecon(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create(['role' => 'ADMIN']);
        $course = Course::create(['title' => 'Web', 'validation_mode' => 'A']);

        $payload = fn ($file) => [
            'course_id' => $course->id, 'title' => 'Module', 'description' => '<p>Desc</p>', 'order' => 1,
            'lessons' => [['title' => 'Support', 'type' => 'pdf', 'content' => $file, 'duration_minutes' => 5, 'order' => 1]],
        ];

        $this->withHeaders($this->bearerFor($admin))
            ->post('/api/storeModule', $payload(UploadedFile::fake()->create('page.html', 1, 'text/html')), ['Accept' => 'application/json'])
            ->assertStatus(422);
        $this->assertEmpty(Storage::disk('public')->allFiles());

        $this->withHeaders($this->bearerFor($admin))
            ->post('/api/storeModule', $payload(UploadedFile::fake()->create('support.pdf', 10, 'application/pdf')), ['Accept' => 'application/json'])
            ->assertCreated();
    }

    public function test_les_candidatures_en_brouillon_ne_sont_pas_visibles_par_l_entreprise(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => Candidat::factory()->create()->id, 'status' => 'draft']);
        $submitted = Application::create(['mission_id' => $mission->id, 'candidat_id' => Candidat::factory()->create()->id, 'status' => 'pending']);
        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)->getJson("/api/missions/{$mission->id}/applications")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $submitted->id);

        $this->withHeaders($headers)->getJson('/api/index')
            ->assertOk()
            ->assertJsonCount(1, 'data.candidatures_a_chaud');
    }

    public function test_les_appels_ia_sont_limites_en_debit(): void
    {
        $candidat = Candidat::factory()->create();
        $headers = $this->bearerFor($candidat->user);

        // Missions fermées : la requête s'arrête avant l'IA, seule la limite est mesurée
        for ($i = 0; $i < 10; $i++) {
            $this->withHeaders($headers)->postJson("/api/start_application/{$candidat->id}/999999")->assertStatus(404);
        }

        $this->withHeaders($headers)->postJson("/api/start_application/{$candidat->id}/999999")->assertStatus(429);
    }

    public function test_une_offre_acceptee_ou_financee_ne_peut_pas_etre_ecrasee(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $offer = $this->makeOffer($mission, null, ['accepted_at' => now(), 'status' => 'in_progress']);
        $payload = [
            'start_date' => now()->addDays(3)->toDateString(), 'start_time' => '09:00', 'place' => 'Cotonou',
            'contact_person' => 'RH', 'expires_at' => now()->addDays(2)->toDateString(),
        ];
        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)
            ->postJson("/api/entreprise/applications/{$offer->application_id}/select", $payload)
            ->assertStatus(409);
        $this->assertNotSoftDeleted($offer);

        $draft = Application::create(['mission_id' => $mission->id, 'candidat_id' => Candidat::factory()->create()->id, 'status' => 'draft']);
        $this->withHeaders($headers)
            ->postJson("/api/entreprise/applications/{$draft->id}/select", $payload)
            ->assertStatus(422);
    }

    public function test_refuser_apres_onboarding_libere_le_sequestre(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'reward' => 15000]);
        $offer = $this->makeOffer($mission, null, ['accepted_at' => now(), 'status' => 'service_started']);
        $wallet = $this->walletFor($entreprise, balance: 20000);
        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)->postJson('/api/entreprise/payments/lock_funds', ['offerId' => $offer->id])->assertOk();
        $this->assertEquals(15000, $wallet->fresh()->balance_locked);

        $this->withHeaders($headers)
            ->postJson("/api/mission-offers/{$offer->id}/update-status", ['status' => 'rejected_after_onboarding'])
            ->assertOk();

        $this->assertEquals(0, $wallet->fresh()->balance_locked);
        $this->assertEquals(20000, $wallet->fresh()->balance);
        $this->assertSame('cancelled', Transaction::where('reference', 'like', 'ESC-%')->value('status'));
        $this->assertSame('released', $offer->fresh()->payment_status);
    }

    public function test_une_mission_en_cours_ne_peut_pas_etre_supprimee(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $this->makeOffer($mission, null, ['accepted_at' => now(), 'status' => 'work_finished']);
        $headers = $this->bearerFor($entreprise->user);

        $this->withHeaders($headers)->deleteJson("/api/missions/{$mission->id}")->assertStatus(409);
        $this->withHeaders($headers)->postJson('/api/missions/bulk-delete', ['ids' => [$mission->id]])->assertOk();

        $this->assertNotSoftDeleted($mission);
    }

    public function test_un_nouveau_cv_remplace_l_ancien(): void
    {
        Storage::fake('public');
        $candidat = Candidat::factory()->create();
        $headers = $this->bearerFor($candidat->user);

        $this->withHeaders($headers)->post('/api/candidat/cv', ['fichier' => UploadedFile::fake()->create('cv1.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])->assertCreated();
        $first = Cv::firstOrFail()->fichier;

        $this->withHeaders($headers)->post('/api/candidat/cv', ['fichier' => UploadedFile::fake()->create('cv2.pdf', 10, 'application/pdf')], ['Accept' => 'application/json'])->assertCreated();

        $this->assertSame(1, Cv::count());
        Storage::disk('public')->assertMissing($first);
        Storage::disk('public')->assertExists(Cv::firstOrFail()->fichier);
    }

    public function test_l_historique_d_une_entreprise_sans_wallet_est_vide(): void
    {
        $entreprise = Entreprise::factory()->create();

        $this->withHeaders($this->bearerFor($entreprise->user))
            ->getJson('/api/transactions-history')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }
}
