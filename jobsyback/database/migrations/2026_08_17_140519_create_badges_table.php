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
        Schema::create('badges', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // ex: 'MISS_01', 'MISS_02', 'BEHAV_01'
            $table->string('name');
            $table->text('description');
            $table->enum('category', [
                'ACADEMIQUE', 
                'CERTIFICATION', 
                'TEST_LOGIQUE', 
                'MISSION_TERRAIN', 
                'RIGUEUR_BEHAVIOR'
            ]);
            $table->enum('rarity', ['commun', 'rare', 'épique', 'légendaire']);
            $table->integer('bonus_value')->default(0); // Ex: 15
            $table->string('bonus_label'); // Ex: '+15% Confiance Recruteur'
            $table->string('icon_path')->nullable();
            $table->json('criteria')->nullable(); // Configuration optionnelle
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('badges');
    }
};
