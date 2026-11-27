<?php

namespace App\Support;

/**
 * Règle de mot de passe unique : inscription, réinitialisation et changement depuis le profil.
 * Le front applique la même (jobsyfront/lib/password.ts) ; tout caractère non alphanumérique compte comme spécial.
 */
class PasswordPolicy
{
    public static function rules(): array
    {
        return [
            'string', 'min:8',
            'regex:/[a-z]/',       // minuscule
            'regex:/[A-Z]/',       // majuscule
            'regex:/[0-9]/',       // chiffre
            'regex:/[^a-zA-Z0-9]/' // caractère spécial
        ];
    }

    /** Messages en français : le front affiche directement le message renvoyé par l'API. */
    public static function messages(string $field): array
    {
        return [
            "{$field}.min" => 'Le mot de passe doit contenir au moins 8 caractères.',
            "{$field}.regex" => 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
            "{$field}.confirmed" => 'Les mots de passe ne correspondent pas.',
        ];
    }
}
