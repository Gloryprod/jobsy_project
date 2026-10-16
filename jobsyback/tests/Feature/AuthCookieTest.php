<?php

namespace Tests\Feature;

use App\Models\User;
use App\Support\AuthCookies;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

/**
 * C2 (partie 2) — les tokens circulent en cookies httpOnly, jamais dans le corps des réponses.
 */
class AuthCookieTest extends TestCase
{
    use RefreshDatabase;

    private const XHR = ['X-Requested-With' => 'XMLHttpRequest'];

    public function test_la_connexion_pose_des_cookies_httponly_et_ne_renvoie_aucun_token(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);

        $response = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])->assertOk();

        $this->assertArrayNotHasKey('accessToken', $response->json('data'));
        $this->assertArrayNotHasKey('refreshToken', $response->json('data'));
        $this->assertSame($user->id, $response->json('data.user.id'));

        $access = $response->getCookie(AuthCookies::ACCESS, false);
        $refresh = $response->getCookie(AuthCookies::REFRESH, false);
        $this->assertNotNull($access);
        $this->assertNotNull($refresh);
        $this->assertTrue($access->isHttpOnly());
        $this->assertTrue($refresh->isHttpOnly());
        $this->assertSame('strict', $access->getSameSite());
        $this->assertSame('/api/refresh', $refresh->getPath());
    }

    public function test_le_cookie_authentifie_les_requetes_xhr_du_front_uniquement(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);
        $access = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->getCookie(AuthCookies::ACCESS, false)->getValue();

        $this->app['auth']->forgetGuards();
        $this->withCredentials()->withUnencryptedCookie(AuthCookies::ACCESS, $access)
            ->getJson('/api/user', self::XHR)
            ->assertOk()
            ->assertJsonPath('id', $user->id);

        // Sans X-Requested-With (lien ou formulaire venu d'un autre site) : le cookie est ignoré
        $this->app['auth']->forgetGuards();
        $this->withCredentials()->withUnencryptedCookie(AuthCookies::ACCESS, $access)
            ->getJson('/api/user')
            ->assertStatus(401);
    }

    public function test_le_refresh_par_cookie_renouvelle_les_tokens_et_l_ancien_ne_sert_plus(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);
        $refresh = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->getCookie(AuthCookies::REFRESH, false)->getValue();

        $response = $this->withCredentials()->withUnencryptedCookie(AuthCookies::REFRESH, $refresh)
            ->postJson('/api/refresh', [], self::XHR)
            ->assertOk();

        $this->assertNotNull($response->getCookie(AuthCookies::ACCESS, false));
        $this->assertNotSame($refresh, $response->getCookie(AuthCookies::REFRESH, false)->getValue());
        $this->assertNull($response->json('data'));

        // Rotation : l'ancien refresh token est révoqué
        $this->withCredentials()->withUnencryptedCookie(AuthCookies::REFRESH, $refresh)
            ->postJson('/api/refresh', [], self::XHR)
            ->assertStatus(401);
    }

    public function test_un_refresh_token_ne_donne_pas_acces_a_l_api(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);
        $refresh = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->getCookie(AuthCookies::REFRESH, false)->getValue();

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/candidat/profile', ['Authorization' => 'Bearer ' . $refresh])->assertStatus(401);
        $this->assertSame('refresh', PersonalAccessToken::findToken($refresh)->type);
    }

    public function test_la_deconnexion_revoque_les_tokens_et_efface_les_cookies(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);
        $access = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'password'])
            ->getCookie(AuthCookies::ACCESS, false)->getValue();

        $this->app['auth']->forgetGuards();
        $response = $this->withCredentials()->withUnencryptedCookie(AuthCookies::ACCESS, $access)
            ->postJson('/api/logout', [], self::XHR)
            ->assertOk();

        $this->assertSame(0, PersonalAccessToken::count());
        $this->assertTrue($response->getCookie(AuthCookies::ACCESS, false)->isCleared());
        $this->assertTrue($response->getCookie(AuthCookies::REFRESH, false)->isCleared());
    }

    public function test_un_mauvais_mot_de_passe_ne_pose_aucun_cookie(): void
    {
        $user = User::factory()->create(['role' => 'JEUNE']);

        $response = $this->postJson('/api/login', ['email' => $user->email, 'password' => 'mauvais'])->assertStatus(401);

        $this->assertNull($response->getCookie(AuthCookies::ACCESS, false));
    }
}
