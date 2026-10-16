<?php

namespace Tests\Feature;

use App\Models\{Candidat, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * M1 — une installation neuve (migrations + seeders) permet l'inscription et l'analyse de compétences.
 */
class ReferenceDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_candidat_peut_s_inscrire_sur_une_base_neuve_avec_le_rang_e(): void
    {
        Notification::fake();

        $this->postJson('/api/register', [
            'email' => 'nouveau@jobsy.bj',
            'password' => 'Secret123!',
            'role' => 'JEUNE',
            'nom' => 'Hounsou',
            'prenom' => 'Ayaba',
        ])->assertCreated();

        $user = User::where('email', 'nouveau@jobsy.bj')->firstOrFail();
        $this->assertSame('E', $user->candidat->rank->rank);
    }

    public function test_une_competence_inconnue_est_rangee_dans_divers(): void
    {
        $candidat = Candidat::factory()->create();

        processSkillsFromIA($candidat, ['Tressage de paniers']);

        $this->assertSame('Divers', $candidat->skills()->first()->category->name);
    }
}
