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

function identifyRankCode($title) {
    if (str_contains($title, 'doctorat') || str_contains($title, 'phd')) return 'S';
    if (str_contains($title, 'master') || str_contains($title, 'maitrise') || str_contains($title, 'ingénieur')) return 'A';
    if (str_contains($title, 'licence') || str_contains($title, 'bachelor') || str_contains($title, 'bac + 3')) return 'B';
    if (str_contains($title, 'bts') || str_contains($title, 'dut')) return 'C';
    if (str_contains($title, 'bac') || str_contains($title, 'baccalaureat')) return 'D';
    
    return 'E'; // Par défaut
}
