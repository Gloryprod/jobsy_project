<?php

namespace Tests\Feature;

use App\Models\Candidat;
use App\Models\Entreprise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Une seule règle de mot de passe (App\Support\PasswordPolicy) pour l'inscription, la réinitialisation
 * et le changement depuis le profil.
 */
class PasswordPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_l_inscription_accepte_n_importe_quel_caractere_special(): void
    {
        Notification::fake();

        // « # » était refusé par l'ancienne liste blanche du front alors que l'API l'acceptait
        $this->postJson('/api/register', [
            'prenom' => 'Awa', 'nom' => 'Test', 'email' => 'awa@example.com',
            'password' => 'Jobsy#2026', 'password_confirmation' => 'Jobsy#2026', 'role' => 'JEUNE',
        ])->assertCreated();

        $this->postJson('/api/register', [
            'email' => 'faible@example.com', 'password' => 'jobsy2026', 'role' => 'JEUNE',
        ])->assertStatus(422)
            ->assertJsonPath('errors.password.0', 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.');
    }

    public function test_le_profil_ne_permet_pas_de_repasser_a_un_mot_de_passe_faible(): void
    {
        $comptes = [
            '/api/candidat/update/password' => Candidat::factory()->create()->user,
            '/api/entreprise/update/password' => Entreprise::factory()->create()->user,
        ];

        foreach ($comptes as $route => $user) {
            $headers = $this->bearerFor($user);

            $this->withHeaders($headers)->postJson($route, [
                'currentPassword' => 'password', 'newPassword' => 'aaaaaaaa', 'newPassword_confirmation' => 'aaaaaaaa',
            ])->assertStatus(422)->assertJsonValidationErrors('newPassword');

            $this->withHeaders($headers)->postJson($route, [
                'currentPassword' => 'password', 'newPassword' => 'Jobsy#2026', 'newPassword_confirmation' => 'Jobsy#2026',
            ])->assertOk();

            $this->assertTrue(Hash::check('Jobsy#2026', $user->fresh()->password), $route);
        }
    }

    public function test_la_reinitialisation_exige_aussi_une_minuscule(): void
    {
        $this->postJson('/api/reset-password', [
            'token' => 'x', 'email' => 'awa@example.com',
            'password' => 'JOBSY#2026', 'password_confirmation' => 'JOBSY#2026',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
