<?php

use App\Http\Controllers\Admin\ApplicantController;
use App\Http\Controllers\Admin\CompanyController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Candidat\CandidatController;
use App\Http\Controllers\Candidat\DiplomeController;
use App\Http\Controllers\Candidat\FormationController;
use App\Http\Controllers\Auth\RefreshTokenController;
use App\Http\Controllers\Candidat\CandidatureController;
use App\Http\Controllers\Candidat\ProfileController;
use App\Http\Controllers\Entreprise\EntrepriseController;
use App\Http\Controllers\GeneralController;
use App\Http\Controllers\Candidat\MissionsController as CandidatMissionController;
use App\Http\Controllers\Entreprise\MissionController as EntrepriseMissionController;
use App\Http\Controllers\NotificationController;
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

Route::middleware('auth:sanctum', 'access.token')->get('/user', [AuthController::class, 'userProfile']);

Route::middleware(['auth:sanctum' , 'access.token'])->group(function() {
    Route::get('/getFilterData', [GeneralController::class, 'getFilterData']);
    Route::get('/filter', [GeneralController::class, 'filter']);
});

Route::middleware(['auth:sanctum', 'role:JEUNE', 'access.token'])->group(function() {
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

    Route::get('/liste_missions', [CandidatMissionController::class, 'index']); 
    Route::get('/show/{id}', [CandidatMissionController::class, 'show']); 
    Route::post('/start_application/{candidat_id}/{mission_id}', [CandidatureController::class, 'apply_job']);
    Route::post('/applications/{applicationId}/submit-step-one', [CandidatureController::class, 'submit_step_one']);
    Route::post('/applications/{applicationId}/finalize', [CandidatureController::class, 'finalize_assessment']);
    Route::get('/missions/{candidat}/myapplications', [CandidatureController::class, 'getApplications']);

    Route::post('/candidat/update/password', [CandidatController::class, 'updatePassword']);

    Route::get('/candidat/mission-offers/{id}', [CandidatMissionController::class, 'getMissionOffers']);
    Route::post('/candidat/mission-offers/{id}/respond', [CandidatMissionController::class, 'respond']);

    Route::get('/candidat/notifications', [NotificationController::class, 'index']);
    Route::patch('/candidat/notifications/mark-as-read', [NotificationController::class, 'markAsRead']);

    Route::get('/candidat/notifications/unread', [NotificationController::class, 'unread']);

});

Route::middleware(['auth:sanctum', 'role:ENTREPRISE', 'access.token'])->group(function() {
    Route::get('/entreprise/contact', [EntrepriseController::class, 'index']);
    Route::post('/entreprise/infos/{id}', [EntrepriseController::class, 'update']);
    Route::post('/entreprise/contact/{id}', [EntrepriseController::class, 'updateContact']);
    Route::get('/showProfileCandidat/{id}', [CandidatController::class, 'showProfile']);
    Route::post('/missions/bulk-delete', [EntrepriseMissionController::class, 'bulkDelete']);
    Route::get('/missions/deactivate/{mission}', [EntrepriseMissionController::class, 'deactivate']);
    Route::get('/missions/close/{mission}', [EntrepriseMissionController::class, 'close']);
    Route::get('/missions/{mission}/applications', [EntrepriseMissionController::class, 'getApplications']);
    Route::post('/entreprise/update/password', [EntrepriseController::class, 'updatePassword']);
    Route::post('/entreprise/applications/{applicationId}/select', [EntrepriseMissionController::class, 'selectApplicants']);
    Route::get('/missions/closed', [EntrepriseMissionController::class, 'getclosedJobs']);
    Route::resource('/missions', EntrepriseMissionController::class);

});

Route::middleware(['auth:sanctum', 'role:ADMIN', 'access.token'])->group(function() {
    Route::get('/infoProfileCandidat/{id}', [ApplicantController::class, 'showProfile']);
    Route::get('/entreprises', [CompanyController::class, 'index']);
    Route::get('/entreprises/{id}/missions', [CompanyController::class, 'getMissionsEntreprise']);
});