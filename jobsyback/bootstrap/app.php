<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\HandleCors;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // 📌 Active CORS pour l'API
        $middleware->group('api', [
            HandleCors::class,
            EnsureFrontendRequestsAreStateful::class,
        ]);

        // 📌 Configuration CORS pour Next.js
        config([
            'cors.paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
            'cors.allowed_origins' => ['http://localhost:3001'], // FRONTEND
            'cors.allowed_headers' => ['*'],
            'cors.allowed_methods' => ['*'],
            'cors.supports_credentials' => true, // IMPORTANT pour Sanctum
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->create();
