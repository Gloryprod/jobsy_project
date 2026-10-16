<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidats', function (Blueprint $table) {
            // Indice de vitalité du candidat (ex: de 0 à 100, par défaut 100)
            $table->unsignedInteger('vitality')->default(100)->after('score');
            
            // Nombre de jours consécutifs d'activité (Streak)
            $table->unsignedInteger('streak_count')->default(1)->after('vitality');
            
            // Date de la dernière activité pour calculer le maintien de la série
            $table->timestamp('last_activity_at')->nullable()->after('streak_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidats', function (Blueprint $table) {
            $table->dropColumn(['vitality', 'streak_count', 'last_activity_at']);
        });
    }
};
