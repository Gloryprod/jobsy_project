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
        Schema::create('application_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->onDelete('cascade');
    
            // Étape 1 : Motivation / Sérieux (Questions & Réponses)
            $table->json('step_1_data')->nullable(); 
            
            // Étape 2 : Technique (Questions & Réponses)
            $table->json('step_2_data')->nullable();
            
            // Logs de l'IA : Pourquoi a-t-elle mis ce score ?
            $table->json('ai_feedback_details')->nullable();
            
            // Performance
            $table->integer('time_spent_seconds')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('application_assessments');
    }
};
