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
        Schema::table('cv_datas', function (Blueprint $table) {
            $table->string('title')->nullable();
            $table->json('other_certifications')->nullable(); 
            $table->json('experiences')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cv_datas', function (Blueprint $table) {
            //
        });
    }
};
