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
        Schema::create('user_exam_sessions', function (Blueprint $table) {
           $table->id();
            // L'apprenant (ici, lié à la table candidats)
            $table->foreignId('candidat_id')->constrained('candidats')->onDelete('cascade');
            // Le modèle de projet associé
            $table->foreignId('exam_project_id')->constrained()->onDelete('cascade');
            
            // Statut de la session
            $table->enum('status', ['in_progress', 'submitted', 'under_review', 'approved', 'failed'])
                  ->default('in_progress');
            
            // Les réponses de l'étudiant aux inputs_schema
            // Stocké en JSON : {"q1_response": "Le plan de crise est...", "github_url": "..."}
            $table->json('submitted_data')->nullable(); 
            
            // --- Partie Correction (Admin) ---
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            // Détail des points par critère : {"Pertinence": 8, "Qualité rédaction": 9}
            $table->json('detailed_marks')->nullable(); 
            $table->integer('final_score')->nullable(); // Score final en % (ex: 85)
            $table->text('admin_feedback')->nullable(); // Commentaire d'encouragement/retour
            
            // --- Suivi Temporel ---
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_exam_sessions');
    }
};
