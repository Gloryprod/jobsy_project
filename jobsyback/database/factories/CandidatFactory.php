<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Candidat>
 */
class CandidatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory()->state(['role' => 'JEUNE']),
            'ville' => fake()->city(),
            'niveau_etude' => 'Licence',
            'disponibilite' => 'Immédiate',
            'score' => 0,
            'rank_id' => 3, // adaptez à l'ID réel de votre rang "B" en base
        ];
    }
}
