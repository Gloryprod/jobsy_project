<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Erreur métier sur un mouvement d'argent (solde insuffisant, séquestre absent, ...).
 * Le message est destiné à l'utilisateur.
 */
class WalletException extends RuntimeException
{
}
