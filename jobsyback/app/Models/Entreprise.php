<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entreprise extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'nom_entreprise',
        'secteur_activite',
        'localisation',
        'description',
        'site_web',
        'date_creation',
        'nom_officiel',
        'taille',
        'logo',
    ];

    // Relation inverse vers User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function contact_entreprise()
    {
        return $this->hasOne(ContactEntreprises::class);
    }

    public function missions()
    {
        return $this->hasMany(Mission::class);
    }

    public function wallet() {
        return $this->hasOne(Wallet::class, 'entreprise_id');
    }

    /**
     * Divulgation progressive : l'entreprise ne voit les coordonnées et pièces d'un candidat
     * que s'il a postulé à l'une de ses missions ou accepté l'une de ses propositions.
     */
    public function hasRelationshipWith(Candidat $candidat): bool
    {
        $applied = Application::where('candidat_id', $candidat->id)
            ->where('status', '!=', 'draft')
            ->whereHas('mission', fn ($q) => $q->where('entreprise_id', $this->id))
            ->exists();

        return $applied || MissionProposal::where('entreprise_id', $this->id)
            ->where('candidat_id', $candidat->id)
            ->where('status', 'accepted')
            ->exists();
    }
}
