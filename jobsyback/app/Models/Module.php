<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Module extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'title',
        'description',
        'order',
    ];

    public function course() {
        return $this->belongsTo(Course::class);
    }

    public function lessons() {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function quiz_questions() {
        return $this->hasMany(QuizQuestion::class);
    }

    public function results() {
        return $this->hasMany(ModuleResult::class);
    }   
}
