<?php

use App\Http\Controllers\ProposalResponseController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Routes publiques signées pour traiter la réponse du candidat
Route::get('/proposals/{proposal}/accept', [ProposalResponseController::class, 'accept'])
    ->name('proposals.accept')
    ->middleware('signed');

Route::get('/proposals/{proposal}/decline', [ProposalResponseController::class, 'decline'])
    ->name('proposals.decline')
    ->middleware('signed');
