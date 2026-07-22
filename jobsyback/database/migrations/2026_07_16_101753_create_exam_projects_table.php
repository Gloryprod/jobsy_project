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
        Schema::create('exam_projects', function (Blueprint $table) {
            $table->id();
            // Lié à la formation concernée
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            
            $table->string('title');
            $table->string('domain'); // ex: 'web_development', 'design', 'management'
            
            // Énoncé complet (HTML ou Markdown)
            $table->text('context_rich_text'); 
            
            // Schéma des champs de réponse attendus (ex: textarea, url, file)
            // Stocké en JSON : [{"key": "q1", "type": "textarea", "label": "..."}]
            $table->json('inputs_schema'); 
            
            // Critères de notation et barèmes associés
            // Stocké en JSON : [{"name": "Pertinence", "max_points": 10}]
            $table->json('evaluation_criteria'); 
            
            // Paramètres de validation
            $table->integer('passing_score')->default(70); // Score requis en % (ex: 70)
            $table->integer('time_limit_minutes')->nullable(); // Temps limite optionnel
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exam_projects');
    }
};
