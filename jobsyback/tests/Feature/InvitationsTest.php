<?php

namespace Tests\Feature;

use App\Mail\MissionProposalMail;
use App\Models\{Candidat, Entreprise, Mission, MissionProposal};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

/**
 * Invitations envoyées par une entreprise à un candidat suggéré (lot 7c-B).
 */
class InvitationsTest extends TestCase
{
    use RefreshDatabase;

    private function inviter(Entreprise $entreprise, Mission $mission, Candidat $candidat)
    {
        return $this->withHeaders($this->bearerFor($entreprise->user))->postJson('/api/offers/send-proposal-email', [
            'candidat_id' => $candidat->id,
            'mission_id' => $mission->id,
            'subject' => 'Invitation',
            'content' => "Bonjour,\n\nVotre profil a retenu l'attention de notre équipe.",
        ]);
    }

    public function test_une_mission_fermee_ne_recoit_pas_d_invitation(): void
    {
        Mail::fake();
        $entreprise = Entreprise::factory()->create();
        $candidat = Candidat::factory()->create();
        $cloturee = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'active' => false, 'closed_at' => now()]);
        $desactivee = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'active' => false]);
        $ouverte = Mission::factory()->create(['entreprise_id' => $entreprise->id]);

        $this->inviter($entreprise, $cloturee, $candidat)->assertStatus(422)->assertJsonPath('message', "Cette mission est clôturée : elle ne peut plus recevoir d'invitation.");
        $this->inviter($entreprise, $desactivee, $candidat)->assertStatus(422)->assertJsonPath('message', 'Cette mission est désactivée : réactivez-la pour inviter un candidat.');
        $this->assertSame(0, MissionProposal::count());

        $this->inviter($entreprise, $ouverte, $candidat)->assertOk();
        $this->assertSame(1, MissionProposal::count());
    }

    public function test_l_adresse_du_candidat_n_est_donnee_qu_apres_acceptation(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $statuts = ['pending', 'declined', 'accepted'];
        $candidats = [];
        foreach ($statuts as $statut) {
            $candidats[$statut] = Candidat::factory()->create();
            MissionProposal::create([
                'mission_id' => $mission->id, 'candidat_id' => $candidats[$statut]->id, 'entreprise_id' => $entreprise->id,
                'subject' => 'Invitation', 'message' => 'Bonjour', 'status' => $statut, 'sent_at' => now(),
            ]);
        }

        $liste = collect($this->withHeaders($this->bearerFor($entreprise->user))
            ->getJson("/api/missions/{$mission->id}/proposals")->assertOk()->json('data'))->keyBy('status');

        $this->assertNull($liste['pending']['candidat']['email']);
        $this->assertNull($liste['declined']['candidat']['email']);
        $this->assertSame($candidats['accepted']->user->email, $liste['accepted']['candidat']['email']);
    }

    public function test_l_e_mail_affiche_le_message_sans_double_echappement(): void
    {
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $candidat = Candidat::factory()->create();
        $proposal = MissionProposal::create([
            'mission_id' => $mission->id, 'candidat_id' => $candidat->id, 'entreprise_id' => $entreprise->id,
            'subject' => 'Invitation', 'message' => sanitizeHtml("Votre profil a retenu l'attention <script>alert(1)</script>"),
            'status' => 'pending', 'sent_at' => now(),
        ]);

        $html = (new MissionProposalMail($proposal))->render();

        $this->assertStringContainsString('retenu l&#039;attention', $html);
        $this->assertStringNotContainsString('&amp;#039;', $html);
        $this->assertStringNotContainsString('<script>alert(1)', $html);
    }

    public function test_les_suggestions_et_le_profil_nomment_le_candidat_comme_ailleurs_sans_titre_invente(): void
    {
        $entreprise = Entreprise::factory()->create();
        // Sans compétence exigée, le candidat est suggéré (score de 100)
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id, 'skills' => []]);
        $candidat = Candidat::factory()->create(['domaine_competence' => null]);
        $candidat->user->update(['prenom' => 'Ayaba', 'nom' => 'Hounsou']);
        $entete = $this->bearerFor($entreprise->user);

        $this->withHeaders($entete)
            ->getJson("/api/candidates/{$candidat->id}/full-profile")
            ->assertOk()
            ->assertJsonPath('candidate.full_name', 'Ayaba Hounsou')
            ->assertJsonPath('candidate.title', null);

        $suggestion = collect($this->withHeaders($entete)->getJson("/api/missions/{$mission->id}/suggested-candidates")->assertOk()->json('candidates'))
            ->firstWhere('id', $candidat->id);
        $this->assertSame('Ayaba Hounsou', $suggestion['full_name']);
        $this->assertNull($suggestion['title']);
    }
}
