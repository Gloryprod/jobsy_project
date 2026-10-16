<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PaymentIntent extends Model
{
    public const PURPOSE_WALLET_TOPUP = 'wallet_topup';
    public const PURPOSE_MISSION_FUNDING = 'mission_funding';

    protected $fillable = [
        'uuid',
        'entreprise_id',
        'mission_offer_id',
        'purpose',
        'amount',
        'status',
        'provider_transaction_id',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'paid_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (PaymentIntent $intent) {
            $intent->uuid ??= (string) Str::uuid();
        });
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class);
    }

    public function missionOffer()
    {
        return $this->belongsTo(MissionOffers::class, 'mission_offer_id');
    }
}
