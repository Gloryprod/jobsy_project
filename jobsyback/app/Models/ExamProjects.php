<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamProjects extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'title',
        'domain',
        'context_rich_text',
        'inputs_schema',
        'evaluation_criteria',
        'passing_score',
        'time_limit_minutes',
    ];

    // Très important pour manipuler les colonnes JSON comme des tableaux PHP
    protected $casts = [
        'inputs_schema' => 'array',
        'evaluation_criteria' => 'array',
    ];

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(UserExamSession::class);
    }
}