<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthServices;

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
        $request->user()->tokens()->delete();

        return apiResponse(
            null,
            'Déconnexion réussie'
        );
    }
}
