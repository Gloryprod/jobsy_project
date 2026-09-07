<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Badge;

class BadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'code' => 'CERT_01',
                'name' => 'Premier Certificat',
                'description' => 'Téléverser 1 certification de formation externe (ex: Udemy, Coursera, OpenClassrooms...).',
                'category' => 'CERTIFICATION',
                'rarity' => 'commun',
                'bonus_value' => 5,
                'bonus_label' => '+5% Proactivité',
            ],
            [
                'code' => 'CERT_02',
                'name' => 'Apprenant Régulier',
                'description' => 'Valider 5 certifications vérifiées sur son profil.',
                'category' => 'CERTIFICATION',
                'rarity' => 'rare',
                'bonus_value' => 12,
                'bonus_label' => '+12% Pertinence Métier',
            ],
            [
                'code' => 'CERT_03',
                'name' => 'Expert Multi-Certifiéé',
                'description' => 'Valider 10 certifications vérifiées.',
                'category' => 'CERTIFICATION',
                'rarity' => 'épique',
                'bonus_value' => 20,
                'bonus_label' => '+20% Crédibilité Tech',
            ],
            // [
            //     'code' => 'MISS_01',
            //     'name' => 'Première Mission Validée',
            //     'description' => 'Valider 1 mission avec une confirmation de présence et de succès par le recruteur.',
            //     'category' => 'MISSION_TERRAIN',
            //     'rarity' => 'commun',
            //     'bonus_value' => 5,
            //     'bonus_label' => '+5% Visibilité',
            // ],
            // [
            //     'code' => 'MISS_02',
            //     'name' => 'Badge Fiabilité Or',
            //     'description' => 'Réaliser 10 missions consécutives sans annulation ni retard.',
            //     'category' => 'MISSION_TERRAIN',
            //     'rarity' => 'épique',
            //     'bonus_value' => 15,
            //     'bonus_label' => '+15% Confiance Recruteur',
            // ],
            // [
            //     'code' => 'MISS_03',
            //     'name' => 'Légende des 50 Missions',
            //     'description' => 'Compléter 50 missions réussies sur la plateforme Jobsy.',
            //     'category' => 'MISSION_TERRAIN',
            //     'rarity' => 'légendaire',
            //     'bonus_value' => 30,
            //     'bonus_label' => 'Top Positionnement',
            // ],
            // [
            //     'code' => 'BEHAV_01',
            //     'name' => 'Ponctualité Exemplaire',
            //     'description' => '5 missions validées avec notification de présence à l\'heure.',
            //     'category' => 'RIGUEUR_BEHAVIOR',
            //     'rarity' => 'rare',
            //     'bonus_value' => 10,
            //     'bonus_label' => '+10% Crédibilité',
            // ],
        ];

        foreach ($badges as $badge) {
            Badge::updateOrCreate(['code' => $badge['code']], $badge);
        }
    }
}