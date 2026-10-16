<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuthServices;
use App\Support\AuthCookies;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class RefreshTokenController extends Controller
{
    public function refresh(Request $request, AuthServices $authService)
    {
        // Cookie httpOnly en priorité (front), en-tête Bearer pour les autres clients
        $plainTextToken = $request->cookie(AuthCookies::REFRESH) ?: $request->bearerToken();

        if (! $plainTextToken) {
            return apiResponse(
                null,
                'Refresh token manquant',
                'error',
                401
            );
        }

        $refreshToken = PersonalAccessToken::findToken($plainTextToken);

        if (
            ! $refreshToken ||
            $refreshToken->type !== 'refresh' ||
            ($refreshToken->expires_at && $refreshToken->expires_at->isPast())
        ) {
            return apiResponse(
                null,
                'Refresh token expiré ou invalide',
                'error',
                401
            );
        }

        $user = $refreshToken->tokenable;

        // ❌ Supprimer les anciens access tokens, et le refresh token utilisé (rotation : il ne sert qu'une fois)
        $user->tokens()->where('type', 'access')->delete();
        $refreshToken->delete();

        // ✅ Créer un nouveau couple de tokens
        $tokens = $authService->issueTokens($user);

        return apiResponse(
            null,
            'Token rafraîchi avec succès'
        )
            ->withCookie(AuthCookies::access($tokens['access']))
            ->withCookie(AuthCookies::refresh($tokens['refresh']));
    }
}
