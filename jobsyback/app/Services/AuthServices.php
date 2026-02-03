<?php

namespace App\Services;

use App\Models\User;
use App\Models\Candidat;
use App\Models\Entreprise;
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
                'rank_id' => 6,
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

    public function login(string $email, string $password)
    {
        $user = User::where('email', $email)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return null;
        }

        return $user;
    }

}
