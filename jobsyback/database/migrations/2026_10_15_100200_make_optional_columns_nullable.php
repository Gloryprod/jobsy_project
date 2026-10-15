<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Aligne la base sur la validation : ces champs sont facultatifs côté API (et le front ne les envoie pas toujours),
     * mais étaient NOT NULL en base, ce qui faisait échouer l'ajout de diplôme (500) avec MySQL en mode strict.
     */
    public function up(): void
    {
        Schema::table('diplomes', function (Blueprint $table) {
            $table->string('niveau')->nullable()->change();
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->string('duration')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('diplomes', function (Blueprint $table) {
            $table->string('niveau')->nullable(false)->change();
        });

        Schema::table('missions', function (Blueprint $table) {
            $table->string('duration')->nullable(false)->change();
        });
    }
};
