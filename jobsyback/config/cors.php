<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS)
    |--------------------------------------------------------------------------
    |
    | Le front envoie les cookies d'authentification (withCredentials) : les origines doivent être listées
    | explicitement (pas de « * »). CORS_ALLOWED_ORIGINS accepte plusieurs URL séparées par des virgules ;
    | vide ou absent, FRONTEND_URL (« ?: » et non un défaut d'env() : la ligne vide du .env.example vaut "").
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter(array_map('trim', explode(',', (string) (env('CORS_ALLOWED_ORIGINS') ?: env('FRONTEND_URL', 'http://localhost:3000')))))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // L'en-tête X-Requested-With (protection CSRF) déclenche une requête de vérification avant chaque appel :
    // le navigateur garde sa réponse 2 heures (plafond de Chrome) au lieu de la redemander à chaque fois
    'max_age' => 7200,

    'supports_credentials' => true,

];
