<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\MissionProposal;
use App\Notifications\ProposalAcceptedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProposalResponseController extends Controller
{
    /**
     * Traite l'acceptation de la proposition par le candidat via lien signé.
     */
    public function accept(Request $request, MissionProposal $proposal)
    {
        // 1. Vérification de la validité de la signature de l'URL
        if (!$request->hasValidSignature()) {
            return response()->view('proposals.response_status', [
                'type' => 'error',
                'title' => 'Lien expiré ou invalide',
                'message' => 'Ce lien de confirmation n\'est plus valide ou a déjà expiré.'
            ], 401);
        }

        // 2. Si la proposition a déjà été traitée
        if ($proposal->status !== 'pending') {
            return response()->view('proposals.response_status', [
                'type' => 'info',
                'title' => 'Proposition déjà traitée',
                'message' => 'Vous avez déjà ' . ($proposal->status === 'accepted' ? 'accepté' : 'décliné') . ' cette proposition de mission.',
                'status' => $proposal->status
            ]);
        }

        DB::beginTransaction();
        try {
            // 3. Mise à jour de la proposition
            $proposal->update([
                'status' => 'accepted',
                'responded_at' => now(),
            ]);

            // 4. Création ou récupération de la candidature dans la table `applications`
            // Les champs de test/score restent NULL car il s'agit d'un candidat suggéré/invité
            $application = Application::firstOrCreate([
                'mission_id'  => $proposal->mission_id,
                'candidat_id' => $proposal->candidat_id,
            ], [
                'status'       => 'accepted', // Statut accepté directement pour permettre la phase d'offre/onboarding
                'source'       => 'invited',  // Défini par la migration précédente
                'completed_at' => now(),
            ]);

            // Si la candidature existait déjà (ex: en draft), on met à jour son statut et sa source
            if (!$application->wasRecentlyCreated && $application->status !== 'accepted') {$application->update([
                    'status' => 'accepted',
                    'source' => 'invited',
                ]);
            }

            $proposal->load(['mission', 'candidat.user', 'entreprise.user']);

            // 6. Notification de l'entreprise
            // Récupère le destinataire (l'utilisateur lié à l'entreprise ou l'entreprise directement)
            $entrepriseUser = $proposal->entreprise->user ?? $proposal->entreprise;

            if ($entrepriseUser) {$entrepriseUser->notify(new ProposalAcceptedNotification($proposal,$application));
            }

            DB::commit();

            return response()->view('proposals.response_status', [
                'type'     => 'success',
                'title'    => 'Proposition acceptée !',
                'message'  => 'Merci ! Votre intérêt a été transmis à l\'entreprise. Celle-ci prendra contact avec vous ou préparera l\'offre de mission avec les détails d\'onboarding.',
                'proposal' => $proposal->load(['mission', 'entreprise']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de l'acceptation de la proposition {$proposal->id} : " . $e->getMessage());

            return response()->view('proposals.response_status', [
                'type'    => 'error',
                'title'   => 'Une erreur est survenue',
                'message' => 'Impossible de valider votre réponse pour le moment. Veuillez réessayer ultérieurement.'
            ], 500);
        }
    }

    /**
     * Traite le refus de la proposition par le candidat via lien signé.
     */
    public function decline(Request $request, MissionProposal $proposal)
    {
        if (! $request->hasValidSignature()) {
            return response()->view('proposals.response_status', [
                'type' => 'error',
                'title' => 'Lien expiré ou invalide',
                'message' => 'Ce lien de confirmation n\'est plus valide ou a déjà expiré.'
            ], 401);
        }

        if ($proposal->status !== 'pending') {
            return response()->view('proposals.response_status', [
                'type' => 'info',
                'title' => 'Proposition déjà traitée',
                'message' => 'Vous avez déjà ' . ($proposal->status === 'accepted' ? 'accepté' : 'décliné') . ' cette proposition de mission.',
                'status' => $proposal->status
            ]);
        }

        $proposal->update([
            'status' => 'declined',
            'responded_at' => now(),
        ]);

        return response()->view('proposals.response_status', [
            'type'     => 'decline',
            'title'    => 'Proposition déclinée',
            'message'  => 'Votre réponse a bien été prise en compte. L\'entreprise en a été informée.',
            'proposal' => $proposal->load(['mission', 'entreprise']),
        ]);
    }
}