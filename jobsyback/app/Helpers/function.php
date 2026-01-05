<?php

use Illuminate\Support\Facades\Storage;

if (!function_exists('apiResponse')) {
    function apiResponse($data = null, $message = null, $status = 'success', $code = 200)
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $code);
    }
}

function deleteFile(?string $path)
{
    if ($path && Storage::disk('public')->exists($path)) {
        Storage::disk('public')->delete($path);
    }
}
