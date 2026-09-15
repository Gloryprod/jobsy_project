<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\MissionOffers;
use App\Observers\MissionOffersObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;


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

        RateLimiter::for('login', function (Request $request) {
        $key = Str::lower($request->input('email')).'|'.$request->ip();
        return Limit::perMinute(5)->by($key);
    });
    }
}
