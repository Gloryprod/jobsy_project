<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->latest()->get();

        return apiResponse(
            $notifications,
            'Notifications récupérées avec succès',
            'success',
            200
        );
    }

    public function unread(Request $request)
    {
        $unreadNotifications = $request->user()->unreadNotifications;

        return apiResponse(
            $unreadNotifications,
            'Notifications non lues récupérées avec succès',
            'success',
            200
        );
    }

    public function markAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return apiResponse(
            null,
            'Toutes les notifications ont été marquées comme lues',
            'success',
            200
        );
    }
}
