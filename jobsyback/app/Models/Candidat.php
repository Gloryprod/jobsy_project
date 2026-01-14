<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidat extends Model
{
    protected $fillable = [
        'user_id',
        'date_naissance',
        'sexe',
        'nationalite',
        'ville',
        'bio',
        'adresse',
        'score',
        'domaine_competence',
        'niveau_experience',
        'niveau_etude',
        'disponibilite',
        'rank_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

     public function contact()
    {
        return $this->hasOne(Contact::class);
    }

    public function diplomes()
    {
        return $this->hasMany(Diplome::class);
    }

    public function formations()
    {
        return $this->hasMany(Formation::class);
    }

    public function cv()
    {
        return $this->hasOne(Cv::class);
    }

    public function concours()
    {
        return $this->hasMany(Concours::class);
    }

    public function communautes()
    {
        return $this->hasMany(Communaute::class);
    }

    public function rank()
    {
        return $this->belongsTo(Rank::class, 'rank_id');
    }
}
