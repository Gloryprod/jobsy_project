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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entreprise_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('candidat_id')->nullable()->constrained()->onDelete('cascade');
            // decimal(15,2) pour éviter les erreurs d'arrondi des types float
            $table->decimal('balance', 15, 2)->default(0.00); 
            // balance_locked : l'argent séquestré pour une mission en cours
            $table->decimal('balance_locked', 15, 2)->default(0.00); 
            $table->string('currency')->default('XOF'); // FCFA
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallets');
    }
};
