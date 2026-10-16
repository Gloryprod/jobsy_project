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
        // CORS : voir config/cors.php (origines lues depuis l'environnement)
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

        // Limite générale de l'API (bootstrap/app.php : throttleApi) : par session si connecté, sinon par IP.
        // Large pour les IP partagées des réseaux mobiles (beaucoup d'utilisateurs derrière une même IP publique).
        RateLimiter::for('api', function (Request $request) {
            $token = $request->bearerToken();

            return $token
                ? Limit::perMinute(180)->by('token:' . sha1($token))
                : Limit::perMinute(300)->by('ip:' . $request->ip());
        });

        // Appels à l'IA (Groq, facturés) : génération de questions, notation, analyse de CV
        RateLimiter::for('ai', fn (Request $request) => Limit::perMinute(10)->by('ai:' . ($request->user()?->id ?: $request->ip())));

        // Téléversements de fichiers (espace disque)
        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(20)->by('up:' . ($request->user()?->id ?: $request->ip())));
    }
}
