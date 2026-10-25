<?php

namespace App\Services;

use App\Exceptions\ProposalResponseException;
use App\Models\Application;
use App\Models\MissionProposal;
use App\Notifications\ProposalAcceptedNotification;
use Illuminate\Support\Facades\DB;

/**
 * Réponse d'un candidat à une proposition de mission, depuis le lien de l'e-mail ou depuis l'application.
 * La proposition est verrouillée pendant la réponse : un double clic ou deux onglets ne donnent qu'une réponse.
 */
class ProposalResponseService
{
    /**
     * Accepte la proposition et crée (ou met à jour) la candidature correspondante, au statut « accepted ».
     *
     * @throws ProposalResponseException 409 si la proposition a déjà une réponse, 410 si la mission est fermée
     */
    public function accept(MissionProposal $proposal): Application
    {
        [$proposition, $application] = DB::transaction(function () use ($proposal) {
            $proposition = MissionProposal::with('mission')->lockForUpdate()->findOrFail($proposal->id);
            $this->assertPending($proposition);

            // Une mission désactivée ou clôturée par l'entreprise ne prend plus personne (la date limite, elle,
            // ne s'applique pas : c'est une invitation directe de l'entreprise)
            $mission = $proposition->mission;
            if (!$mission || !$mission->active || $mission->closed_at) {
                throw new ProposalResponseException("Cette mission est fermée : l'invitation ne peut plus être acceptée.", 410);
            }

            $proposition->update(['status' => 'accepted', 'responded_at' => now()]);

            // Candidat invité : la candidature est acceptée d'emblée pour ouvrir la phase d'offre (onboarding)
            $application = Application::firstOrCreate(
                ['mission_id' => $proposition->mission_id, 'candidat_id' => $proposition->candidat_id],
                ['status' => 'accepted', 'source' => 'invited', 'completed_at' => now()],
            );

            if (!$application->wasRecentlyCreated && $application->status !== 'accepted') {
                $application->update(['status' => 'accepted', 'source' => 'invited']);
            }

            return [$proposition, $application];
        });

        // L'entreprise est prévenue une fois la réponse enregistrée
        $proposition->load(['mission', 'candidat.user', 'entreprise.user']);
        $destinataire = $proposition->entreprise->user ?? $proposition->entreprise;
        $destinataire?->notify(new ProposalAcceptedNotification($proposition, $application));

        return $application;
    }

    /**
     * @throws ProposalResponseException 409 si la proposition a déjà une réponse
     */
    public function decline(MissionProposal $proposal): MissionProposal
    {
        return DB::transaction(function () use ($proposal) {
            $proposition = MissionProposal::lockForUpdate()->findOrFail($proposal->id);
            $this->assertPending($proposition);

            $proposition->update(['status' => 'declined', 'responded_at' => now()]);

            return $proposition;
        });
    }

    private function assertPending(MissionProposal $proposition): void
    {
        if ($proposition->status !== 'pending') {
            throw new ProposalResponseException('Cette invitation a déjà reçu une réponse.', 409);
        }
    }
}
