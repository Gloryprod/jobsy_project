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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidat_id')->constrained('candidats')->onDelete('cascade');
            $table->foreignId('mission_id')->constrained()->onDelete('cascade');
            
            $table->enum('status', ['draft', 'pending', 'accepted', 'rejected'])->default('draft');
            
            $table->integer('global_score')->nullable();
            $table->string('badge')->nullable();
            
            $table->text('ai_summary')->nullable();
            
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            // Un seul essai par mission
            // $table->unique(['user_id', 'mission_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
