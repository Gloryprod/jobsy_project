<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $fillable = [
        'candidat_id',
        'mission_id',
        'status',
        'global_score',
        'badge',
        'ai_summary',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function assessment() {
        return $this->hasOne(ApplicationAssessments::class);
    }

    public function candidat() { 
        return $this->belongsTo(Candidat::class, 'candidat_id'); 
    }

    public function mission() { 
        return $this->belongsTo(Mission::class, 'mission_id');
    }

    public function mission_offers()
    {
        return $this->hasOne(MissionOffers::class, 'application_id');
    }
}
