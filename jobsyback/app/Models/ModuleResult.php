<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuleResult extends Model
{
    protected $fillable = [
        'candidat_id',
        'module_id',
        'score',
        'is_passed',
    ];

    public function candidat() {
        return $this->belongsTo(Candidat::class);
    }

    public function module() {
        return $this->belongsTo(Module::class);
    }
}
