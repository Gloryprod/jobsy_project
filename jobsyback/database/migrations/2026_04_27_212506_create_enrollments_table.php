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
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidat_id')->constrained()->onDelete('cascade');
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            
            // --- États et Progression ---
            $table->integer('progress_percentage')->default(0); // Basé sur les nuggets vus
            $table->enum('status', [
                'enrolled',          // Inscrit mais n'a pas commencé
                'waiting_kit',       // Mode B : En attente de livraison
                'learning',          // En cours de lecture des nuggets
                'evaluation_ready',  // Tous les modules lus, prêt pour le test final ou projet
                'pending_review',    // Mode C : Projet soumis, en attente de l'admin
                'certified',         // Succès total
                'failed'             // Échec (si tu prévois un nombre de tentatives limité)
            ])->default('enrolled');

            // --- Scores et Résultats (La nouvelle logique) ---
            $table->float('average_quiz_score')->nullable(); // Moyenne des scores de la table module_results
            $table->float('final_project_score')->nullable(); // Note donnée par l'admin (Mode C)
            $table->float('global_score')->nullable(); // Score final combiné (calculé par le système)

            // --- Mode B : Logistique ---
            $table->enum('delivery_status', ['none', 'pending', 'delivered'])->default('none');
            
            // --- Mode C : Expert (Gestion du projet) ---
            $table->string('project_path')->nullable(); // Lien vers le fichier/lien soumis
            $table->text('admin_feedback')->nullable(); // Commentaire de l'expert
            
            // --- Certification ---
            $table->string('certificate_hash')->nullable()->unique();
            $table->timestamp('certified_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
