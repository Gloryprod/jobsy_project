<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, Entreprise, Mission, MissionProposal};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Les liens des emails de proposition ne doivent rien faire tant que le candidat n'a pas confirmé :
 * les filtres de messagerie (Safe Links, antivirus...) ouvrent les liens automatiquement.
 */
class ProposalResponseTest extends TestCase
{
    use RefreshDatabase;

    private MissionProposal $proposal;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $entreprise = Entreprise::factory()->create();
        $this->proposal = MissionProposal::create([
            'mission_id' => Mission::factory()->create(['entreprise_id' => $entreprise->id])->id,
            'candidat_id' => Candidat::factory()->create()->id,
            'entreprise_id' => $entreprise->id,
            'subject' => 'Proposition',
            'message' => 'Bonjour',
            'status' => 'pending',
            'sent_at' => now(),
        ]);
    }

    public function test_ouvrir_le_lien_n_accepte_pas_la_proposition(): void
    {
        $url = URL::signedRoute('proposals.accept', ['proposal' => $this->proposal->id]);

        $this->get($url)->assertOk()->assertSee('Oui, j&#039;accepte la proposition', false);
        $this->get(URL::signedRoute('proposals.decline', ['proposal' => $this->proposal->id]))->assertOk();

        $this->assertSame('pending', $this->proposal->fresh()->status);
        $this->assertSame(0, Application::count());
    }

    public function test_le_clic_de_confirmation_accepte_la_proposition(): void
    {
        $url = URL::signedRoute('proposals.accept', ['proposal' => $this->proposal->id]);

        $this->post($url)->assertOk();

        $this->assertSame('accepted', $this->proposal->fresh()->status);
        $this->assertSame('accepted', Application::firstOrFail()->status);
    }

    public function test_un_lien_falsifie_est_refuse(): void
    {
        $url = URL::signedRoute('proposals.accept', ['proposal' => $this->proposal->id]) . 'x';

        $this->post($url)->assertStatus(403);
        $this->assertSame('pending', $this->proposal->fresh()->status);
    }
}
