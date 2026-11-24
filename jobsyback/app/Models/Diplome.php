<?php

namespace App\Models;

use App\Support\FichiersPrives;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Diplome extends Model
{
    protected $fillable = [
        'intitule',
        'niveau',
        'etablissement',
        'pays',
        'annee_obtention',
        'fichier',
    ];

    // Le scan est sur le disque privé : les réponses de l'API donnent un lien signé, valable 30 minutes
    protected $appends = ['fichier_url'];

    protected function fichierUrl(): Attribute
    {
        return Attribute::get(fn () => FichiersPrives::lien($this->fichier));
    }

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
