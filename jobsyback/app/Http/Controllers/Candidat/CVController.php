<?php

namespace App\Http\Controllers\Candidat;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CVController extends Controller
{
    public function index(Request $request)
    {
        $candidat = $request->user()->candidat;

        return apiResponse(
            $candidat->cv()->latest()->get(),
            'Liste des formations',
            'success',
            200
        );
    }
}
