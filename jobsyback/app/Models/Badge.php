<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Badge extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'category',
        'rarity',
        'bonus_value',
        'bonus_label',
        'icon_path',
        'criteria',
    ];

    protected $casts = [
        'criteria' => 'array',
    ];

    public function candidats()
    {
        return $this->belongsToMany(Candidat::class, 'candidat_badges')
                    ->withPivot(['unlocked', 'unlocked_at', 'progress_current', 'progress_max', 'equipped', 'equipped_at'])
                    ->withTimestamps();
    }
}
