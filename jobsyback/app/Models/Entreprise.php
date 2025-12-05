<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entreprise extends Model
{
    protected $fillable = [
        'user_id',
        'nom_entreprise',
        'secteur_activite',
        'localisation',
        'description',
        'site_web',
    ];

    // Relation inverse vers User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
