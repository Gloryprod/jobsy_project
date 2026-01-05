<?php

namespace App\Models;

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

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
