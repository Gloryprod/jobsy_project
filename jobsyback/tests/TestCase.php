<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function bearerFor(\App\Models\User $user): array
    {
        $token = $user->createToken('test-access', ['*'], now()->addMinutes(30));
        $token->accessToken->type = 'access';
        $token->accessToken->save();

        return ['Authorization' => 'Bearer ' . $token->plainTextToken];
    }
}
