<?php

namespace Tests\Feature;

use App\Models\{Candidat, Course, Enrollment, ExamProjects, UserExamSession};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * CV, diplômes, certificats et livrables d'examen : disque privé, consultés par des liens signés qui expirent.
 * Un vrai disque privé (dossier temporaire) est utilisé : un disque simulé ne signe pas les liens.
 */
class FichiersPrivesTest extends TestCase
{
    use RefreshDatabase;

    private const PDF = "%PDF-1.4\n% fichier de test\n";

    private string $racine;
    private Candidat $candidat;
    private array $headers;

    protected function setUp(): void
    {
        parent::setUp();

        $this->racine = storage_path('framework/testing/fichiers-prives');
        config(['filesystems.disks.local.root' => $this->racine]);
        Storage::forgetDisk('local');
        Storage::fake('public');
        Queue::fake();

        $this->candidat = Candidat::factory()->create();
        $this->headers = $this->bearerFor($this->candidat->user);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->racine);
        parent::tearDown();
    }

    /** Chemin et paramètres d'un lien absolu, pour l'appeler dans le test. */
    private function relatif(string $lien): string
    {
        return parse_url($lien, PHP_URL_PATH) . '?' . parse_url($lien, PHP_URL_QUERY);
    }

    private function sessionDeProjet(): UserExamSession
    {
        $course = Course::create(['title' => 'Développement web', 'validation_mode' => 'C', 'type_contenu' => 'Digital']);
        $projet = ExamProjects::create([
            'course_id' => $course->id,
            'title' => 'Projet final',
            'domain' => 'Web',
            'context_rich_text' => '<p>Rendez votre rapport</p>',
            'inputs_schema' => [['key' => 'rapport', 'type' => 'file', 'label' => 'Rapport', 'required' => true]],
            'evaluation_criteria' => [['name' => 'Qualité', 'max_points' => 20]],
            'passing_score' => 12,
            'time_limit_minutes' => 60,
        ]);
        Enrollment::create(['candidat_id' => $this->candidat->id, 'course_id' => $course->id, 'progress_percentage' => 100, 'status' => 'evaluation_ready']);
        $this->withHeaders($this->headers)->postJson("/api/exam-sessions/start/{$projet->id}")->assertCreated();

        return UserExamSession::firstOrFail();
    }

    public function test_le_cv_va_sur_le_disque_prive_et_se_consulte_par_un_lien_signe_qui_expire(): void
    {
        $this->withHeaders($this->headers)
            ->post('/api/candidat/cv', ['fichier' => UploadedFile::fake()->createWithContent('cv.pdf', self::PDF)], ['Accept' => 'application/json'])
            ->assertCreated();

        $chemin = $this->candidat->cv()->firstOrFail()->fichier;
        Storage::disk('local')->assertExists($chemin);
        Storage::disk('public')->assertMissing($chemin);

        $lien = $this->withHeaders($this->headers)->getJson('/api/candidat/profile')->assertOk()->json('data.cv.fichier_url');
        $this->assertStringContainsString("/storage/{$chemin}?expires=", $lien);

        $this->get($this->relatif($lien))->assertOk();
        $this->get(parse_url($lien, PHP_URL_PATH))->assertForbidden();

        $this->travel(31)->minutes();
        $this->get($this->relatif($lien))->assertForbidden();
    }

    public function test_supprimer_le_cv_efface_le_fichier_du_disque_prive(): void
    {
        $this->withHeaders($this->headers)
            ->post('/api/candidat/cv', ['fichier' => UploadedFile::fake()->createWithContent('cv.pdf', self::PDF)], ['Accept' => 'application/json'])
            ->assertCreated();
        $chemin = $this->candidat->cv()->firstOrFail()->fichier;
        Storage::disk('local')->assertExists($chemin);

        $this->withHeaders($this->headers)->deleteJson('/api/candidat/cv')->assertOk();

        Storage::disk('local')->assertMissing($chemin);
    }

    public function test_un_livrable_est_enregistre_sans_signature_et_relu_avec_un_lien_neuf(): void
    {
        $session = $this->sessionDeProjet();

        $lien = $this->withHeaders($this->headers)
            ->post('/api/upload-temp-file', ['file' => UploadedFile::fake()->createWithContent('rapport.pdf', self::PDF)], ['Accept' => 'application/json'])
            ->assertOk()
            ->json('url');
        $this->assertStringContainsString('/storage/exam_deliverables/', $lien);
        $this->assertStringContainsString('signature=', $lien);
        Storage::disk('public')->assertDirectoryEmpty('/');

        $this->withHeaders($this->headers)->patchJson("/api/exam-sessions/{$session->id}/draft", ['answers' => ['rapport' => $lien]])->assertOk();

        $brut = DB::table('user_exam_sessions')->where('id', $session->id)->value('submitted_data');
        $this->assertStringContainsString('exam_deliverables', $brut);
        $this->assertStringNotContainsString('signature', $brut);

        $relu = $session->fresh()->submitted_data['rapport'];
        $this->assertStringContainsString('signature=', $relu);
        $this->get($this->relatif($relu))->assertOk();
    }

    public function test_une_reponse_qui_sort_du_dossier_des_livrables_n_est_pas_signee(): void
    {
        $session = $this->sessionDeProjet();
        $piege = 'http://localhost/storage/exam_deliverables/../cvs/autre.pdf';

        $session->update(['submitted_data' => ['rapport' => $piege]]);

        $this->assertSame($piege, $session->fresh()->submitted_data['rapport']);
    }

    public function test_la_migration_deplace_les_fichiers_personnels_et_laisse_les_autres(): void
    {
        Storage::disk('public')->put('cvs/ancien.pdf', self::PDF);
        Storage::disk('public')->put('exam_deliverables/rendu.pdf', self::PDF);
        Storage::disk('public')->put('logos/logo.png', 'logo');

        $migration = require database_path('migrations/2026_11_24_120000_move_personal_files_to_private_disk.php');
        $migration->up();

        Storage::disk('local')->assertExists(['cvs/ancien.pdf', 'exam_deliverables/rendu.pdf']);
        Storage::disk('public')->assertMissing(['cvs/ancien.pdf', 'exam_deliverables/rendu.pdf']);
        Storage::disk('public')->assertExists('logos/logo.png');

        // Rejouable : rien n'est perdu au second passage
        $migration->up();
        Storage::disk('local')->assertExists('cvs/ancien.pdf');
    }
}
