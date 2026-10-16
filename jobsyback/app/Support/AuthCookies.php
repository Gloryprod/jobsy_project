<?php

namespace App\Support;

use Symfony\Component\HttpFoundation\Cookie;

/**
 * Cookies d'authentification (tokens Sanctum) : httpOnly, donc illisibles par JavaScript,
 * ce qui empêche un script injecté (XSS) de voler la session.
 *
 * - access_token : envoyé à toute l'API, recopié en en-tête Authorization par CookieFilter.
 * - refresh_token : limité au chemin /api/refresh, il ne circule que pour renouveler l'accès.
 *
 * SameSite=Strict par défaut : le front et l'API doivent partager le même site (ex. app.jobsy.bj et api.jobsy.bj).
 * Pour un front sur un autre domaine, AUTH_COOKIE_SAMESITE=none (impose HTTPS).
 */
class AuthCookies
{
    public const ACCESS = 'access_token';
    public const REFRESH = 'refresh_token';

    public const ACCESS_MINUTES = 30;
    public const REFRESH_MINUTES = 60 * 24 * 14;

    public static function access(string $plainTextToken): Cookie
    {
        return self::make(self::ACCESS, $plainTextToken, self::ACCESS_MINUTES, self::accessPath());
    }

    public static function refresh(string $plainTextToken): Cookie
    {
        return self::make(self::REFRESH, $plainTextToken, self::REFRESH_MINUTES, self::refreshPath());
    }

    /**
     * @return Cookie[] cookies expirés à joindre à la réponse de déconnexion
     */
    public static function forget(): array
    {
        return [
            self::make(self::ACCESS, '', -2628000, self::accessPath()),
            self::make(self::REFRESH, '', -2628000, self::refreshPath()),
        ];
    }

    private static function make(string $name, string $value, int $minutes, string $path): Cookie
    {
        $sameSite = strtolower((string) config('auth.cookie_same_site', 'strict'));
        // SameSite=None est refusé par les navigateurs sans l'attribut Secure
        $secure = $sameSite === 'none' ? true : (config('session.secure') ?? request()->isSecure());

        return cookie($name, $value, $minutes, $path, config('session.domain'), $secure, true, false, $sameSite);
    }

    private static function accessPath(): string
    {
        return (request()->getBasePath() ?: '') . '/';
    }

    private static function refreshPath(): string
    {
        return (request()->getBasePath() ?: '') . '/api/refresh';
    }
}
