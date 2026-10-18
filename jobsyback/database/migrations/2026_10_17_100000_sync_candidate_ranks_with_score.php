<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Rattrapage unique du lot B1. Le rang suit désormais l'expérience réelle (RankService::syncRankWithScore),
 * mais seulement à chaque nouveau gain d'XP. Les candidats qui avaient déjà assez de score avant ce changement
 * passent ici au rang que leur score atteint. Jamais de rétrogradation, et pas de notification en masse.
 */
return new class extends Migration
{
    public function up(): void
    {
        $rangs = DB::table('ranks')->get(['id', 'points']);

        // Du rang le plus haut au plus bas : un candidat déjà placé plus haut n'est plus concerné par les rangs suivants
        foreach ($rangs->sortByDesc('points') as $rang) {
            $rangsInferieurs = $rangs->where('points', '<', $rang->points)->pluck('id')->all();

            DB::table('candidats')
                ->where('score', '>=', $rang->points)
                ->where(function ($requete) use ($rangsInferieurs) {
                    $requete->whereNull('rank_id')->orWhereIn('rank_id', $rangsInferieurs);
                })
                ->update(['rank_id' => $rang->id]);
        }
    }

    public function down(): void
    {
        // Rien à défaire : l'ancien rang n'est pas conservé, et le rang atteint reste cohérent avec le score.
    }
};
