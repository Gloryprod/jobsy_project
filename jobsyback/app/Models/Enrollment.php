<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'candidat_id',
        'course_id',
        'enrolled_at',
        'progress_percentage',
        'status',
        'average_quiz_score',
        'final_project_score',
        'global_score',
        'delivery_status',
        'project_path',
        'admin_feedback',
        'certificate_hash',
        'certified_at'
    ];

    protected $casts = [
        'certified_at' => 'datetime',
    ];

    public function candidat() {
        return $this->belongsTo(Candidat::class);
    }

    public function course() {
        return $this->belongsTo(Course::class);
    }
}
