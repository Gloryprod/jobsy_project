<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mission extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'company',
        'location',
        'reward',
        'duration',
        'deadline',
        'description',
        'skills',
        'urgency',
        'applicants',
        'category',
        'type_contrat',
        'active',
        'entreprise_id',
        'closed_at'
    ];

    protected $casts = [
        'skills' => 'array',
        'deadline' => 'date',
    ];

    public function applications() {
        return $this->hasMany(Application::class);
    }

    public function entreprise() {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }

}
