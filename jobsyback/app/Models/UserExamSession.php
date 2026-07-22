<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserExamSession extends Model
{
    protected $fillable = [
        'candidat_id',
        'exam_project_id',
        'status',
        'submitted_data',
        'admin_id',
        'detailed_marks',
        'final_score',
        'admin_feedback',
        'started_at',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'submitted_data' => 'array',
        'detailed_marks' => 'array',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function candidat(): BelongsTo
    {
        return $this->belongsTo(Candidat::class);
    }

    public function examProject(): BelongsTo
    {
        return $this->belongsTo(ExamProjects::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}