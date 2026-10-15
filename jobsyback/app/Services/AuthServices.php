<?php

namespace App\Services;

use App\Models\User;
use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Rank;
use App\Support\AuthCookies;
use Illuminate\Support\Facades\Hash;

class AuthServices
{
    public function register(array $data)
    {

        $user = User::create([
            'nom' => $data['nom'] ?? null,
            'prenom' => $data['prenom'] ?? null,
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'JEUNE',
            'photo_profil' => $data['photo_profil'] ?? null,
            'telephone' => $data['telephone'] ?? null,
            'est_actif' => true,
        ]);

        // Créer le profil spécifique
        if ($user->role === 'JEUNE') {
            Candidat::create([
                'user_id' => $user->id,
                // Rang de départ « E » cherché par code (l'ID dépend de l'ordre d'insertion en base)
                'rank_id' => Rank::where('rank', 'E')->value('id'),
                'bio' => $data['bio'] ?? null,
                'adresse' => $data['adresse'] ?? null,
            ]);
        } elseif ($user->role === 'ENTREPRISE') {
            Entreprise::create([
                'user_id' => $user->id,
                'nom_entreprise' => $data['nom_entreprise'] ?? $user->nom,
                'secteur_activite' => $data['secteur_activite'] ?? null,
                'localisation' => $data['localisation'] ?? null,
                'description' => $data['description'] ?? null,
                'site_web' => $data['site_web'] ?? null,
            ]);
        }

        return $user;
    }

    /**
     * Émet un couple access / refresh token.
     * « type » n'est pas fillable sur le modèle Sanctum : forceFill obligatoire, sinon le refresh token
     * resterait de type « access » (valeur par défaut de la colonne) et servirait d'accès pendant 14 jours.
     *
     * @return array{access: string, refresh: string} tokens en clair, à poser en cookies httpOnly
     */
    public function issueTokens(User $user): array
    {
        $access = $user->createToken('jobsy-access-token', ['*'], now()->addMinutes(AuthCookies::ACCESS_MINUTES));
        $access->accessToken->forceFill(['type' => 'access'])->save();

        $refresh = $user->createToken('jobsy-refresh-token', ['*'], now()->addMinutes(AuthCookies::REFRESH_MINUTES));
        $refresh->accessToken->forceFill(['type' => 'refresh'])->save();

        return ['access' => $access->plainTextToken, 'refresh' => $refresh->plainTextToken];
    }

    public function login(string $email, string $password)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

}
