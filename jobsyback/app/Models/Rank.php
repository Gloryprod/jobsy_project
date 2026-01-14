<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rank extends Model
{
    protected $fillable = [
        'label',
        'rank',
        'points',
        'color',
        'code_hexa',
    ];

    public function candidats()
    {
        return $this->hasMany(Candidat::class);
    }
}
