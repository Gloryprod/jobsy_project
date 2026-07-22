<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuizQuestion extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'module_id',
        'question_text',
        'options',
        'points',
        'correct_answers',
    ];

    protected $casts = [
        'options' => 'array', 
        'correct_answers' => 'array',
    ];

    public function module() {
        return $this->belongsTo(Module::class);
    }
}
