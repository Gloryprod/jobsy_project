<?php

namespace Tests;

use App\Models\Application;
use App\Models\Candidat;
use App\Models\Entreprise;
use App\Models\Mission;
use App\Models\MissionOffers;
use App\Models\Wallet;
use Database\Seeders\RankSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    // Les rangs sont des données de référence (clé étrangère des candidats) : semés à chaque base de test
    protected bool $seed = true;
    protected string $seeder = RankSeeder::class;

    protected function bearerFor(\App\Models\User $user): array
    {
        // Changer d'utilisateur dans un même test : oublier l'utilisateur mis en cache par le guard
        $this->app['auth']->forgetGuards();

        $token = $user->createToken('test-access', ['*'], now()->addMinutes(30));
        $token->accessToken->type = 'access';
        $token->accessToken->save();
        return ['Authorization' => 'Bearer ' . $token->plainTextToken];
    }

    /**
     * Offre de mission (candidat retenu) pour une mission donnée.
     */
    protected function makeOffer(Mission $mission, ?Candidat $candidat = null, array $attributes = []): MissionOffers
    {
        $application = Application::create([
            'mission_id' => $mission->id,
            'candidat_id' => ($candidat ?? Candidat::factory()->create())->id,
            'status' => 'accepted',
        ]);

        return MissionOffers::create(array_merge([
            'application_id' => $application->id,
            'start_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:00',
            'place' => 'Cotonou',
            'contact_person' => 'M. Recruteur',
            'expires_at' => now()->addDay(),
            'status' => 'accepted',
        ], $attributes));
    }

    protected function walletFor(Entreprise|Candidat $owner, float $balance = 0, float $locked = 0): Wallet
    {
        return Wallet::create([
            ($owner instanceof Entreprise ? 'entreprise_id' : 'candidat_id') => $owner->id,
            'balance' => $balance,
            'balance_locked' => $locked,
            'currency' => 'XOF',
        ]);
    }
}
