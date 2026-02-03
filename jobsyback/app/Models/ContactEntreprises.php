<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactEntreprises extends Model
{
    protected $fillable = [
        'telephone',
        'nom_promoteur',
        'email',
        'linkedin',
        'facebook',
        'instagram',
        'twitter',
        'entreprise_id',
    ];

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

}
