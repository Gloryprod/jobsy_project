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
        Schema::table('applications', function (Blueprint $table) {
            // 'applied' = candidature directe classique
            // 'invited' = candidat suggéré ayant accepté une proposition
            $table->enum('source', ['applied', 'invited'])
                  ->default('applied')
                  ->after('mission_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
