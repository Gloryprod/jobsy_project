<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MissionOffers extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'application_id',
        'start_date',
        'start_time',
        'place',
        'onboarding_instructions',
        'contact_person',
        'expires_at',
        'accepted_at',
        'declined_at',
        'status',
        'contract_path',
        'notified_presence_at',
        'started_at',
        'finished_at',
        'validated_at',
        'paid_at',
        'transaction_id',
        'payment_status',
        'rating',            
        'is_on_time',        
        'recruiter_review',
        'candidate_reminded_at',
        'company_reminded_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'declined_at' => 'datetime',
            'validated_at' => 'datetime',
            'paid_at' => 'datetime',
            'candidate_reminded_at' => 'datetime',
            'company_reminded_at' => 'datetime',
            // Sans cast, la base renvoie 1/0 et BadgeEvaluatorService (=== true) ne débloquait jamais la ponctualité
            'is_on_time' => 'boolean',
            'rating' => 'integer',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    /**
     * Une offre ne peut être remplacée par une nouvelle sélection que tant que le candidat ne l'a pas acceptée
     * et qu'aucun fonds n'est engagé (sinon : mission en cours effacée, séquestre bloqué sur une offre supprimée).
     */
    public function isReplaceable(): bool
    {
        return $this->accepted_at === null
            && !in_array($this->payment_status, ['locked', 'paid'], true);
    }
}
