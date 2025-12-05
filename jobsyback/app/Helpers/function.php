<?php

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
