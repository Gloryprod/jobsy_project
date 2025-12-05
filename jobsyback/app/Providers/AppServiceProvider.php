<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        config([
            'cors.paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
            'cors.allowed_origins' => ['http://localhost:3001'],
            'cors.allowed_headers' => ['*'],
            'cors.allowed_methods' => ['*'],
            'cors.supports_credentials' => true,
        ]);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
