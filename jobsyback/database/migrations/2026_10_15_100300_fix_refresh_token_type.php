<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Les refresh tokens étaient enregistrés avec type = 'access' (colonne non fillable sur le modèle Sanctum) :
     * ils permettaient d'appeler l'API pendant 14 jours et ne pouvaient pas servir au renouvellement.
     * On les reclasse d'après leur nom.
     */
    public function up(): void
    {
        DB::table('personal_access_tokens')
            ->where('name', 'jobsy-refresh-token')
            ->update(['type' => 'refresh']);
    }

    public function down(): void
    {
        //
    }
};
