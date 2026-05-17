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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            // 'deposit' (entrée), 'withdrawal' (sortie), 'transfer' (entre wallets), 'fee' (commission)
            $table->enum('type', ['deposit', 'withdrawal', 'transfer', 'fee']);
            // 'pending', 'completed', 'failed', 'cancelled'
            $table->string('status')->default('pending');
            $table->string('reference')->unique(); // ID unique pour le suivi (ex: TRX-123456)
            $table->json('metadata')->nullable(); // Pour stocker l'ID de la mission ou l'ID FedaPay
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
