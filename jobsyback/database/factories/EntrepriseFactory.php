<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Entreprise>
 */
class EntrepriseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory()->state(['role' => 'ENTREPRISE']),
            'nom_entreprise' => fake()->company(),
            'secteur_activite' => 'Digital',
            'localisation' => 'Cotonou',
        ];
    }
}
