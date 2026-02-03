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
            'cors.paths' => ['api/*','api', 'sanctum/csrf-cookie', 'login', 'logout'],
            'cors.allowed_origins' => ['http://localhost:3000'],
            'cors.allowed_origins_patterns' => [],
            'cors.allowed_headers' => ['*'],
            'cors.allowed_methods' => ['*'],
            'cors.exposed_headers' => [],
            'cors.max_age' => 0,
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
