<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'validation_mode',
        'delivered_skills',
        'reward_xp',
        'reward_asset',
        'is_active',
    ];

    protected $casts = [
        'delivered_skills' => 'array',
    ];

    public function modules() {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function enrollments() {
        return $this->hasMany(Enrollment::class);
    }
    
    // Relation distante pour accéder aux leçons directement depuis le cours
    public function lessons() {
        return $this->hasManyThrough(Lesson::class, Module::class);
    }
}
