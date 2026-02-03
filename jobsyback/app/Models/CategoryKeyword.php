<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CategoryKeyword extends Model
{
    protected $fillable = ['category_id', 'keyword'];

    /**
     * La catégorie vers laquelle ce mot-clé redirige
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
