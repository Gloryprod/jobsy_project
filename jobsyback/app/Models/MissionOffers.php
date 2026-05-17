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
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'declined_at' => 'datetime',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }
}
