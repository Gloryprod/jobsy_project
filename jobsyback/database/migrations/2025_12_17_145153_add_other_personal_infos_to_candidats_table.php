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
            $table->string('domaine_competence')->nullable();
            $table->string('niveau_experience')->nullable();
            $table->string('niveau_etude')->nullable();
            $table->string('disponibilite')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidats', function (Blueprint $table) {
             $table->dropColumn([
                'domaine_competence',
                'niveau_experience',
                'niveau_etude',
                'disponibilite',
            ]);
        });
    }
};
