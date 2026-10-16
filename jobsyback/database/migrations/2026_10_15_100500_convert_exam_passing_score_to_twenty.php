<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * La note de passage des projets pratiques s'affiche et se corrige sur 20, mais le formulaire admin
     * proposait 70 par défaut (pourcentage) : aucun candidat ne pouvait réussir.
     * Les valeurs > 20 sont des pourcentages : 70 % → 14 / 20.
     */
    public function up(): void
    {
        Schema::table('exam_projects', function (Blueprint $table) {
            $table->integer('passing_score')->default(15)->change();
        });

        DB::table('exam_projects')
            ->where('passing_score', '>', 20)
            ->orderBy('id')
            ->each(function ($project) {
                DB::table('exam_projects')
                    ->where('id', $project->id)
                    ->update(['passing_score' => max(1, min(20, (int) round($project->passing_score / 5)))]);
            });
    }

    public function down(): void
    {
        //
    }
};
