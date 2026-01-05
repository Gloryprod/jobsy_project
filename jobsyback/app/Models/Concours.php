<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Concours extends Model
{
    protected $fillable = [
        'nom',
        'organisateur',
        'annee',
        'resultat',
    ];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
