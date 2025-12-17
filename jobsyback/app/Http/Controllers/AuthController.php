<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\PasswordResetRequest;
use App\Services\AuthServices;
use Illuminate\Auth\Events\Registered;     
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;  
use Illuminate\Support\Facades\Hash;


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

        $token = $user->createToken('jobsy-token')->plainTextToken;


        return apiResponse(
            [
                'token' => $token,
                'user' => $user
            ],
            'Connexion réussie'
        );
    }
    
    public function logout(Request $request)
    {
        $request->user()?->tokens()?->delete();

        return apiResponse(
            null,
            'Déconnexion réussie'
        );
    }

    public function forgotPassword(Request $request){
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
        ? apiResponse(
            null,
            'Lien de réinitialisation envoyé par email.'
        )
        : apiResponse(
            null,
            'Impossible d’envoyer le lien.',
            400
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

}
