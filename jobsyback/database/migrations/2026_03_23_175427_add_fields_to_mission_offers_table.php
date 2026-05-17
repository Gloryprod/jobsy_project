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
        Schema::table('mission_offers', function (Blueprint $table) {
            // États et Suivi
            $table->string('status')->nullable(); 
            $table->dateTime('notified_presence_at')->nullable();
            $table->dateTime('started_at')->nullable();
            $table->dateTime('finished_at')->nullable();
            $table->dateTime('validated_at')->nullable();

            // Paiement (pour Freelance/Ponctuel)
            $table->dateTime('paid_at')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('payment_status')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('mission_offers', function (Blueprint $table) {
            //
        });
    }
};
