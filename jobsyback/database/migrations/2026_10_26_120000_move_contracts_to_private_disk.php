<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

/**
 * Les contrats PDF passent du disque public au disque privé : ils ne se téléchargent plus qu'après connexion
 * (GET /api/mission-offers/{id}/contract). Le chemin enregistré en base ne change pas.
 * Les disques sont écrits en dur : la migration doit garder le même sens même si la configuration évolue.
 */
return new class extends Migration
{
    public function up(): void
    {
        $this->deplacer('public', 'local');
    }

    public function down(): void
    {
        $this->deplacer('local', 'public');
    }

    /** Déplace tous les contrats d'un disque à l'autre. Rejouable : un contrat déjà déplacé n'est ni recopié ni perdu. */
    private function deplacer(string $source, string $cible): void
    {
        $depart = Storage::disk($source);
        $arrivee = Storage::disk($cible);

        foreach ($depart->files('contrats') as $chemin) {
            if (!$arrivee->exists($chemin) && !$arrivee->put($chemin, $depart->get($chemin))) {
                throw new RuntimeException("Le contrat {$chemin} n'a pas pu être copié sur le disque {$cible}.");
            }

            $depart->delete($chemin);
        }
    }
};
