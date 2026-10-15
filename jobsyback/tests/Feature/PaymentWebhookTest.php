<?php

namespace Tests\Feature;

use App\Models\{Entreprise, Mission, PaymentIntent, Transaction, Wallet};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * C1 — un webhook KkiaPay ne crédite que le montant attendu, une seule fois, après vérification auprès de KkiaPay.
 */
class PaymentWebhookTest extends TestCase
{
    use RefreshDatabase;

    private Entreprise $entreprise;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.kkiapay.webhook_secret' => null]);
        $this->entreprise = Entreprise::factory()->create();
    }

    public function test_le_montant_credite_est_celui_de_lintention_et_le_rejeu_est_sans_effet(): void
    {
        $intent = $this->intent(5000);
        $this->fakeKkiapay(['TX-1' => ['status' => 'SUCCESS', 'amount' => 5000]]);

        // Montant falsifié dans le corps du webhook : ignoré
        $payload = $this->payload('TX-1', $intent, amount: 10000000);

        $this->postJson('/api/webhooks/kkiapay/deposits', $payload)->assertOk();
        $this->postJson('/api/webhooks/kkiapay/deposits', $payload)->assertOk(); // rejeu
        $this->postJson('/api/webhooks/kkiapay', $payload)->assertOk();          // rejeu sur l'autre route

        $wallet = Wallet::where('entreprise_id', $this->entreprise->id)->first();
        $this->assertEquals(5000, $wallet->balance);
        $this->assertSame(1, Transaction::where('type', 'deposit')->count());
        $this->assertSame('paid', $intent->fresh()->status);
    }

    public function test_un_paiement_non_confirme_par_kkiapay_ne_credite_rien(): void
    {
        $intent = $this->intent(5000);
        $this->fakeKkiapay([
            'TX-FAILED' => ['status' => 'FAILED', 'amount' => 5000],
            'TX-SHORT' => ['status' => 'SUCCESS', 'amount' => 100], // payé 100 F pour une intention de 5 000 F
        ]);

        // Ancien contournement « sandbox » : isPaymentSucces dans le corps ne suffit plus
        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-FAILED', $intent) + ['isPaymentSucces' => true])->assertOk();
        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-SHORT', $intent))->assertOk();
        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-UNKNOWN', $intent))->assertOk(); // API : 404

        $this->assertSame(0, Transaction::count());
        $this->assertSame('pending', $intent->fresh()->status);
    }

    public function test_une_transaction_ne_peut_pas_payer_deux_intentions(): void
    {
        $first = $this->intent(5000);
        $second = $this->intent(5000);
        $this->fakeKkiapay(['TX-1' => ['status' => 'SUCCESS', 'amount' => 5000]]);

        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-1', $first))->assertOk();
        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-1', $second))->assertOk();

        $this->assertSame('paid', $first->fresh()->status);
        $this->assertSame('pending', $second->fresh()->status);
        $this->assertEquals(5000, Wallet::where('entreprise_id', $this->entreprise->id)->value('balance'));
    }

    public function test_la_transaction_d_un_tiers_ne_peut_pas_etre_rattachee_a_sa_propre_intention(): void
    {
        $mine = $this->intent(5000);
        // KkiaPay indique que cette transaction a été payée pour une autre intention
        $this->fakeKkiapay(['TX-AUTRUI' => ['status' => 'SUCCESS', 'amount' => 5000, 'state' => json_encode(['intent' => 'intention-de-la-victime'])]]);

        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-AUTRUI', $mine))->assertOk();

        $this->assertSame('pending', $mine->fresh()->status);
        $this->assertSame(0, Transaction::count());
    }

    public function test_webhook_sans_intention_ou_inconnue_est_ignore(): void
    {
        $this->fakeKkiapay(['TX-1' => ['status' => 'SUCCESS', 'amount' => 5000]]);

        // Ancien format : entreprise_id dans stateData, sans intention créée par le serveur
        $this->postJson('/api/webhooks/kkiapay', [
            'transactionId' => 'TX-1',
            'amount' => 5000,
            'stateData' => json_encode(['entreprise_id' => $this->entreprise->id]),
        ])->assertOk();

        $this->postJson('/api/webhooks/kkiapay', [
            'transactionId' => 'TX-1',
            'stateData' => json_encode(['intent' => '00000000-0000-0000-0000-000000000000']),
        ])->assertOk();

        $this->assertSame(0, Transaction::count());
    }

    public function test_secret_de_webhook_verifie_quand_il_est_configure(): void
    {
        config(['services.kkiapay.webhook_secret' => 'hash-secret']);
        $intent = $this->intent(5000);
        $this->fakeKkiapay(['TX-1' => ['status' => 'SUCCESS', 'amount' => 5000]]);

        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-1', $intent), ['x-kkiapay-secret' => 'faux'])
            ->assertStatus(401);
        $this->assertSame(0, Transaction::count());

        $this->postJson('/api/webhooks/kkiapay', $this->payload('TX-1', $intent), ['x-kkiapay-secret' => 'hash-secret'])
            ->assertOk();
        $this->assertSame('paid', $intent->fresh()->status);
    }

    public function test_financement_de_mission_credite_puis_sequestre_la_recompense(): void
    {
        $mission = Mission::factory()->create(['entreprise_id' => $this->entreprise->id, 'reward' => 15000]);
        $offer = $this->makeOffer($mission);
        $this->fakeKkiapay(['TX-M' => ['status' => 'SUCCESS', 'amount' => 15000]]);

        $intentUuid = $this->withHeaders($this->bearerFor($this->entreprise->user))
            ->postJson('/api/entreprise/payments/initiate-kkiapay', ['offer_id' => $offer->id, 'amount' => 1])
            ->assertOk()
            ->assertJsonPath('amount', 15000) // montant imposé par le serveur, pas par le client
            ->json('intent');

        $this->postJson('/api/webhooks/kkiapay', [
            'transactionId' => 'TX-M',
            'stateData' => json_encode(['intent' => $intentUuid]),
        ])->assertOk();

        $wallet = Wallet::where('entreprise_id', $this->entreprise->id)->first();
        $this->assertEquals(15000, $wallet->balance);
        $this->assertEquals(15000, $wallet->balance_locked);
        $this->assertSame('locked', $offer->fresh()->payment_status);
    }

    private function intent(int $amount): PaymentIntent
    {
        return PaymentIntent::create([
            'entreprise_id' => $this->entreprise->id,
            'purpose' => PaymentIntent::PURPOSE_WALLET_TOPUP,
            'amount' => $amount,
        ]);
    }

    private function payload(string $transactionId, PaymentIntent $intent, int $amount = 5000): array
    {
        return [
            'transactionId' => $transactionId,
            'isPaymentSucces' => true,
            'amount' => $amount,
            'event' => 'transaction.success',
            'stateData' => json_encode(['intent' => $intent->uuid]),
        ];
    }

    /**
     * Simule l'API de vérification KkiaPay : transactionId => réponse ; 404 pour une transaction inconnue.
     */
    private function fakeKkiapay(array $transactions): void
    {
        Http::fake(function (HttpRequest $request) use ($transactions) {
            if (!str_ends_with($request->url(), '/api/v1/transactions/status')) {
                return Http::response([], 404);
            }

            $tx = $transactions[$request['transactionId']] ?? null;

            return $tx ? Http::response($tx + ['transactionId' => $request['transactionId']]) : Http::response(['status' => 'NOT_FOUND'], 404);
        });
    }
}
