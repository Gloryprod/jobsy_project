<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use Illuminate\Http\Request;

class PublicMissionController extends Controller
{
    public function index(Request $request){
        // return "DEBUG";
        $missions = Mission::where('active', true)
        ->whereNull('closed_at')
        ->orderBy('created_at', 'desc')
        ->with('entreprise')
        ->limit(9)
        ->get();

        return apiResponse(
            $missions,
            'Missions récupérées avec succès',
            'success',
            200
        );
    }
}
