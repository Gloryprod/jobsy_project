<?php

namespace Tests\Feature;

use App\Mail\BrevoTransport;
use App\Models\User;
use App\Notifications\CustomVerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as RequeteHttp;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * E-mail de confirmation de l'inscription : un envoi raté ne bloque plus le compte,
 * et l'envoi par l'API HTTP de Brevo remplace le SMTP bloqué par Render (offre gratuite).
 */
class RegistrationEmailTest extends TestCase
{
    use RefreshDatabase;

    private function inscription(string $email = 'nouveau@example.com')
    {
        return $this->postJson('/api/register', [
            'nom' => 'Hounkpè', 'prenom' => 'Ada', 'email' => $email,
            'password' => 'Jobsy#2026!', 'password_confirmation' => 'Jobsy#2026!', 'role' => 'JEUNE',
        ]);
    }

    /** SMTP injoignable, comme un port bloqué : la connexion échoue tout de suite. */
    private function smtpInjoignable(): void
    {
        config([
            'mail.default' => 'smtp',
            'mail.mailers.smtp.host' => '127.0.0.1',
            'mail.mailers.smtp.port' => 1,
            'mail.mailers.smtp.timeout' => 2,
        ]);
    }

    private function brevo(): void
    {
        config(['mail.default' => 'brevo', 'mail.mailers.brevo.key' => 'cle-de-test', 'mail.from.address' => 'contact@jobsy.test']);
    }

    public function test_l_inscription_envoie_l_e_mail_de_confirmation(): void
    {
        Notification::fake();

        $this->inscription()->assertCreated()->assertJsonPath('verification_email_sent', true);

        Notification::assertSentTo(User::where('email', 'nouveau@example.com')->firstOrFail(), CustomVerifyEmail::class);
    }

    public function test_un_envoi_rate_ne_fait_pas_echouer_l_inscription(): void
    {
        $this->smtpInjoignable();

        $this->inscription()
            ->assertCreated()
            ->assertJsonPath('verification_email_sent', false)
            ->assertJsonPath('data.email', 'nouveau@example.com');

        $user = User::where('email', 'nouveau@example.com')->firstOrFail();
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertNotNull($user->candidat);
    }

    public function test_le_renvoi_annonce_une_panne_d_envoi_sans_reveler_les_comptes(): void
    {
        $user = User::factory()->create(['email' => 'attente@example.com', 'role' => 'JEUNE', 'email_verified_at' => null]);
        $this->smtpInjoignable();

        $this->postJson('/api/auth/resend-verification', ['email' => $user->email])->assertStatus(503);

        // Adresse inconnue ou déjà confirmée : aucun envoi, même réponse qu'un envoi réussi
        $this->postJson('/api/auth/resend-verification', ['email' => 'inconnu@example.com'])->assertOk();
        $confirme = User::factory()->create(['email' => 'confirme@example.com', 'role' => 'JEUNE', 'email_verified_at' => now()]);
        $this->postJson('/api/auth/resend-verification', ['email' => $confirme->email])->assertOk();
    }

    public function test_brevo_envoie_l_e_mail_de_confirmation_par_l_api_https(): void
    {
        $this->brevo();
        Http::fake([BrevoTransport::URL => Http::response(['messageId' => '<abc@relay.brevo>'], 201)]);

        $this->inscription()->assertCreated()->assertJsonPath('verification_email_sent', true);

        Http::assertSent(fn (RequeteHttp $r) => $r->url() === BrevoTransport::URL
            && $r->hasHeader('api-key', 'cle-de-test')
            && $r['sender']['email'] === 'contact@jobsy.test'
            && $r['to'][0]['email'] === 'nouveau@example.com'
            && $r['subject'] === 'Confirmez votre email sur Jobsy !'
            && str_contains($r['htmlContent'], '/api/auth/verify-email/'));
    }

    public function test_brevo_transmet_les_pieces_jointes_et_le_texte_seul(): void
    {
        $this->brevo();
        Http::fake([BrevoTransport::URL => Http::response(['messageId' => '<def@relay.brevo>'], 201)]);

        Mail::html('<p>Votre contrat</p>', fn ($m) => $m->to('candidat@example.com')->subject('Contrat')->attachData('%PDF-1.4', 'contrat.pdf'));
        Mail::raw("Ligne 1\nLigne 2", fn ($m) => $m->to('candidat@example.com')->subject('Texte'));

        Http::assertSent(fn (RequeteHttp $r) => $r['subject'] === 'Contrat'
            && $r['attachment'][0]['name'] === 'contrat.pdf'
            && base64_decode($r['attachment'][0]['content']) === '%PDF-1.4');
        Http::assertSent(fn (RequeteHttp $r) => $r['subject'] === 'Texte' && str_contains($r['htmlContent'], 'Ligne 1<br />'));
    }

    public function test_un_refus_de_brevo_ne_bloque_pas_l_inscription(): void
    {
        $this->brevo();
        Http::fake([BrevoTransport::URL => Http::response(['code' => 'unauthorized', 'message' => 'Key not found'], 401)]);

        $this->inscription()->assertCreated()->assertJsonPath('verification_email_sent', false);
        $this->assertDatabaseHas('users', ['email' => 'nouveau@example.com']);
    }

    public function test_sans_cle_brevo_l_envoi_echoue_clairement(): void
    {
        config(['mail.default' => 'brevo', 'mail.mailers.brevo.key' => null]);
        Http::fake();

        $this->expectExceptionMessage("BREVO_API_KEY n'est pas renseignée");
        Mail::raw('Test', fn ($m) => $m->to('a@example.com')->subject('Test'));
    }

    public function test_l_inscription_et_le_renvoi_ont_chacun_leur_limite(): void
    {
        Notification::fake();

        // Inscription, puis nouvelle tentative avec la même adresse : avant, ces deux appels
        // consommaient le compteur commun et le renvoi suivant était refusé
        $this->inscription()->assertCreated();
        $this->inscription()->assertStatus(422);

        foreach (range(1, 3) as $essai) {
            $this->postJson('/api/auth/resend-verification', ['email' => 'nouveau@example.com'])->assertOk();
        }
        $this->postJson('/api/auth/resend-verification', ['email' => 'nouveau@example.com'])->assertStatus(429);

        // Une autre adresse n'est pas bloquée par la première
        $this->postJson('/api/auth/resend-verification', ['email' => 'autre@example.com'])->assertOk();
        $this->inscription('autre@example.com')->assertCreated();
    }
}
