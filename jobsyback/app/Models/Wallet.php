<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Wallet extends Model
{
    protected $fillable = [
        "entreprise_id",
        "candidat_id",
        "balance",
        "balance_locked",
        "currency",
        "is_admin"
    ];

    public function transactions() {
        return $this->hasMany(Transaction::class);
    }

    // Helper pour savoir ce qui est réellement disponible au retrait
    public function getAvailableBalanceAttribute() {
        return $this->balance - $this->balance_locked;
    }

    public function candidat()
    {
        return $this->belongsTo(Candidat::class, 'candidat_id');
    }

    public function entreprise()
    {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }
}
