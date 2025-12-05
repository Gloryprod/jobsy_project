<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\AuthenticationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class Handler extends ExceptionHandler
{
    public function report(Throwable $exception)
    {
        parent::report($exception);
    }

    public function render($request, Throwable $exception)
    {
        if ($request->is('api/*')) {
            $status = 500;
            $message = $exception->getMessage();

            if ($exception instanceof ValidationException) {
                $status = 422;
                $message = $exception->errors();
            } elseif ($exception instanceof AuthenticationException) {
                $status = 401;
                $message = 'Non authentifié';
            } elseif ($exception instanceof NotFoundHttpException) {
                $status = 404;
                $message = 'Ressource non trouvée';
            }

            return response()->json([
                'status' => 'error',
                'message' => $message,
            ], $status);
        }

        return parent::render($request, $exception);
    }
}
