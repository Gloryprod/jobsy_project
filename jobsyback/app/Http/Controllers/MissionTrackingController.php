<?php

namespace App\Http\Controllers;

use App\Mail\ContractSignedMail;
use App\Models\MissionOffers;
use App\Services\WalletService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class MissionTrackingController extends Controller
{
    protected WalletService $walletService;

    public function __construct(WalletService $walletService)
    {
        $this->walletService = $walletService;
    }
    public function updateStatus(Request $request, int $id)
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
                
                $offer->update([ 
                    'status' => 'rejected_after_onboarding',
                    // 'closed_at' => now(), // On ferme le dossier
                    // 'rejection_reason' => 'Non retenu après entretien sur place'
                ]);
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
                    
                $offer->update(['status' => 'in_progress', 'started_at' => now(), 'contract_path' => $path ]);

                // 5. Envoyer le mail (On verra le détail du Mail juste après)
                $emails = [
                    $application->candidat->user->email,
                    $application->mission->entreprise->user->email
                ];
                Mail::to($emails)->send(new ContractSignedMail($application, $pdf->output()));
                return apiResponse(
                    null,
                    'Mission validée et en cours pour ce candidat. Veuillez maintenant procéder au paiement de la mission.',
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
                $offer->update(['status' => 'validated', 'validated_at' => now()]);
                $candidat = $offer->application->candidat;
                $candidat->increment('score', 250);
                $this->walletService->processFinalPayment($offer, 0.10); // 10% de commission
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
