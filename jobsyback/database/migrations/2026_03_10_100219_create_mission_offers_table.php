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
        Schema::create('mission_offers', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('application_id')
                      ->constrained()
                      ->onDelete('cascade');

            $table->date('start_date');
            $table->time('start_time')->nullable();
            $table->string('place'); 
            
            $table->text('onboarding_instructions')->nullable();
            $table->string('contact_person');

            $table->timestamp('expires_at');
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->text('decline_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mission_offers');
    }
};
