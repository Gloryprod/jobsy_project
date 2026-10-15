<?php

namespace App\Http\Middleware;

use App\Support\AuthCookies;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CookieFilter
{
    /**
     * Recopie le token du cookie httpOnly « access_token » dans l'en-tête Authorization,
     * pour que auth:sanctum et access.token fonctionnent sans que le front manipule le token.
     *
     * Uniquement pour les requêtes XHR du front (en-tête X-Requested-With) : un lien ou un formulaire
     * envoyé depuis un autre site ne peut pas poser cet en-tête, ce qui bloque le CSRF même si le cookie part.
     * Un en-tête Authorization explicite (clients API, tests) reste prioritaire.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->headers->has('Authorization') && $request->header('X-Requested-With') === 'XMLHttpRequest') {
            $token = $request->cookie(AuthCookies::ACCESS);
            if ($token) {
                $request->headers->set('Authorization', 'Bearer '.$token);
            }
        }
        return $next($request);
    }

}
