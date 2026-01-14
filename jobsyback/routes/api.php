<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\Candidat\CandidatController;
use App\Http\Controllers\Candidat\DiplomeController;
use App\Http\Controllers\Candidat\FormationController;
use App\Http\Controllers\Auth\RefreshTokenController;
use App\Http\Controllers\Candidat\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\User;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [RefreshTokenController::class, 'refresh']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum', 'access.token');

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

Route::middleware('auth:sanctum', 'access.token')->get('/user', function (Request $request) {
    $user = $request->user();
    return $user;
});

Route::middleware(['auth:sanctum', 'access.token', 'role:JEUNE'])->group(function() {
    Route::get('/candidat/profile', [CandidatController::class, 'candidatProfile']);
    Route::get('/candidat/diplomes', [DiplomeController::class, 'index']);
    Route::get('/candidat/formations', [FormationController::class, 'index']);

    Route::post('/update/info', [CandidatController::class, 'updateInfo']);
    Route::post('/update/contact', [CandidatController::class, 'updateContact']);
    Route::post('/candidat/diplome', [CandidatController::class, 'createDiplome']);
    Route::post('/candidat/formation', [CandidatController::class, 'createFormation']);
    Route::post('/candidat/cv', [CandidatController::class, 'saveCv']);
    Route::post('/candidat/concours', [CandidatController::class, 'saveConcours']);
    Route::post('/candidat/communaute', [CandidatController::class, 'saveCommunaute']);

    Route::patch('/candidat/diplomes/{id}', [DiplomeController::class, 'update']);
    Route::patch('/formations/{formation}', [FormationController::class, 'update']);

    Route::delete('/candidat/cv', [CandidatController::class, 'deleteCv']);
    Route::delete('/candidat/diplomes/{id}', [CandidatController::class, 'deleteDiplome']);
    Route::delete('/candidat/formations/{id}', [CandidatController::class, 'deleteFormation']);
    Route::delete('/candidat/concours/{id}', [CandidatController::class, 'deleteConcours']);
    Route::delete('/candidat/communautes/{id}', [CandidatController::class, 'deleteCommunaute']);

    Route::get('/candidat/profile-elements', [ProfileController::class, 'setProfileElements']);
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