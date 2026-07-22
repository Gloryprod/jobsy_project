<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinalExamResults extends Model
{
    protected $fillable = [
        'candidat_id',
        'course_id',
        'score',
        'is_passed',
    ];

    public function candidat()
    {
        return $this->belongsTo(Candidat::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }
}
