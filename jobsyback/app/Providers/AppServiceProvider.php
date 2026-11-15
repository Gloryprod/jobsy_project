<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\MissionOffers;
use App\Observers\MissionOffersObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use App\Mail\BrevoTransport;

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

        Schema::defaultStringLength(191);

        // MAIL_MAILER=brevo : envoi par l'API HTTP de Brevo (voir BrevoTransport)
        Mail::extend('brevo', fn (array $config) => new BrevoTransport((string) ($config['key'] ?? ''), (int) ($config['timeout'] ?? 15)));

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

        // Inscription et e-mails de compte : un compteur par route et par adresse e-mail, plus un plafond large par IP.
        // Les limites sans nom (throttle:5,1…) partageaient un seul compteur par IP pour toutes les routes : deux
        // inscriptions suffisaient à bloquer le renvoi de l'e-mail. Derrière le proxy de Render, l'IP vue par Laravel
        // peut aussi être la même pour tous les visiteurs.
        $parEmail = fn (string $nom, int $parAdresse) => fn (Request $request) => [
            Limit::perMinute($parAdresse)->by($nom . ':' . Str::lower((string) $request->input('email')) . '|' . $request->ip()),
            Limit::perMinute(60)->by($nom . '-ip:' . $request->ip()),
        ];
        RateLimiter::for('inscription', $parEmail('inscription', 5));
        RateLimiter::for('verification', $parEmail('verification', 3));
        RateLimiter::for('oubli', $parEmail('oubli', 3));
        RateLimiter::for('reinitialisation', $parEmail('reinitialisation', 5));

        // Appels à l'IA (Groq, facturés) : génération de questions, notation, analyse de CV
        RateLimiter::for('ai', fn (Request $request) => Limit::perMinute(10)->by('ai:' . ($request->user()?->id ?: $request->ip())));

        // Téléversements de fichiers (espace disque)
        RateLimiter::for('uploads', fn (Request $request) => Limit::perMinute(20)->by('up:' . ($request->user()?->id ?: $request->ip())));
    }
}
