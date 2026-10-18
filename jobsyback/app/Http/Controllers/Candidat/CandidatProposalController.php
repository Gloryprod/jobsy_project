<?php

namespace App\Http\Controllers\Candidat;

use App\Exceptions\ProposalResponseException;
use App\Http\Controllers\Controller;
use App\Services\ProposalResponseService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\MissionProposal;

class CandidatProposalController extends Controller
{
    /**
     * Récupère toutes les propositions de missions reçues par le candidat connecté.
     * Route: GET /api/candidat/proposals
     */
    public function index(Request $request): JsonResponse
    {
        // Récupère le candidat associé à l'utilisateur connecté
        $candidat = $request->user()->candidat;

        if (!$candidat) {
            return response()->json([
                'success' => false,
                'message' => 'Profil candidat introuvable.'
            ], 404);
        }

        // Récupère les propositions avec les relations mission et entreprise
        $proposals = MissionProposal::where('candidat_id', $candidat->id)
            ->with([
                'mission',
                'entreprise'
            ])
            ->latest('sent_at')
            ->get();

        // Formatage pour l'interface Next.js
        $formattedProposals = $proposals->map(function ($proposal) {
            return [
                'id' => $proposal->id,
                'mission_id' => $proposal->mission_id,
                'status' => $proposal->status, // pending, accepted, declined, expired
                'subject' => $proposal->subject,
                'message' => $proposal->message,
                'sent_at' => $proposal->sent_at?->toIso8601String(),
                'responded_at' => $proposal->responded_at?->toIso8601String(),
                
                // Infos de la mission
                'mission' => [
                    'id' => $proposal->mission->id ?? null,
                    'title' => $proposal->mission->title ?? 'Mission',
                    // Montant de la mission : la colonne s'appelle reward (budget n'existe pas et renvoyait toujours null)
                    'reward' => $proposal->mission->reward ?? null,
                    'location' => $proposal->mission->location ?? null,
                    'deadline' => $proposal->mission->deadline ?? null,
                    // Une mission désactivée ou clôturée refuse l'acceptation (ProposalResponseService) : le front le dit d'avance
                    'active' => (bool) ($proposal->mission->active ?? false),
                    'closed_at' => $proposal->mission->closed_at ?? null,
                ],

                // Infos de l'entreprise
                'entreprise' => [
                    'id' => $proposal->entreprise->id ?? null,
                    'nom_entreprise' => $proposal->entreprise->nom_entreprise ?? 'Entreprise Partenaire',
                    'logo' => $proposal->entreprise->logo ?? null,
                    'secteur_activite' => $proposal->entreprise->secteur_activite ?? null,
                ],
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $formattedProposals->count(),
            'data' => $formattedProposals
        ]);
    }

    /**
     * Le candidat accepte une proposition depuis l'application (même règle que le lien de l'e-mail).
     * Route: POST /api/candidat/proposals/{proposal}/accept
     */
    public function accept(Request $request, MissionProposal $proposal, ProposalResponseService $responses): JsonResponse
    {
        if (!$this->estAuCandidat($request, $proposal)) {
            return apiResponse(null, 'Accès non autorisé.', 'error', 403);
        }

        try {
            $responses->accept($proposal);
        } catch (ProposalResponseException $e) {
            return apiResponse(null, $e->getMessage(), 'error', $e->status);
        }

        return apiResponse(['id' => $proposal->id, 'status' => 'accepted'], "Invitation acceptée. L'entreprise va préparer l'offre de mission.", 'success', 200);
    }

    /**
     * Le candidat décline une proposition depuis l'application.
     * Route: POST /api/candidat/proposals/{proposal}/decline
     */
    public function decline(Request $request, MissionProposal $proposal, ProposalResponseService $responses): JsonResponse
    {
        if (!$this->estAuCandidat($request, $proposal)) {
            return apiResponse(null, 'Accès non autorisé.', 'error', 403);
        }

        try {
            $responses->decline($proposal);
        } catch (ProposalResponseException $e) {
            return apiResponse(null, $e->getMessage(), 'error', $e->status);
        }

        return apiResponse(['id' => $proposal->id, 'status' => 'declined'], 'Invitation déclinée.', 'success', 200);
    }

    /** Une proposition ne peut recevoir de réponse que du candidat à qui elle est adressée. */
    private function estAuCandidat(Request $request, MissionProposal $proposal): bool
    {
        $candidat = $request->user()->candidat;

        return $candidat && (int) $proposal->candidat_id === (int) $candidat->id;
    }
}
