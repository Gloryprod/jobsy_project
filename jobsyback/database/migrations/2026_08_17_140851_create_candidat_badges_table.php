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
        Schema::create('candidat_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidat_id')->constrained('candidats')->onDelete('cascade');
            $table->foreignId('badge_id')->constrained('badges')->onDelete('cascade');
            
            $table->boolean('unlocked')->default(false);
            $table->dateTime('unlocked_at')->nullable();
            
            // Suivi de progression (ex: 3 / 10 missions)
            $table->integer('progress_current')->default(0);
            $table->integer('progress_max')->default(1);
            
            // Équipé sur le profil public (limite de 5)
            $table->boolean('equipped')->default(false);
            $table->dateTime('equipped_at')->nullable();

            $table->timestamps();

            $table->unique(['candidat_id', 'badge_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidat_badges');
    }
};
