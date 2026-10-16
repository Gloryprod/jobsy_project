<?php

namespace Database\Seeders;

use App\Models\Rank;
use Illuminate\Database\Seeder;

/**
 * Rangs des candidats, du plus élevé (S) au plus bas (E).
 * Idempotent : un rang déjà présent (même code) n'est pas modifié.
 * Valeurs par défaut à ajuster si besoin ; les rangs existants en base sont conservés tels quels.
 */
class RankSeeder extends Seeder
{
    public function run(): void
    {
        $ranks = [
            ['rank' => 'S', 'label' => 'Rang S - Doctorat',      'points' => 5000, 'color' => 'purple', 'code_hexa' => '#7C3AED'],
            ['rank' => 'A', 'label' => 'Rang A - Master',        'points' => 3000, 'color' => 'red',    'code_hexa' => '#DC2626'],
            ['rank' => 'B', 'label' => 'Rang B - Licence',       'points' => 1500, 'color' => 'blue',   'code_hexa' => '#2563EB'],
            ['rank' => 'C', 'label' => 'Rang C - BTS / DUT',     'points' => 800,  'color' => 'green',  'code_hexa' => '#16A34A'],
            ['rank' => 'D', 'label' => 'Rang D - Baccalauréat',  'points' => 300,  'color' => 'yellow', 'code_hexa' => '#CA8A04'],
            ['rank' => 'E', 'label' => 'Rang E - Débutant',      'points' => 0,    'color' => 'gray',   'code_hexa' => '#6B7280'],
        ];

        foreach ($ranks as $rank) {
            Rank::firstOrCreate(['rank' => $rank['rank']], $rank);
        }
    }
}
