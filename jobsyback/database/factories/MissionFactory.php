<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Mission>
 */
class MissionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'entreprise_id' => \App\Models\Entreprise::factory(),
            'title' => fake()->jobTitle(),
            'company' => fake()->company(),
            'location' => 'Cotonou',
            'description' => fake()->paragraph(),
            'reward' => 15000,
            'duration' => '1 semaine',
            'deadLine' => '2026-10-31',
            'category' => 'Digital',
            'type_contrat' => 'Mission Ponctuelle',
            'skills' => ['PHP', 'Laravel', 'JavaScript'],
            'active' => true,
        ];
    }
}
