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
    protected $description = 'Relance une fois les candidats dont l\'offre expire bientôt, et une fois les entreprises dont des offres ont expiré sans réponse';

    /**
     * Execute the console command.
     * Planifiée toutes les heures (routes/console.php) : les colonnes *_reminded_at garantissent une seule relance par offre.
     */
    public function handle()
    {
        // 1. RELANCE CANDIDATS (Echéance approche : < 6 heures)
        $nearOffers = MissionOffers::whereNull('accepted_at')
            ->whereNull('declined_at')
            ->whereNull('candidate_reminded_at')
            ->whereBetween('expires_at', [now(), now()->addHours(6)])
            ->whereHas('application.candidat.user')
            ->with('application.candidat.user')
            ->get();

        foreach ($nearOffers as $offer) {
            // Notifier le candidat (Mail + In-app)
            $offer->application->candidat->user->notify(new CandidateReminderNotification($offer));
            $offer->update(['candidate_reminded_at' => now()]);
        }

        // 2. RELANCE ENTREPRISE (offres expirées sans réponse dans les dernières 24 h)
        $expiredOffers = MissionOffers::whereNull('accepted_at')
            ->whereNull('declined_at')
            ->whereNull('company_reminded_at')
            ->whereBetween('expires_at', [now()->subDay(), now()])
            ->with('application')
            ->get()
            ->groupBy('application.mission_id'); // On groupe par mission pour ne pas spammer l'entreprise

        foreach ($expiredOffers as $missionId => $offers) {
            $mission = Mission::with('entreprise.user')->find($missionId);

            if ($mission?->entreprise?->user) {
                // Notifier l'entreprise que X candidats n'ont pas répondu
                $mission->entreprise->user->notify(new CompanyReminderNotification($mission, $offers->count()));
            }

            MissionOffers::whereKey($offers->modelKeys())->update(['company_reminded_at' => now()]);
        }

        $this->info("Relances : {$nearOffers->count()} candidat(s), {$expiredOffers->count()} mission(s).");
    }
}
