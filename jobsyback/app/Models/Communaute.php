<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Communaute extends Model
{
    protected $fillable = [
        'nom',
        'role',
        'annee_entree',
    ];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
