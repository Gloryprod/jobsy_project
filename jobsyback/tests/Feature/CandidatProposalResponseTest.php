<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\MissionProposal;
use App\Notifications\ProposalAcceptedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

/**
 * Réponse aux propositions de mission depuis l'application : mêmes règles que les liens de l'e-mail,
 * une seule réponse possible, et pas d'acceptation sur une mission fermée.
 */
class CandidatProposalResponseTest extends TestCase
{
    use RefreshDatabase;

    private Entreprise $entreprise;
    private Mission $mission;
    private Candidat $candidat;
    private MissionProposal $proposition;

    protected function setUp(): void
    {
        parent::setUp();

        Notification::fake();
        $this->entreprise = Entreprise::factory()->create();
        $this->mission = Mission::factory()->create(['entreprise_id' => $this->entreprise->id]);
        $this->candidat = Candidat::factory()->create();
        $this->proposition = MissionProposal::create([
            'mission_id' => $this->mission->id,
            'candidat_id' => $this->candidat->id,
            'entreprise_id' => $this->entreprise->id,
            'subject' => 'Une mission pour toi',
            'message' => 'Ton profil correspond.',
            'status' => 'pending',
            'sent_at' => now(),
        ]);
    }

    private function repondre(string $action, ?Candidat $candidat = null)
    {
        return $this->withHeaders($this->bearerFor(($candidat ?? $this->candidat)->user))
            ->postJson("/api/candidat/proposals/{$this->proposition->id}/{$action}");
    }

    public function test_accepter_une_invitation_depuis_l_application(): void
    {
        $this->repondre('accept')->assertOk()->assertJsonPath('data.status', 'accepted');

        $this->proposition->refresh();
        $this->assertSame('accepted', $this->proposition->status);
        $this->assertNotNull($this->proposition->responded_at);

        $candidature = Application::where('mission_id', $this->mission->id)->where('candidat_id', $this->candidat->id)->firstOrFail();
        $this->assertSame('accepted', $candidature->status);
        $this->assertSame('invited', $candidature->source);

        Notification::assertSentTo($this->entreprise->user, ProposalAcceptedNotification::class);
    }

    public function test_decliner_une_invitation_depuis_l_application(): void
    {
        $this->repondre('decline')->assertOk()->assertJsonPath('data.status', 'declined');

        $this->assertSame('declined', $this->proposition->fresh()->status);
        $this->assertSame(0, Application::count());
        Notification::assertNothingSent();
    }

    public function test_un_autre_candidat_ne_peut_pas_repondre(): void
    {
        $autre = Candidat::factory()->create();

        $this->repondre('accept', $autre)->assertForbidden();
        $this->repondre('decline', $autre)->assertForbidden();

        $this->assertSame('pending', $this->proposition->fresh()->status);
    }

    public function test_une_invitation_ne_recoit_qu_une_seule_reponse(): void
    {
        $this->repondre('accept')->assertOk();

        $this->repondre('accept')->assertStatus(409)->assertJsonPath('message', 'Cette invitation a déjà reçu une réponse.');
        $this->repondre('decline')->assertStatus(409);

        $this->assertSame('accepted', $this->proposition->fresh()->status);
        $this->assertSame(1, Application::count());
    }

    public function test_une_mission_fermee_refuse_l_acceptation_mais_pas_le_refus(): void
    {
        $this->mission->update(['closed_at' => now()]);

        $this->repondre('accept')->assertStatus(410);
        $this->assertSame('pending', $this->proposition->fresh()->status);
        $this->assertSame(0, Application::count());

        $this->repondre('decline')->assertOk();
        $this->assertSame('declined', $this->proposition->fresh()->status);
    }

    public function test_la_liste_indique_si_la_mission_est_fermee(): void
    {
        $this->withHeaders($this->bearerFor($this->candidat->user))->getJson('/api/candidat/proposals')
            ->assertOk()
            ->assertJsonPath('data.0.mission.active', true)
            ->assertJsonPath('data.0.mission.closed_at', null);

        $this->mission->update(['closed_at' => now()]);

        $reponse = $this->withHeaders($this->bearerFor($this->candidat->user))->getJson('/api/candidat/proposals')->assertOk();
        $this->assertNotNull($reponse->json('data.0.mission.closed_at'));
    }

    public function test_le_lien_de_l_email_applique_la_meme_regle_de_mission_fermee(): void
    {
        $this->mission->update(['active' => false]);

        $this->post(URL::signedRoute('proposals.accept.store', ['proposal' => $this->proposition->id]))
            ->assertStatus(410)
            ->assertSee("Cette mission est fermée", false);

        $this->assertSame('pending', $this->proposition->fresh()->status);
    }

    public function test_le_refus_par_l_email_ne_pretend_plus_prevenir_l_entreprise(): void
    {
        $this->post(URL::signedRoute('proposals.decline.store', ['proposal' => $this->proposition->id]))
            ->assertOk()
            ->assertDontSee('en a été informée', false)
            ->assertSee('suivi de ses propositions', false);
    }
}
