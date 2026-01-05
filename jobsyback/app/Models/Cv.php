<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cv extends Model
{
     protected $fillable = [
        'fichier',
        'is_active',
    ];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
