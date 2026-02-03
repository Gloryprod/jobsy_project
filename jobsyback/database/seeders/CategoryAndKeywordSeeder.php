<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\CategoryKeyword;
use Illuminate\Support\Facades\DB;

class CategoryAndKeywordSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Category::truncate();
        CategoryKeyword::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $data = [
            'Informatique & Digital' => [
                'dev', 'php', 'javascript', 'python', 'html', 'css', 'react', 'angular', 'vue', 'node', 
                'sql', 'nosql', 'docker', 'aws', 'cloud', 'cyber', 'reseau', 'linux', 'api', 'flutter', 
                'java', 'c#', 'laravel', 'symfony', 'typescript', 'next.js', 'mobile', 'web', 'design',
                'github', 'backend', 'frontend', 'flutter', 'digital', 'communication', 'redaction web', 
                'devops', 'graphisme', 'ux', 'ui'
            ],
            'Administration & Secrétariat' => [
                'secretariat', 'accueil', 'agenda', 'saisie', 'administratif', 'courrier', 'archivage', 
                'reception', 'bureautique', 'assistanat', 'redaction'
            ],
            'Comptabilité & Finance' => [
                'compta', 'expert-comptable', 'audit', 'fiscal', 'paie', 'tresorerie', 'banque', 
                'finance', 'facturation', 'bilan', 'analyste', 'controle de gestion', 'sap'
            ],
            'Bâtiment & Travaux Publics (BTP)' => [
                'maçon', 'electrici', 'plombier', 'peintre', 'menuisier', 'charpentier', 'coffreur', 
                'carreleur', 'grutier', 'chantier', 'btp', 'soudeur', 'etancheite', 'climatisation', 'plans'
            ],
            'Transport & Logistique' => [
                'chauffeur', 'livraison', 'stock', 'magasinier', 'cariste', 'logistique', 'poids lourd', 
                'manutention', 'inventaire', 'expedition', 'permis'
            ],
            'Commerce & Vente' => [
                'vente', 'commercial', 'caisse', 'rayon', 'client', 'negoce', 'vendeur', 'prospection', 
                'merchandising', 'fidelisation', 'magasin'
            ],
            'Hôtellerie & Restauration' => [
                'cuisine', 'serveur', 'salle', 'hotel', 'restau', 'barman', 'plonge', 'receptionniste', 
                'commis', 'haccp', 'etage'
            ],
            'Santé & Social' => [
                'soin', 'infirmier', 'social', 'medical', 'aide-soignant', 'hopital', 'educateur', 
                'geriatrie', 'petite enfance', 'psychologie'
            ],
            'Sécurité & Gardiennage' => [
                'securite', 'gardien', 'surveillance', 'vigile', 'incendie', 'ssiap', 'controle', 
                'ronde', 'protection', 'cantine', 'pompier', 'police', 'securite sociale', 'securite du travail',
                'nettoyage'
            ],
            'Soft Skills (Savoir-être)' => [
                'leadership', 'communication', 'equipe', 'autonomie', 'rigueur', 'perseverance', 
                'creativite', 'resilience', 'organisation', 'ponctualite', 
            ],
        ];

        foreach ($data as $categoryName => $keywords) {
            // 1. Créer la catégorie
            $category = Category::create([
                'name' => $categoryName,
                'color' => $this->getRandomColor() // Optionnel : pour le front
            ]);

            // 2. Créer les mots-clés associés
            foreach ($keywords as $kw) {
                CategoryKeyword::create([
                    'category_id' => $category->id,
                    'keyword' => mb_strtolower($kw)
                ]);
            }
        }
    }

    private function getRandomColor() {
        $colors = ['#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#34495e', '#1abc9c'];
        return $colors[array_rand($colors)];
    }
}