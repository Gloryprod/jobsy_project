<?php

namespace Tests\Feature;

use App\Models\{Course, Module};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Catalogue public des formations (lot 8e) : sans compte, seulement les formations actives,
 * et seulement ce qu'une page publique doit montrer.
 */
class PublicCoursesTest extends TestCase
{
    use RefreshDatabase;

    public function test_le_catalogue_public_liste_les_formations_actives_sans_le_contenu(): void
    {
        $active = Course::create(['title' => 'Accueil client', 'description' => '<p>Bien recevoir.</p>', 'validation_mode' => 'A', 'type_contenu' => 'Digital',
            'delivered_skills' => ['accueil', 'caisse'], 'reward_xp' => 150, 'reward_asset' => 'secret.png', 'is_active' => true]);
        Module::create(['course_id' => $active->id, 'title' => 'Module 1', 'description' => 'Contenu réservé', 'order' => 1]);
        Module::create(['course_id' => $active->id, 'title' => 'Module 2', 'description' => 'Contenu réservé', 'order' => 2]);
        Course::create(['title' => 'Formation retirée', 'validation_mode' => 'B', 'is_active' => false]);

        $reponse = $this->getJson('/api/public_courses')->assertOk();

        $this->assertSame(['Accueil client'], collect($reponse->json('data'))->pluck('title')->all());
        $this->assertSame(
            ['id' => $active->id, 'title' => 'Accueil client', 'description' => '<p>Bien recevoir.</p>', 'validation_mode' => 'A',
                'delivered_skills' => ['accueil', 'caisse'], 'reward_xp' => 150, 'modules_count' => 2],
            $reponse->json('data.0'),
        );
        $this->assertStringNotContainsString('Contenu réservé', $reponse->getContent());
        $this->assertStringNotContainsString('secret.png', $reponse->getContent());
    }
}
