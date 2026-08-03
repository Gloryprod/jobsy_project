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
        Schema::table('user_exam_sessions', function (Blueprint $table) {
            $table->integer('attempts_count')->default(1); // Démarre à 1 dès la création
            $table->boolean('is_blocked')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_exam_sessions', function (Blueprint $table) {
            $table->dropColumn(['attempts_count', 'is_blocked']);
        });
    }
};
