<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CvDatas extends Model
{
    protected $fillable = [
        'candidat_id', 
        'candidate_name', 
        'skills', 
        'education', 
        'raw_ai_data'
    ];

    /**
     * Conversion automatique du JSON en Array PHP
     */
    protected $casts = [
        'skills' => 'array',
        'education' => 'array',
        'raw_ai_data' => 'array',
    ];

    /**
     * Lien vers l'utilisateur
     */
    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class);
    }
}
