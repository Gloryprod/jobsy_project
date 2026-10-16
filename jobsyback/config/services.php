<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'nlp' => [
        'key' => env('NLP_SERVICE_KEY'),
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
    ],

    'kkiapay' => [
        'secret_key' => env('KKIAPAY_SECRET_KEY'),
        'public_key' => env('KKIAPAY_PUBLIC_KEY'),
        'private_key' => env('KKIAPAY_PRIVATE_KEY'),
        'sandbox' => (bool) env('KKIAPAY_SANDBOX', false),
        // Racine de l'API, sans /api/v1 (ex : https://api.kkiapay.me ou https://api-sandbox.kkiapay.me)
        'api_url' => env('KKIAPAY_API_URL', env('KKIAPAY_SANDBOX', false) ? 'https://api-sandbox.kkiapay.me' : 'https://api.kkiapay.me'),
        // « Hash secret » défini dans le tableau de bord Kkiapay, renvoyé dans l'en-tête x-kkiapay-secret
        'webhook_secret' => env('KKIAPAY_WEBHOOK_SECRET'),
        // Endpoint de virement Mobile Money (à confirmer avec Kkiapay)
        'payout_url' => env('KKIAPAY_PAYOUT_URL', 'https://api.kkiapay.me/api/v1/payout'),
    ],

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    // Extraction de texte des CV scannés quand smalot/pdfparser échoue (facultatif)
    'pdftotext' => [
        'path' => env('PDFTOTEXT_PATH'),
    ],

];
