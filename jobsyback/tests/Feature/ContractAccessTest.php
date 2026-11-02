<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\MissionOffers;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Le contrat d'une mission (noms, rémunération) est sur le disque privé et ne se télécharge
 * qu'après connexion, par le candidat de l'offre ou l'entreprise de la mission.
 */
class ContractAccessTest extends TestCase
{
    use RefreshDatabase;

    private const CONTENU = "%PDF-1.4\n% contrat de test\n";

    private Entreprise $entreprise;
    private Candidat $candidat;
    private MissionOffers $offre;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        Storage::fake('public');

        $this->entreprise = Entreprise::factory()->create();
        $this->candidat = Candidat::factory()->create();
        $this->offre = $this->makeOffer(
            Mission::factory()->create(['entreprise_id' => $this->entreprise->id]),
            $this->candidat,
            ['status' => 'in_progress', 'started_at' => now()],
        );
        $chemin = "contrats/contrat_{$this->offre->application_id}.pdf";
        $this->offre->update(['contract_path' => $chemin]);
        Storage::disk('local')->put($chemin, self::CONTENU);
    }

    private function telecharger($user)
    {
        return $this->withHeaders($this->bearerFor($user))->get("/api/mission-offers/{$this->offre->id}/contract");
    }

    public function test_le_candidat_de_l_offre_telecharge_son_contrat(): void
    {
        $reponse = $this->telecharger($this->candidat->user)->assertOk();

        $this->assertSame(self::CONTENU, $reponse->streamedContent());
        $this->assertStringContainsString('application/pdf', $reponse->headers->get('Content-Type'));
        $this->assertStringContainsString('no-store', $reponse->headers->get('Cache-Control'));
        $this->assertStringContainsString("Contrat_Jobsy_{$this->offre->application_id}.pdf", $reponse->headers->get('Content-Disposition'));
    }

    public function test_l_entreprise_de_la_mission_telecharge_le_contrat(): void
    {
        $reponse = $this->telecharger($this->entreprise->user)->assertOk();

        $this->assertSame(self::CONTENU, $reponse->streamedContent());
    }

    public function test_un_autre_candidat_ou_une_autre_entreprise_est_refuse(): void
    {
        $this->telecharger(Candidat::factory()->create()->user)->assertForbidden();
        $this->telecharger(Entreprise::factory()->create()->user)->assertForbidden();
    }

    public function test_sans_connexion_le_contrat_est_refuse(): void
    {
        $this->getJson("/api/mission-offers/{$this->offre->id}/contract")->assertUnauthorized();
    }

    public function test_une_offre_sans_contrat_ou_un_fichier_absent_repond_404(): void
    {
        Storage::disk('local')->delete($this->offre->contract_path);
        $this->telecharger($this->candidat->user)->assertNotFound();

        $this->offre->update(['contract_path' => null]);
        $this->telecharger($this->candidat->user)->assertNotFound();

        $this->withHeaders($this->bearerFor($this->candidat->user))->getJson('/api/mission-offers/999999/contract')->assertNotFound();
    }

    public function test_un_contrat_reste_sur_le_disque_public_n_est_pas_servi_par_la_route(): void
    {
        // Avant la migration, un contrat oublié sur le disque public ne doit pas devenir la source du téléchargement
        Storage::disk('local')->delete($this->offre->contract_path);
        Storage::disk('public')->put($this->offre->contract_path, self::CONTENU);

        $this->telecharger($this->candidat->user)->assertNotFound();
    }

    public function test_la_migration_deplace_les_contrats_du_disque_public_vers_le_disque_prive(): void
    {
        Storage::disk('public')->put('contrats/contrat_501.pdf', 'contrat 501');
        Storage::disk('public')->put('contrats/contrat_502.pdf', 'contrat 502');
        // Déjà présent sur le disque privé : pas écrasé, et la copie publique disparaît quand même
        Storage::disk('local')->put('contrats/contrat_502.pdf', 'contrat 502 privé');
        Storage::disk('public')->put('logos/logo.png', 'logo');

        $migration = require database_path('migrations/2026_10_26_120000_move_contracts_to_private_disk.php');
        $migration->up();

        Storage::disk('public')->assertMissing('contrats/contrat_501.pdf');
        Storage::disk('public')->assertMissing('contrats/contrat_502.pdf');
        $this->assertSame('contrat 501', Storage::disk('local')->get('contrats/contrat_501.pdf'));
        $this->assertSame('contrat 502 privé', Storage::disk('local')->get('contrats/contrat_502.pdf'));
        Storage::disk('public')->assertExists('logos/logo.png');

        // Rejouable sans effet
        $migration->up();
        $this->assertSame('contrat 501', Storage::disk('local')->get('contrats/contrat_501.pdf'));

        $migration->down();
        $this->assertSame('contrat 501', Storage::disk('public')->get('contrats/contrat_501.pdf'));
        Storage::disk('local')->assertMissing('contrats/contrat_501.pdf');
    }
}
