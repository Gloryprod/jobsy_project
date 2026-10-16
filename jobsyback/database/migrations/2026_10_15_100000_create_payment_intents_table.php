<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Intention de paiement créée par le serveur avant l'ouverture du widget KkiaPay.
     * Le webhook ne crédite que le montant attendu, et une seule fois par transaction.
     */
    public function up(): void
    {
        Schema::create('payment_intents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('entreprise_id')->constrained()->onDelete('cascade');
            $table->foreignId('mission_offer_id')->nullable()->constrained('mission_offers')->nullOnDelete();
            $table->string('purpose'); // wallet_topup | mission_funding
            $table->unsignedBigInteger('amount'); // XOF, sans centimes
            $table->string('status')->default('pending'); // pending | paid
            $table->string('provider_transaction_id')->nullable()->unique();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_intents');
    }
};
