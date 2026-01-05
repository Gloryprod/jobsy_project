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
        Schema::create('diplomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidat_id')->constrained('candidats')->cascadeOnDelete();

            $table->string('intitule'); // ex: Licence Informatique
            $table->string('niveau');   // BEPC, BAC, Licence, Master, Doctorat
            $table->string('etablissement')->nullable();
            $table->string('pays')->nullable();
            $table->year('annee_obtention')->nullable();
            $table->string('fichier')->nullable(); // diplôme scanné (PDF / image)

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('diplomes');
    }
};
