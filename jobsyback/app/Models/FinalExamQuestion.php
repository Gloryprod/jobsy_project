<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinalExamQuestion extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'question_text',
        'options',
        'correct_answers',
        'points',
    ];

    // Cast automatique des champs JSON en tableaux PHP
    protected $casts = [
        'options' => 'array',
        'correct_answers' => 'array',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
