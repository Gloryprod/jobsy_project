<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Email de vérification envoyé']);
})->middleware(['auth:sanctum'])->name('verification.send');

Route::get('/auth/verify-email/{id}/{hash}', function ($id, $hash, Request $request) {
    $user = User::find($id);

    if (!$user) {
        return response()->json(['message' => 'Utilisateur introuvable'], 404);
    }

    if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Le lien de vérification est invalide.'], 403);
    }

    // Mark email as verified
    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }

    return redirect(env('FRONTEND_URL') . '/email-verified');
})->middleware('signed')->name('verification.verify');


Route::post('/auth/resend-verification', function (Request $request) {
    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found.'], 404);
    }

    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified.'], 400);
    }

    $user->sendEmailVerificationNotification();
    return response()->json(['message' => 'Verification link resent!']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();

    return $user;
});

// Route::middleware(['auth:sanctum', 'role:ADMIN'])->group(function() {
//     Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
// });

// Route::middleware(['auth:sanctum', 'role:JEUNE'])->group(function() {
//     Route::get('/jeune/missions', [MissionController::class, 'index']);
//     Route::post('/jeune/missions/apply', [MissionController::class, 'apply']);
// });

// Route::middleware(['auth:sanctum', 'role:ENTREPRISE'])->group(function() {
//     Route::post('/entreprise/annonces', [EntrepriseController::class, 'store']);
//     Route::get('/entreprise/jeunes', [EntrepriseController::class, 'listJeunes']);
// });