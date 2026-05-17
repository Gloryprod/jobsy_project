<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'module_id',
        'title',
        'type',
        'content',
        'duration_minutes',
        'order',
    ];

    public function module() {
        return $this->belongsTo(Module::class);
    }
}
