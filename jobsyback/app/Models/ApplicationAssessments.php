<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationAssessments extends Model
{
    protected $fillable = [
        'application_id',
        'step_1_data',
        'step_2_data',
        'ai_feedback_details',
        'time_spent_seconds',
    ];

    protected $casts = [
        'step_1_data' => 'array',
        'step_2_data' => 'array',
        'ai_feedback_details' => 'array',
    ];

    public function application() { 
        return $this->belongsTo(Application::class); 
    }
}
