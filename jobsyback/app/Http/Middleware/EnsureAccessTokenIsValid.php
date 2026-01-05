<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;

class EnsureAccessTokenIsValid
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bearerToken = $request->bearerToken();

        if (! $bearerToken) {
            return apiResponse(null, 'Non authentifié', 'error', 401);
        }

        $token = PersonalAccessToken::findToken($bearerToken);

        if (
            ! $token ||
            $token->type !== 'access' ||
            ($token->expires_at && $token->expires_at->isPast())
        ) {
            return apiResponse(null, 'Token expiré', 'error', 401);
        }

        return $next($request);
    }
}
