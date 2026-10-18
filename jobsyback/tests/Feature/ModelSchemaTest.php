<?php

namespace Tests\Feature;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Chaque attribut déclaré dans $fillable doit exister comme colonne : sinon un create() ou un update()
 * qui le reçoit échoue en production (« Unknown column »), alors que rien ne le signale avant.
 */
class ModelSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_les_attributs_remplissables_existent_en_base(): void
    {
        $ecarts = [];

        foreach (glob(app_path('Models/*.php')) as $fichier) {
            $classe = 'App\\Models\\' . basename($fichier, '.php');
            if (! class_exists($classe) || ! is_subclass_of($classe, Model::class)) {
                continue;
            }

            $modele = new $classe;
            $colonnes = Schema::getColumnListing($modele->getTable());

            foreach ($modele->getFillable() as $attribut) {
                if (! in_array($attribut, $colonnes, true)) {
                    $ecarts[] = "{$classe}::\$fillable contient « {$attribut} », absent de la table {$modele->getTable()}";
                }
            }
        }

        $this->assertSame([], $ecarts, implode("\n", $ecarts));
    }
}
