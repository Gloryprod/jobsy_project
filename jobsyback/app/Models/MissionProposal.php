<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class MissionProposal extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'mission_id',
        'candidat_id',
        'entreprise_id',
        'subject',
        'message',
        'status',
        'sent_at',
        'responded_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function mission()
    {
        return $this->belongsTo(Mission::class);
    }

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    /**
     * Relation vers la candidature du candidat pour la MÊME mission avec source 'invited'
     */
    public function application()
    {
        return $this->hasOne(Application::class, 'candidat_id', 'candidat_id')
                    // ->where('mission_id', $this->mission_id)
                    ->where('source', 'invited');
    }
}
