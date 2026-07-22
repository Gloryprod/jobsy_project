<?php

namespace App\Http\Controllers\Entreprise;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\MissionOffers;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use App\Services\WalletService;

class DashboardController extends Controller
{
   public function index(Request $request)
   {
        // 1. Récupération de l'entreprise authentifiée
        $entreprise = $request->user()->entreprise;

        if (!$entreprise) {
            return apiResponse(null, 'Aucune entreprise associée à cet utilisateur', 'error', 404);
        }

        // 2. Récupération des KPI (Statistiques rapides) en optimisant les requêtes (via count)
        // Au lieu de charger tous les modèles avec ->get(), on fait un ->count() beaucoup plus léger pour la RAM
        $stats = [
            'open_jobs_count'        => $entreprise->missions()->whereNull('closed_at')->where('active', true)->count(),
            'deactivated_jobs_count' => $entreprise->missions()->whereNull('closed_at')->where('active', false)->count(),
            'closed_jobs_count'      => $entreprise->missions()->whereNotNull('closed_at')->count(),
            'active_offers_count'    => MissionOffers::whereHas('application.mission', function ($query) use ($entreprise) {
                                            $query->where('entreprise_id', $entreprise->id);
                                        })
                                        ->whereIn('status', ['in_progress', 'completed'])
                                        ->count(),
            'wallet_balance'         => $entreprise->wallet ? $entreprise->wallet->balance : ($entreprise->balance ?? 0),
            'balance_locked'         => $entreprise->wallet ? $entreprise->wallet->balance_locked : 0,
        ];

        // 3. Candidatures à chaud (Sans offre envoyée)
        // Eager loading de candidat.user et de la mission pour éviter le problème N+1 en React
        $candidaturesAChaud = Application::whereHas('mission', function ($query) use ($entreprise) {
                $query->where('entreprise_id', $entreprise->id);
            })
            ->whereDoesntHave('mission_offers')
            ->with(['candidat.user', 'mission'])
            ->latest() // Les plus récentes en premier
            ->get();

        // 4. Missions terminées prêtes à être réouvertes (Dupliquées)
        $missionsTerminees = $entreprise->missions()
            ->whereHas('applications.mission_offers', function ($query) {
                $query->where('status', 'completed');
            })
            ->withCount('applications')
            ->latest()
            ->get();

        // 5. Envoi groupé de TOUTES les données à React
        return apiResponse(
            [
                'stats'                => $stats,
                'candidatures_a_chaud' => $candidaturesAChaud,
                'missions_terminees'   => $missionsTerminees
            ],
            'Données du dashboard récupérées avec succès',
            'success'
        );
    }

    public function transactionsHistory(Request $request)
    {
        $entreprise = $request->user()->entreprise;

        $wallet = $entreprise   ->wallet;


        $transactions = $wallet->transactions()
            ->latest()
            ->take(5) // Limite à 100 transactions pour éviter de surcharger la réponse, on peut faire de la pagination plus tard si besoin
            ->get(); // Système de pagination propre

        return apiResponse(
            $transactions,
            'Historique des transactions récupéré',
            'success'
        );
    }
}
