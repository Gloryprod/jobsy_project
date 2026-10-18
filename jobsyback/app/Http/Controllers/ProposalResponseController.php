<?php

namespace App\Http\Controllers;

use App\Exceptions\ProposalResponseException;
use App\Models\MissionProposal;
use App\Services\ProposalResponseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProposalResponseController extends Controller
{
    /**
     * Lien « Accepter » de l'email : page de confirmation, sans effet tant que le candidat n'a pas cliqué.
     */
    public function confirmAccept(Request $request, MissionProposal $proposal)
    {
        return $this->confirmation($request, $proposal, 'success', 'Accepter cette proposition ?', "Confirmez pour transmettre votre intérêt à l'entreprise.", 'Oui, j\'accepte la proposition');
    }

    /**
     * Lien « Décliner » de l'email : page de confirmation, sans effet tant que le candidat n'a pas cliqué.
     */
    public function confirmDecline(Request $request, MissionProposal $proposal)
    {
        return $this->confirmation($request, $proposal, 'decline', 'Décliner cette proposition ?', "Confirmez pour indiquer à l'entreprise que vous n'êtes pas disponible : elle verra votre réponse dans le suivi de ses propositions.", 'Oui, je décline');
    }

    private function confirmation(Request $request, MissionProposal $proposal, string $type, string $title, string $message, string $label)
    {
        if ($proposal->status !== 'pending') {
            return response()->view('proposals.response_status', [
                'type' => 'info',
                'title' => 'Proposition déjà traitée',
                'message' => 'Vous avez déjà ' . ($proposal->status === 'accepted' ? 'accepté' : 'décliné') . ' cette proposition de mission.',
                'status' => $proposal->status
            ]);
        }

        return response()->view('proposals.response_status', [
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'proposal' => $proposal->load(['mission', 'entreprise']),
            // Même URL signée, envoyée en POST par le bouton
            'confirmAction' => $request->fullUrl(),
            'confirmLabel' => $label,
        ]);
    }

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

        // 3. Réponse enregistrée sous verrou (une seule réponse possible), candidature créée, entreprise prévenue
        try {
            app(ProposalResponseService::class)->accept($proposal);

            return response()->view('proposals.response_status', [
                'type'     => 'success',
                'title'    => 'Proposition acceptée !',
                'message'  => 'Merci ! Votre intérêt a été transmis à l\'entreprise. Celle-ci prendra contact avec vous ou préparera l\'offre de mission avec les détails d\'onboarding.',
                'proposal' => $proposal->fresh(['mission', 'entreprise']),
            ]);

        } catch (ProposalResponseException $e) {
            return response()->view('proposals.response_status', [
                'type'    => 'info',
                'title'   => 'Réponse impossible',
                'message' => $e->getMessage(),
            ], $e->status);

        } catch (\Exception $e) {
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

        try {
            app(ProposalResponseService::class)->decline($proposal);
        } catch (ProposalResponseException $e) {
            return response()->view('proposals.response_status', [
                'type'    => 'info',
                'title'   => 'Réponse impossible',
                'message' => $e->getMessage(),
            ], $e->status);
        }

        return response()->view('proposals.response_status', [
            'type'     => 'decline',
            'title'    => 'Proposition déclinée',
            // Aucune notification n'est envoyée : l'entreprise voit la réponse dans le suivi de ses propositions
            'message'  => 'Votre réponse a bien été prise en compte. L\'entreprise la verra dans le suivi de ses propositions.',
            'proposal' => $proposal->fresh(['mission', 'entreprise']),
        ]);
    }
}