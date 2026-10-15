<?php

namespace App\Http\Controllers\Entreprise;

use App\Exceptions\WalletException;
use App\Http\Controllers\Controller;
use App\Models\MissionOffers;
use App\Models\PaymentIntent;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Services\WalletService;

class PaymentController extends Controller
{
    /**
     * Financement d'une mission par KkiaPay (solde insuffisant).
     * Le montant est la récompense de la mission ; le widget ne transporte que l'uuid de l'intention.
     */
    public function initiateKkiaPay(Request $request)
    {
        $request->validate([
            'offer_id' => 'required|integer|exists:mission_offers,id',
        ]);

        $entreprise = $request->user()->entreprise;
        $offer = $this->ownedOffer($request, (int) $request->offer_id);

        $this->walletFor($entreprise->id);
        Wallet::firstOrCreate(
            ['candidat_id' => $offer->application->candidat_id],
            ['balance' => 0, 'balance_locked' => 0, 'currency' => 'XOF']
        );

        $intent = PaymentIntent::create([
            'entreprise_id' => $entreprise->id,
            'mission_offer_id' => $offer->id,
            'purpose' => PaymentIntent::PURPOSE_MISSION_FUNDING,
            'amount' => (int) round($offer->application->mission->reward),
        ]);

        return response()->json($this->widgetConfig($intent) + [
            'message' => "Fonds insuffisants, veuillez procéder à un dépôt.",
        ]);
    }

    public function initiateDeposit(Request $request)
    {
        $request->validate([
            'amount' => 'required|integer|min:100|max:10000000',
        ]);

        $entreprise = $request->user()->entreprise;
        $this->walletFor($entreprise->id);

        $intent = PaymentIntent::create([
            'entreprise_id' => $entreprise->id,
            'purpose' => PaymentIntent::PURPOSE_WALLET_TOPUP,
            'amount' => (int) $request->amount,
        ]);

        return apiResponse($this->widgetConfig($intent), 'Dépôt initialisé', 'success');
    }

    /**
     * Bloque la récompense de la mission depuis le solde disponible de l'entreprise.
     * Un éventuel « amount » envoyé par le client est ignoré.
     */
    public function lockFunds(Request $request, WalletService $walletService)
    {
        $request->validate([
            'offerId' => 'required|integer|exists:mission_offers,id',
        ]);

        $offer = $this->ownedOffer($request, (int) $request->offerId);
        $entrepriseWallet = Wallet::where('entreprise_id', $request->user()->entreprise->id)->firstOrFail();

        try {
            $walletService->lockFundsForMission($entrepriseWallet, $offer);
            return apiResponse(null, 'Fonds bloqués sur le compte du candidat avec succès', 'success');
        } catch (WalletException $e) {
            return apiResponse(null, $e->getMessage(), 'error', 400);
        }
    }

    private function ownedOffer(Request $request, int $offerId): MissionOffers
    {
        $offer = MissionOffers::with('application.mission')->findOrFail($offerId);

        abort_unless(
            (int) $offer->application->mission->entreprise_id === (int) $request->user()->entreprise->id,
            403,
            'Accès non autorisé à cette offre.'
        );

        return $offer;
    }

    private function walletFor(int $entrepriseId): Wallet
    {
        return Wallet::firstOrCreate(
            ['entreprise_id' => $entrepriseId],
            ['balance' => 0, 'balance_locked' => 0, 'currency' => 'XOF']
        );
    }

    /**
     * Paramètres d'ouverture du widget KkiaPay côté front.
     */
    private function widgetConfig(PaymentIntent $intent): array
    {
        return [
            'intent' => $intent->uuid,
            'amount' => $intent->amount,
            'public_key' => config('services.kkiapay.public_key'),
            'sandbox' => (bool) config('services.kkiapay.sandbox'),
            'entreprise_id' => $intent->entreprise_id,
        ];
    }
}
