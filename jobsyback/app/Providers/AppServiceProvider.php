<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\MissionOffers;
use App\Observers\MissionOffersObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        config([
            'cors.paths' => ['api/*','api', 'sanctum/csrf-cookie', 'login', 'logout', 'api/webhooks/kkiapay'],
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
        MissionOffers::observe(MissionOffersObserver::class);
    }
}
