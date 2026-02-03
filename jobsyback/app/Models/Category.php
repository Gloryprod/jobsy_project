<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'color'];

    public function skills(): HasMany
    {
        return $this->hasMany(Skills::class);
    }

    public function keywords(): HasMany
    {
        return $this->hasMany(CategoryKeyword::class);
    }
}
