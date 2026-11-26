<?php

namespace Tests\Feature;

use App\Models\{Application, Candidat, Entreprise, Mission};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * En production, la file d'attente n'est traitée par aucun processus : la notification dans l'application
 * doit partir sans elle. Seul l'e-mail reste en file.
 */
class NotificationsImmediatesTest extends TestCase
{
    use RefreshDatabase;

    public function test_cloturer_une_mission_previent_les_candidats_sans_file_d_attente(): void
    {
        config(['queue.default' => 'database']);
        $entreprise = Entreprise::factory()->create();
        $mission = Mission::factory()->create(['entreprise_id' => $entreprise->id]);
        $candidat = Candidat::factory()->create();
        $candidature = Application::create(['mission_id' => $mission->id, 'candidat_id' => $candidat->id, 'status' => 'pending']);

        $this->withHeaders($this->bearerFor($entreprise->user))->getJson("/api/missions/close/{$mission->id}")->assertOk();

        $this->assertSame('rejected', $candidature->fresh()->status);
        $notification = DB::table('notifications')->where('notifiable_id', $candidat->user->id)->first();
        $this->assertNotNull($notification, 'la notification dans l\'application doit être enregistrée tout de suite');
        $this->assertSame('mission_closed', json_decode($notification->data, true)['type']);
        // L'e-mail, lui, attend dans la file
        $this->assertSame(1, DB::table('jobs')->count());
    }
}
