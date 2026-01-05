<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = [
        'candidat_id',
        'telephone',
        'email_secondaire',
        'linkedin',
        'whatsapp',
    ];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }
}
