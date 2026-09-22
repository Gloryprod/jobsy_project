<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory; 

class Candidat extends Model
{
    use HasFactory;

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

    public function cv_datas()
    {
        return $this->hasOne(CvDatas::class);
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

    public function skills()
    {
        return $this->belongsToMany(Skills::class, 'candidat_skill', 'candidat_id', 'skill_id');
    }

    public function categories()
    {
        return $this->skills->map(function($skill) {
            return $skill->category;
        })->unique('id');
    }

    public function applications() {
        return $this->hasMany(Application::class);
    }

    public function enrollments() {
        return $this->hasMany(Enrollment::class);
    }

    public function wallet() {
        return $this->hasOne(Wallet::class, 'candidat_id');
    }

    public function badges()
    {
        return $this->belongsToMany(Badge::class, 'candidat_badges')
                    ->withPivot(['unlocked', 'unlocked_at', 'progress_current', 'progress_max', 'equipped', 'equipped_at'])
                    ->withTimestamps();
    }

    public function equippedBadges()
    {
        return $this->badges()->wherePivot('equipped', true);
    }
}
