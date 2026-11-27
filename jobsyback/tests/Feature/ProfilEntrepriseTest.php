<?php

namespace Tests\Feature;

use App\Models\Entreprise;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Profil de l'entreprise (lot 7e) : le nom ne peut pas être vidé, et les coordonnées trop longues
 * sont refusées par la validation au lieu de faire échouer l'écriture en base.
 */
class ProfilEntrepriseTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_nom_de_l_entreprise_ne_peut_pas_etre_vide(): void
    {
        $entreprise = Entreprise::factory()->create(['nom_entreprise' => 'Boutique Guilde']);

        $this->withHeaders($this->bearerFor($entreprise->user))
            ->postJson("/api/entreprise/infos/{$entreprise->id}", ['nom_entreprise' => '', 'localisation' => 'Cotonou'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nom_entreprise');

        $this->assertSame('Boutique Guilde', $entreprise->fresh()->nom_entreprise);
    }

    public function test_le_logo_seul_peut_toujours_etre_envoye(): void
    {
        Storage::fake('public');
        $entreprise = Entreprise::factory()->create(['nom_entreprise' => 'Boutique Guilde']);

        $this->withHeaders($this->bearerFor($entreprise->user))
            ->post("/api/entreprise/infos/{$entreprise->id}", ['logo' => UploadedFile::fake()->image('logo.png', 200, 200)], ['Accept' => 'application/json'])
            ->assertOk();

        $entreprise->refresh();
        $this->assertSame('Boutique Guilde', $entreprise->nom_entreprise);
        Storage::disk('public')->assertExists($entreprise->logo);
    }

    public function test_les_coordonnees_trop_longues_sont_refusees_par_la_validation(): void
    {
        $entreprise = Entreprise::factory()->create();

        $this->withHeaders($this->bearerFor($entreprise->user))
            ->postJson("/api/entreprise/contact/{$entreprise->id}", [
                'nom_promoteur' => str_repeat('a', 256),
                'telephone' => '+229 01 97 00 00 00',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('nom_promoteur');

        $this->assertNull($entreprise->contact_entreprise()->first());
    }
}
