<?php

use App\Http\Controllers\ProposalResponseController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Routes publiques signées pour traiter la réponse du candidat.
// Le lien de l'email (GET) n'affiche qu'une page de confirmation : les filtres de messagerie ouvrent
// automatiquement les liens. La réponse n'est enregistrée qu'au clic (POST, même URL signée, protégé par CSRF).
Route::get('/proposals/{proposal}/accept', [ProposalResponseController::class, 'confirmAccept'])
    ->name('proposals.accept')
    ->middleware('signed');

Route::post('/proposals/{proposal}/accept', [ProposalResponseController::class, 'accept'])
    ->name('proposals.accept.store')
    ->middleware('signed');

Route::get('/proposals/{proposal}/decline', [ProposalResponseController::class, 'confirmDecline'])
    ->name('proposals.decline')
    ->middleware('signed');

Route::post('/proposals/{proposal}/decline', [ProposalResponseController::class, 'decline'])
    ->name('proposals.decline.store')
    ->middleware('signed');
