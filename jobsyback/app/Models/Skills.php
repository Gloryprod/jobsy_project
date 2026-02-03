<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Skills extends Model
{
    protected $fillable = ['name', 'category_id'];


    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Les candidats qui possèdent ce skill
     */
    public function candidats(): BelongsToMany
    {
        return $this->belongsToMany(Candidat::class, 'candidat_skill');
    }
}
