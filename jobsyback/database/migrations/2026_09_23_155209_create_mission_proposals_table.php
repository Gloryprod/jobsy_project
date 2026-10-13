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
        Schema::create('mission_proposals', function (Blueprint $table) {
            $table->id();
            
            // Clés étrangères
            $table->foreignId('mission_id')->constrained('missions')->onDelete('cascade');
            $table->foreignId('candidat_id')->constrained('candidats')->onDelete('cascade');
            $table->foreignId('entreprise_id')->constrained('entreprises')->onDelete('cascade');
            
            // Contenu du message de proposition
            $table->string('subject');
            $table->text('message');
            
            // Statut de la proposition
            $table->enum('status', ['pending', 'accepted', 'declined', 'expired'])->default('pending');
            
            // Suivi des dates
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamp('responded_at')->nullable();
            
            $table->timestamps();

            // Unicité : empêcher d'envoyer plusieurs propositions actives pour la même mission au même candidat
            $table->unique(['mission_id', 'candidat_id']);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mission_proposals');
    }
};
