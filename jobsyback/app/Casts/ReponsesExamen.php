<?php

namespace App\Casts;

use App\Support\FichiersPrives;
use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/**
 * Réponses d'un projet d'examen (JSON). Un livrable déposé est enregistré sans signature et relu avec un lien signé neuf :
 * un brouillon ne garde jamais un lien périmé, et le correcteur reçoit un lien valable au moment où il ouvre la copie.
 */
class ReponsesExamen implements CastsAttributes
{
    // Nom donné par Laravel au dépôt (40 caractères et extension) : ni sous-dossier ni « .. », rien hors des livrables
    private const LIVRABLE = '#/storage/(exam_deliverables/[A-Za-z0-9]+\.[A-Za-z0-9]+)(?:\?|$)#';

    public function get(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        $reponses = $value === null ? null : json_decode($value, true);
        if (!is_array($reponses)) {
            return $reponses;
        }

        return array_map(
            fn ($valeur) => is_string($valeur) && preg_match(self::LIVRABLE, $valeur, $m) ? FichiersPrives::lien($m[1]) : $valeur,
            $reponses
        );
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): mixed
    {
        if ($value === null) {
            return null;
        }

        $propres = is_array($value)
            ? array_map(fn ($valeur) => is_string($valeur) && preg_match(self::LIVRABLE, $valeur) ? strtok($valeur, '?') : $valeur, $value)
            : $value;

        return json_encode($propres);
    }
}
