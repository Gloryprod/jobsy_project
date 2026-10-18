<?php

namespace App\Http\Controllers;

use App\Exceptions\WalletException;
use App\Mail\ContractSignedMail;
use App\Models\MissionOffers;
use App\Services\BadgeEvaluatorService;
use App\Services\RankService;
use App\Services\WalletService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class MissionTrackingController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }

    public function updateStatus(Request $request, int $id, BadgeEvaluatorService $badgeEvaluator)
    {
        $offer = MissionOffers::with(['application.mission'])->findOrFail($id);
        $user = $request->user();
        $nextStatus = $request->status;

        // 1. Déterminer les rôles
        $isCandidat = $user->candidat && $offer->application->candidat_id === $user->candidat->id;
        $isEntreprise = $user->entreprise && $offer->application->mission->entreprise_id === $user->entreprise->id;

        // 2. Vérification de sécurité de base
        if (!$isCandidat && !$isEntreprise) {
            return apiResponse(
                null,
                'Accès non autorisé',
                'error',
                403
            );
        }

        // 3. Validation des permissions par étape
        switch ($nextStatus) {
            case 'service_started':
                if (!$isCandidat || $offer->status !== 'accepted') abort(403, "Action impossible");
                $offer->update(['status' => 'service_started', 'notified_presence_at' => now()]);
                return apiResponse(
                    null,
                    'Mise à jour réussie',
                    'success',
                    200
                );
                break;
            
            case 'rejected_after_onboarding':
                if (!$isEntreprise || $offer->status !== 'service_started') abort(403);
                
                DB::transaction(function () use ($offer) {
                    $offer->update([
                        'status' => 'rejected_after_onboarding',
                        // 'closed_at' => now(), // On ferme le dossier
                        // 'rejection_reason' => 'Non retenu après entretien sur place'
                    ]);
                    // Mission annulée : si des fonds étaient déjà bloqués, ils redeviennent disponibles pour l'entreprise
                    $this->walletService->releaseEscrow($offer);
                });
                return apiResponse(
                    null,
                    'Mise à jour réussie',
                    'success',
                    200
                );
                break;

            case 'in_progress':
                if (!$isEntreprise || $offer->status !== 'service_started') abort(403, "Action impossible");

                $application = $offer->application;
                // Récupération sécurisée du booléen is_on_time depuis la requête
                $isOnTime = $request->boolean('is_on_time');
    
                // 1. Préparer les données
                $data = [
                    'entreprise_nom' => $application->mission->entreprise->nom_entreprise,
                    'candidat_nom'   => $application->candidat->user->nom . ' ' . $application->candidat->user->prenom,
                    'poste_titre'    => $application->mission->title,
                    'salaire'        => $application->mission->reward,
                    'date'           => now()->format('d/m/Y'),
                ];

                // 2. Générer le PDF
                $pdf = Pdf::loadView('pdfs.contrat', $data);
                
                // 2. Définir le nom du fichier
                $fileName = 'contrats/contrat_' . $application->id . '.pdf';

                // 3. Sauvegarder le contenu brut du PDF dans le disque 'public'
                Storage::disk('public')->put($fileName, $pdf->output());

                // 4. Récupérer le chemin pour l'enregistrer en base de données si besoin
                $path = $fileName;
                    
                $offer->update(['status' => 'in_progress', 'is_on_time' => $isOnTime, 'started_at' => now(), 'contract_path' => $path ]);

                // 5. Envoyer le mail (On verra le détail du Mail juste après)
                $emails = [
                    $application->candidat->user->email,
                    $application->mission->entreprise->user->email
                ];
                
                // En file d'attente : la réponse n'attend pas le serveur SMTP
                Mail::to($emails)->send(new ContractSignedMail($application, $path));
                
                return apiResponse(
                    null,
                    'Mission validée et en cours pour ce candidat. Le paiement de la mission est lancé.',
                    'success',
                    200
                );
                break;

            case 'work_finished':
                if (!$isCandidat || $offer->status !== 'in_progress') abort(403, "Action impossible");
                $offer->update(['status' => 'work_finished', 'finished_at' => now()]);
                return apiResponse(
                    null,
                    'Mise à jour réussie',
                    'success',
                    200
                );
                break;

            case 'validated':
                if (!$isEntreprise || $offer->status !== 'work_finished') abort(403, "Action impossible");
                $request->validate([
                    'rating' => 'nullable|integer|min:1|max:5',
                    'recruiter_review' => 'nullable|string|max:2000',
                ]);
                $rating = $request->input('rating', 4);
                $recruiterReview = $request->input('recruiter_review');
                $candidat = $offer->application->candidat;

                // Validation, points et paiement réussissent ou échouent ensemble
                try {
                    DB::transaction(function () use ($offer, $rating, $recruiterReview, $candidat) {
                        $offer->update(['status' => 'validated', 'rating' => $rating, 'recruiter_review' => $recruiterReview, 'validated_at' => now()]);
                        $candidat->increment('score', 250);
                        // Le rang suit l'expérience réelle : les 250 XP peuvent faire passer au rang supérieur
                        app(RankService::class)->syncRankWithScore($candidat);
                        $this->walletService->processFinalPayment($offer); // 10% de commission
                    });
                } catch (WalletException $e) {
                    return apiResponse(null, $e->getMessage(), 'error', 422);
                }
                // Les badges sont évalués par MissionOffersObserver lors du passage de validated_at
                return apiResponse(
                    null,
                    'Mission validée et paiement traité avec succès. Le candidat recevra bientôt son paiement net après déduction de la commission Jobsy.',
                    'success',
                    200
                );
                break;

            default:
                return apiResponse(
                    null,
                    'Statut invalide',
                    'error',
                    422
                );
        }
    }
}
