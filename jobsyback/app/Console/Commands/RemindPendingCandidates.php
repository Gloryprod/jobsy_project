<?php

namespace App\Console\Commands;

use App\Models\Mission;
use App\Models\MissionOffers;
use App\Notifications\CandidateReminderNotification;
use App\Notifications\CompanyReminderNotification;
use Illuminate\Console\Command;

class RemindPendingCandidates extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:remind-pending-candidates';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // 1. RELANCE CANDIDATS (Echéance approche : < 6 heures)
        $nearOffers = MissionOffers::whereNull('accepted_at')
            ->whereNull('declined_at')
            ->whereBetween('expires_at', [now(), now()->addHours(6)])
            ->get();

        foreach ($nearOffers as $offer) {
            // Notifier le candidat (Mail + In-app)
            $offer->application->candidat->user->notify(new CandidateReminderNotification($offer));
        }

        // 2. RELANCE ENTREPRISE (Echéance dépassée et reste des places)
        $expiredOffers = MissionOffers::whereNull('accepted_at')
            ->whereNull('declined_at')
            ->where('expires_at', '<', now())
            ->where('created_at', '>', now()->subDay()) // Pour ne pas relancer indéfiniment
            ->get()
            ->groupBy('application.mission_id'); // On groupe par mission pour ne pas spammer l'entreprise

        foreach ($expiredOffers as $missionId => $offers) {
            $mission = Mission::find($missionId);
            // Notifier l'entreprise que X candidats n'ont pas répondu
            $mission->entreprise->user->notify(new CompanyReminderNotification($mission, $offers->count()));
        }
    }
}
