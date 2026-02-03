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
        'entreprise_id'
    ];

    protected $casts = [
        'skills' => 'array',
        'deadline' => 'date',
    ];

}
