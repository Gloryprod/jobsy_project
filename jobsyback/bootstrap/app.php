<?php

use App\Http\Middleware\RoleMiddleware;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        $middleware->priority([
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);
        // Authentification par cookie httpOnly : le token du cookie devient l'en-tête Authorization
        $middleware->api(prepend: [
            \App\Http\Middleware\CookieFilter::class,
        ]);
        // Tokens opaques déjà aléatoires : pas de chiffrement Laravel (sinon illisibles hors du groupe web)
        $middleware->encryptCookies(except: [
            \App\Support\AuthCookies::ACCESS,
            \App\Support\AuthCookies::REFRESH,
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'access.token' => \App\Http\Middleware\EnsureAccessTokenIsValid::class,
        ]);
        $middleware->statefulApi();
        // Limite générale de toutes les routes /api (limiteur « api » défini dans AppServiceProvider)
        $middleware->throttleApi();
        $middleware->validateCsrfTokens(except: [
            'api/webhooks/kkiapay',
            'api/webhooks/kkiapay/payouts',
            'api/webhooks/kkiapay/deposits',
        ]);

    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Toute erreur sur l'API est rendue en JSON (jamais une page HTML), même sans en-tête Accept.
        // Avec APP_DEBUG=false (obligatoire en production), le message interne et la trace ne sont pas exposés.
        $exceptions->shouldRenderJsonWhen(
            fn (\Illuminate\Http\Request $request) => $request->is('api/*') || $request->expectsJson()
        );
    })
    ->create();
