<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonProgress extends Model
{
    public $timestamps = false;
    protected $fillable = ['candidat_id', 'lesson_id', 'completed_at'];
}
