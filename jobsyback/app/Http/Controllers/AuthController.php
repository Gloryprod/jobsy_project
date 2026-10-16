<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PasswordResetRequest;
use App\Services\AuthServices;
use App\Support\AuthCookies;
use Illuminate\Auth\Events\Registered;     
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;  
use Illuminate\Support\Facades\Hash;                    
use App\Models\Entreprise; 


class AuthController extends Controller
{
    protected $authService;

    public function __construct(AuthServices $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request)
    {
        $user = $this->authService->register($request->validated());
        event(new Registered($user));

        return apiResponse(
            $user,
            'Inscription réussie',
            'success', 
            201
        );
    }

    public function login(LoginRequest $request)
    {
        $user = $this->authService->login($request->email, $request->password);

        if (!$user) {
            return apiResponse(
                null,
                'Identifiants invalides',
                'error',    
                401
            );
        }

        if (!$user->hasVerifiedEmail()) {
            return apiResponse(
                null,
                'Vous n\'avez pas encore confirmé votre compte. Veuillez vérifier votre email avant de vous connecter.',
                'error',
                403
            );
        }

        $user->tokens()->delete();

        // Access token (30 min) + refresh token (14 jours)
        $tokens = $this->authService->issueTokens($user);

        // Les tokens ne sont transmis qu'en cookies httpOnly : jamais dans le corps, jamais lisibles par JavaScript
        return apiResponse(
            [
                'user' => $user
            ],
            'Connexion réussie'
        )
            ->withCookie(AuthCookies::access($tokens['access']))
            ->withCookie(AuthCookies::refresh($tokens['refresh']));
    }

    public function logout(Request $request)
    {
        $request->user()?->tokens()?->delete();

        $response = apiResponse(
            null,
            'Déconnexion réussie'
        );

        foreach (AuthCookies::forget() as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }
 
    public function forgotPassword(Request $request){
        $request->validate(['email' => 'required|email']);

        Password::sendResetLink($request->only('email'));

        // Même réponse que le compte existe ou non : sinon ce formulaire permet de tester quels emails sont inscrits
        return apiResponse(
            null,
            'Si un compte est associé à cette adresse, un lien de réinitialisation vient d’être envoyé par email.'
        );
    }

    public function resetPassword(PasswordResetRequest $request){
        
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
        
                // optionnel : invalide les anciennes sessions
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return apiResponse(
            null,
            'Mot de passe réinitialisé avec succès.'
        );
    }

    public function userProfile(Request $request) {
        
        $user = $request->user();
        $user = $user->load('entreprise.contact_entreprise');
        $user = $user->load('candidat.rank', 'candidat.wallet');
        return $user;
    }

}
