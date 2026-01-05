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
        Schema::create('formations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidat_id')->constrained('candidats')->cascadeOnDelete();

            $table->string('titre'); // ex: Développement Web Laravel
            $table->string('organisme')->nullable(); // ex: Simplon, OpenClassrooms
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->boolean('en_cours')->default(false);
            $table->string('certificat')->nullable(); // fichier

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('formations');
    }
};
