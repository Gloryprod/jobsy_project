<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Réponse impossible à une proposition de mission : déjà répondue (409) ou mission fermée (410).
 */
class ProposalResponseException extends RuntimeException
{
    public function __construct(string $message, public readonly int $status)
    {
        parent::__construct($message);
    }
}
