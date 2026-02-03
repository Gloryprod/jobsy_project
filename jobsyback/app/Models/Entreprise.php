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
        'date_creation',
        'nom_officiel',
        'taille',
        'logo',
    ];

    // Relation inverse vers User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function contact_entreprise()
    {
        return $this->hasOne(ContactEntreprises::class);
    }
}
