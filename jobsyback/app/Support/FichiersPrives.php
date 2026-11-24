<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * Fichiers personnels des candidats (CV, diplômes, certificats, livrables d'examen) : rangés sur le disque privé
 * et servis par des liens signés qui expirent. Les règles d'accès restent celles des réponses de l'API qui donnent ces liens.
 */
final class FichiersPrives
{
    public const DISQUE = 'local';

    public const DUREE_MINUTES = 30;

    /** Dossiers concernés, déplacés du disque public par la migration move_personal_files_to_private_disk */
    public const DOSSIERS = ['cvs', 'diplomes', 'certificats', 'exam_deliverables'];

    /** Lien signé vers un fichier du disque privé, valable DUREE_MINUTES ; null sans fichier. */
    public static function lien(?string $chemin): ?string
    {
        return $chemin ? Storage::disk(self::DISQUE)->temporaryUrl($chemin, now()->addMinutes(self::DUREE_MINUTES)) : null;
    }
}
