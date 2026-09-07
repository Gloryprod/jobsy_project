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
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->integer('rating')->nullable()->after('validated_at'); // Note sur 5 (ex: 1, 2, 3, 4, 5)
            $table->boolean('is_on_time')->nullable()->after('rating'); // Ponctualité validée par le recruteur
            $table->text('recruiter_review')->nullable()->after('is_on_time'); // Avis du recruteur
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->dropColumn(['rating', 'is_on_time', 'recruiter_review']);
        });
    }
};
