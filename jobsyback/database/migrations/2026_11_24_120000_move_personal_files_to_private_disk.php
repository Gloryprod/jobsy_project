<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Storage;

/**
 * CV, diplômes, certificats et livrables d'examen passent du disque public au disque privé :
 * ils ne se consultent plus que par les liens signés que donne l'API (App\Support\FichiersPrives).
 * Les chemins enregistrés en base ne changent pas. Les disques et dossiers sont écrits en dur :
 * la migration doit garder le même sens même si la configuration évolue.
 */
return new class extends Migration
{
    private const DOSSIERS = ['cvs', 'diplomes', 'certificats', 'exam_deliverables'];

    public function up(): void
    {
        $this->deplacer('public', 'local');
    }

    public function down(): void
    {
        $this->deplacer('local', 'public');
    }

    /** Déplace les fichiers d'un disque à l'autre. Rejouable : un fichier déjà déplacé n'est ni recopié ni perdu. */
    private function deplacer(string $source, string $cible): void
    {
        $depart = Storage::disk($source);
        $arrivee = Storage::disk($cible);

        foreach (self::DOSSIERS as $dossier) {
            foreach ($depart->files($dossier) as $chemin) {
                if (!$arrivee->exists($chemin) && !$arrivee->put($chemin, $depart->get($chemin))) {
                    throw new RuntimeException("Le fichier {$chemin} n'a pas pu être copié sur le disque {$cible}.");
                }

                $depart->delete($chemin);
            }
        }
    }
};
