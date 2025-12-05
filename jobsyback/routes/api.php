<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Route::middleware(['auth:sanctum', 'role:JEUNE'])->group(function () {
//     Route::get('/missions', [MissionController::class, 'index']);
//     Route::post('/missions/apply', [MissionController::class, 'apply']);
// });

// Route::middleware(['auth:sanctum', 'role:ENTREPRISE'])->group(function () {
//     Route::post('/annonces', [AnnonceController::class, 'store']);
//     Route::get('/jeunes', [EntrepriseController::class, 'listJeunes']);
// });