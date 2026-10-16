<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, CvDatas, Entreprise, Mission};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * C8 — divulgation progressive : une entreprise ne voit les coordonnées et pièces d'un candidat
 * qu'après une candidature chez elle (ou une proposition acceptée).
 */
class CandidatePrivacyTest extends TestCase
{
    use RefreshDatabase;

    private Candidat $candidat;
    private Entreprise $entreprise;

    protected function setUp(): void
    {
        parent::setUp();

        $this->candidat = Candidat::factory()->create(['adresse' => 'Rue 12, Cotonou', 'date_naissance' => '2003-05-01']);
        $this->candidat->user->update(['telephone' => '2290197000000']);
        CvDatas::create([
            'candidat_id' => $this->candidat->id,
            'title' => 'Développeur',
            'experiences' => [['JobTitle' => 'Stagiaire']],
            'raw_ai_data' => ['Name' => 'Nom complet', 'Phone' => '2290197000000'],
        ]);
        $this->candidat->diplomes()->create(['intitule' => 'Licence', 'niveau' => 'Licence', 'fichier' => 'diplomes/scan.pdf']);

        $this->entreprise = Entreprise::factory()->create();
    }

    public function test_sans_relation_l_entreprise_ne_voit_ni_contacts_ni_pieces(): void
    {
        $headers = $this->bearerFor($this->entreprise->user);

        $profile = $this->withHeaders($headers)->getJson("/api/showProfileCandidat/{$this->candidat->id}")->assertOk();
        $profile->assertJsonPath('data.contact_visible', false)
            ->assertJsonPath('data.user.nom', $this->candidat->user->nom)
            ->assertJsonPath('data.cv_datas.title', 'Développeur')
            ->assertJsonMissingPath('data.user.email')
            ->assertJsonMissingPath('data.user.telephone')
            ->assertJsonMissingPath('data.adresse')
            ->assertJsonMissingPath('data.date_naissance')
            ->assertJsonMissingPath('data.cv_datas.raw_ai_data');

        $full = $this->withHeaders($headers)->getJson("/api/candidates/{$this->candidat->id}/full-profile")->assertOk();
        $full->assertJsonPath('candidate.diplomes.0.intitule', 'Licence')
            ->assertJsonMissingPath('candidate.diplomes.0.fichier');
    }

    public function test_apres_candidature_l_entreprise_voit_les_coordonnees(): void
    {
        $mission = Mission::factory()->create(['entreprise_id' => $this->entreprise->id]);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => $this->candidat->id, 'status' => 'pending']);
        $headers = $this->bearerFor($this->entreprise->user);

        $this->withHeaders($headers)->getJson("/api/showProfileCandidat/{$this->candidat->id}")
            ->assertOk()
            ->assertJsonPath('data.contact_visible', true)
            ->assertJsonPath('data.user.email', $this->candidat->user->email)
            ->assertJsonPath('data.user.telephone', '2290197000000')
            ->assertJsonMissingPath('data.cv_datas.raw_ai_data');

        $this->withHeaders($headers)->getJson("/api/candidates/{$this->candidat->id}/full-profile")
            ->assertOk()
            ->assertJsonPath('candidate.diplomes.0.fichier', 'diplomes/scan.pdf');
    }

    public function test_une_candidature_en_brouillon_ne_suffit_pas(): void
    {
        $mission = Mission::factory()->create(['entreprise_id' => $this->entreprise->id]);
        Application::create(['mission_id' => $mission->id, 'candidat_id' => $this->candidat->id, 'status' => 'draft']);

        $this->withHeaders($this->bearerFor($this->entreprise->user))
            ->getJson("/api/showProfileCandidat/{$this->candidat->id}")
            ->assertJsonPath('data.contact_visible', false)
            ->assertJsonMissingPath('data.user.email');
    }
}
