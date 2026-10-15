<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        // Les 50 plus récentes : la liste complète grossit sans limite
        $notifications = $request->user()->notifications()->latest()->limit(50)->get();

        return apiResponse(
            $notifications,
            'Notifications récupérées avec succès',
            'success',
            200
        );
    }

    public function unread(Request $request)
    {
        // Requête fraîche (pas la relation chargée en mémoire, qui peut être périmée)
        $unreadNotifications = $request->user()->unreadNotifications()->latest()->limit(50)->get();

        return apiResponse(
            $unreadNotifications,
            'Notifications non lues récupérées avec succès',
            'success',
            200
        );
    }

    public function markAsRead(Request $request)
    {
        // Une seule requête UPDATE, quel que soit le nombre de notifications
        $request->user()->unreadNotifications()->update(['read_at' => now()]);

        return apiResponse(
            null,
            'Toutes les notifications ont été marquées comme lues',
            'success',
            200
        );
    }
}
