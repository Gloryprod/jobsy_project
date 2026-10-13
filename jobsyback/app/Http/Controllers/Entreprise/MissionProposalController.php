<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Http\Requests\MissionOffersRequest;
use App\Mail\MissionProposalMail;
use App\Models\Application;
use App\Models\Candidat;
use App\Models\Mission;
use App\Models\MissionOffers;
use App\Models\MissionProposal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use App\Notifications\CandidateSelectedNotification;

class MissionProposalController extends Controller
{
    public function sendProposalEmail(Request $request)
    {
        // 1. Validation des champs envoyés par le formulaire
        $validated = $request->validate([
            'candidat_id' => 'required|exists:candidats,id',
            'mission_id'  => 'required|exists:missions,id',
            'subject'     => 'required|string|max:255',
            'content'     => 'required|string|min:10',
        ]);

        $user = $request->user();
        
        // Récupérer l'entreprise liée à l'utilisateur connecté
        $entreprise = $user->entreprise ?? $user; 

        if (!$entreprise) {
            return response()->json([
                'success' => false,
                'message' => 'Profil entreprise non trouvé.'
            ], 403);
        }

        // 2. Vérifier si une proposition n'a pas déjà été envoyée pour cette mission et ce candidat
        $existingProposal = MissionProposal::where('mission_id', $validated['mission_id'])
            ->where('candidat_id', $validated['candidat_id'])
            ->first();

        if ($existingProposal) {
            return response()->json([
                'success' => false,
                'message' => 'Une proposition a déjà été envoyée à ce candidat pour cette mission.'
            ], 422);
        }

        // 3. Récupérer le candidat et la mission
        $candidat = Candidat::with('user')->findOrFail($validated['candidat_id']);
        $mission = Mission::findOrFail($validated['mission_id']);

        // Vérifier que l'adresse email du candidat existe
        $candidatEmail = $candidat->user->email;

        if (!$candidatEmail) {
            return response()->json([
                'success' => false,
                'message' => 'L\'adresse e-mail du candidat est introuvable.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 4. Enregistrement de la proposition en base de données
            $proposal = MissionProposal::create([
                'mission_id'    => $mission->id,
                'candidat_id'   => $candidat->id,
                'entreprise_id' => $entreprise->id,
                'subject'       => $validated['subject'],
                'message'       => $validated['content'],
                'status'        => 'pending',
                'sent_at'       => now(),
            ]);

            // 5. Envoi effectif du mail de proposition
            Mail::to($candidatEmail)->send(new MissionProposalMail($proposal));

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'La proposition de mission a été envoyée avec succès au candidat.',
                'data'    => $proposal
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Erreur lors de l'envoi de la proposition de mission : " . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'envoi de l\'email.'
            ], 500);
        }
    }

    /**
     * Récupère les propositions d'une mission avec la vérification de l'offre d'onboarding.
     * Route: GET /api/missions/{mission}/proposals
     */
    public function indexForMission(Request $request, Mission $mission): JsonResponse
    {
        // 1. Récupération de toutes les propositions pour cette mission avec leurs candidats
        $proposals = MissionProposal::where('mission_id', $mission->id)
            ->with([
                'candidat.user',
                'application.mission_offers' // Récupère l'offre d'onboarding liée à la candidature
            ])
            ->latest('sent_at')
            ->get();

        // 2. Formatage des données pour le composant React / Next.js
        $formattedProposals = $proposals->map(function ($proposal) {
            $application = $proposal->application;
            $offer = $application?->mission_offers; // Récupère l'offre d'onboarding liée à la candidature

            // Condition : Candidat lié à une candidature sur cette mission (source='invited') ET ayant une offre enregistrée
            $hasOnboarding = !is_null($offer);

            return [
                'id' => $proposal->id,
                'status' => $proposal->status, // pending, accepted, declined, expired
                'subject' => $proposal->subject,
                'message' => $proposal->message,
                'sent_at' => $proposal->sent_at?->toIso8601String(),
                'responded_at' => $proposal->responded_at?->toIso8601String(),

                // Informations du candidat
                'candidat' => [
                    'id' => $proposal->candidat->id ?? null,
                    'nom_complet' => trim(($proposal->candidat->user->prenom ?? '') . ' ' . ($proposal->candidat->user->nom ?? '')),
                    'email' => $proposal->candidat->user->email ?? null,
                    // 'avatar' => $proposal->candidat->photo_profil ?? null,
                    'titre' => $proposal->candidat->domaine_competence ?? null,
                    // 'telephone' => $proposal->candidat->telephone ?? null,
                ],

                // Identifiant de la candidature liée (utile si besoin de la passer à l'API d'onboarding)
                'application_id' => $application?->id,

                // Statut de la présence d'une offre d'onboarding
                'has_onboarding' => $hasOnboarding,

                // Données de l'offre d'onboarding issues de mission_offers
                'onboarding' => $hasOnboarding ? [
                    'id' => $offer->id,
                    'start_date' => $offer->start_date?->format('Y-m-d'),
                    'start_time' => $offer->start_time,
                    'place' => $offer->place,
                    'contact_person' => $offer->contact_person,
                    'instructions' => $offer->onboarding_instructions ?? $offer->instructions,
                    'expires_at' => $offer->expires_at?->format('Y-m-d'),
                    'declined_at' => $offer->declined_at?->format('Y-m-d'),
                    'status' => $offer->status ?? null,
                ] : null,
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $formattedProposals->count(),
            'data' => $formattedProposals
        ]);
    }

    /**
     * Valide l'offre et configure l'onboarding pour une proposition acceptée.
     * Route: POST /api/entreprise/proposals/{proposalId}/onboarding
     */
    public function storeOnboarding(MissionOffersRequest $request, MissionProposal $proposal, Application $application): JsonResponse
    {

        // Vérification du statut avant enregistrement
        if ($proposal->status !== 'accepted') {
            return response()->json([
                'success' => false,
                'message' => "Cette proposition ne peut pas être configurée car son statut n'est pas 'accepted'."
            ], 422);
        }

        // Ajout : vérifier que la mission liée appartient bien à l'entreprise connectée
        if ($application->mission->entreprise_id !== $request->user()->entreprise->id) {
            return apiResponse(null, 'Accès non autorisé à cette candidature.', 'error', 403);
        }
        
        $application->update(['status' => 'accepted']);

        $validated = $request->validated();
        $validated['application_id'] = $application->id;

        $offer = MissionOffers::where('application_id', $application->id)->first();

        if($offer){
            $offer->delete();
        }

        $mission_offers = MissionOffers::create($validated); 

        $application->candidat->user->notify(new CandidateSelectedNotification($mission_offers));

        return response()->json([
            'success' => true,
            'message' => "L'onboarding a été configuré avec succès.",
            'data' => $proposal
        ]);
    }
}