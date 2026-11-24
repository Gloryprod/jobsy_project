<?php

namespace App\Models;

use App\Support\FichiersPrives;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class Formation extends Model
{
    protected $fillable = [
        'titre',
        'organisme',
        'date_debut',
        'date_fin',
        'en_cours',
        'certificat',
    ];

    // Le certificat est sur le disque privé : les réponses de l'API donnent un lien signé, valable 30 minutes
    protected $appends = ['certificat_url'];

    protected function certificatUrl(): Attribute
    {
        return Attribute::get(fn () => FichiersPrives::lien($this->certificat));
    }

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
