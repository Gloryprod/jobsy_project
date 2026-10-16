<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Données de référence indispensables au fonctionnement (installation neuve : php artisan migrate --seed).
     * L'administrateur se crée ensuite avec : php artisan app:create-admin
     */
    public function run(): void
    {
        // Idempotents : peuvent être relancés sans risque
        $this->call([
            RankSeeder::class,
            BadgeSeeder::class,
        ]);

        // Ce seeder vide puis recrée les catégories : uniquement sur une base vierge
        if (Category::count() === 0) {
            $this->call(CategoryAndKeywordSeeder::class);
        }
    }
}
