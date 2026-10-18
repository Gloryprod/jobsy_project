<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Mission extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $fillable = [
        'title',
        'company',
        'location',
        'reward',
        'duration',
        'deadline',
        'description',
        'skills',
        'urgency',
        'applicants',
        'category',
        'type_contrat',
        // Validés par MissionRequest mais jamais enregistrés jusqu'ici : le rang minimum n'était pas appliqué
        'min_rank_required',
        'test_severity',
        'active',
        'entreprise_id',
        'closed_at'
    ];

    protected $casts = [
        'skills' => 'array',
        'deadline' => 'date',
    ];

    public function applications() {
        return $this->hasMany(Application::class);
    }

    public function entreprise() {
        return $this->belongsTo(Entreprise::class, 'entreprise_id');
    }

    /**
     * Offre acceptée et pas encore soldée, ou fonds bloqués : la mission ne doit pas être supprimée
     * (le candidat perdrait sa mission en cours et le séquestre resterait bloqué).
     */
    public function hasEngagedOffers(): bool
    {
        return MissionOffers::whereHas('application', fn ($q) => $q->where('mission_id', $this->id))
            ->where(function ($q) {
                $q->where('payment_status', 'locked')
                    ->orWhere(fn ($q) => $q->whereNotNull('accepted_at')
                        ->whereNotIn('status', ['completed', 'rejected_after_onboarding', 'declined']));
            })
            ->exists();
    }

    /**
     * La date limite est une date sans heure : la mission accepte des candidatures jusqu'à la fin de ce jour.
     * Sans date limite, la mission reste ouverte tant qu'elle est active et non clôturée.
     */
    public function isPastDeadline(): bool
    {
        return $this->deadline !== null && now()->greaterThan($this->deadline->copy()->endOfDay());
    }

}
