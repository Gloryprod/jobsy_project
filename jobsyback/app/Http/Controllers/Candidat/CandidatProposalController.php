<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
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
}
