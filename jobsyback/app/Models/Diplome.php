<?php

namespace App\Models;

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

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
