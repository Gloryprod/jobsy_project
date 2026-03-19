<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Candidat;

class ApplicantController extends Controller
{
    public function showProfile(Request $request, $id) {
        $candidat = Candidat::with(['rank', 'skills.category', 'user', 'cv_datas', 'diplomes'])->find($id);

        if (!$candidat) {
            return apiResponse(null, 'Candidat non trouvé', 'error', 404);
        }

        return apiResponse($candidat, 'Candidat récupéré avec succès', 'success', 200);
    }
}
