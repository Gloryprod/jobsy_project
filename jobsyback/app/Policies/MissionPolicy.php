<?php

namespace App\Policies;

use App\Models\Mission;
use App\Models\User;

class MissionPolicy
{
    /**
     * Seule l'entreprise propriétaire peut consulter le détail recruteur, modifier, fermer ou supprimer une mission.
     */
    public function manage(User $user, Mission $mission): bool
    {
        return $user->entreprise !== null
            && (int) $user->entreprise->id === (int) $mission->entreprise_id;
    }
}
