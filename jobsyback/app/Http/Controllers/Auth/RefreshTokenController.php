<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class RefreshTokenController extends Controller
{
    public function refresh(Request $request)
    {
        $bearerToken = $request->bearerToken();

        if (! $bearerToken) {
            return apiResponse(
                null,
                'Refresh token manquant',
                'error',
                401
            );
        }

        $refreshToken = PersonalAccessToken::findToken($bearerToken);

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

        // ❌ Supprimer les anciens access tokens
        $user->tokens()->where('type', 'access')->delete();

        // ✅ Créer un nouveau access token
        $newAccessToken = $user->createToken('jobsy-access-token');
        $newAccessToken->accessToken->update([
            'type' => 'access',
            'expires_at' => now()->addMinutes(30),
        ]);

        return apiResponse(
            [
                'access_token' => $newAccessToken->plainTextToken
            ],
            'Token rafraîchi avec succès'
        );
    }
}