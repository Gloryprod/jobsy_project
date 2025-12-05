<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Candidat extends Model
{
    protected $fillable = [
        'user_id',
        'bio',
        'adresse',
        'score',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
