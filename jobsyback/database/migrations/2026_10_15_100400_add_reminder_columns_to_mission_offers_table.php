<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Relances (app:remind-pending-candidates, toutes les heures) : une seule relance par offre,
     * pour le candidat comme pour l'entreprise.
     */
    public function up(): void
    {
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->timestamp('candidate_reminded_at')->nullable();
            $table->timestamp('company_reminded_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('mission_offers', function (Blueprint $table) {
            $table->dropColumn(['candidate_reminded_at', 'company_reminded_at']);
        });
    }
};
