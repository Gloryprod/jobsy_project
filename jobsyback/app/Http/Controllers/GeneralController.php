<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Rank;
use App\Models\Candidat;

class GeneralController extends Controller
{
    public function getFilterData()
    {
        return apiResponse(
            $data = [
                'categories' => Category::all(['id', 'name', 'color']),
                'ranks' => Rank::orderBy('points', 'desc')->get(['id', 'rank', 'label', 'code_hexa']),
            ],
            'success',
            200
        );
    }

    public function filter(Request $request)
    {
        $query = Candidat::query();

        $query->when($request->category_ids, function($q, $ids) {
            $q->whereHas('skills', function($sq) use ($ids) {
                $sq->whereIn('category_id', (array)$ids);
            });
        });

        $query->when($request->category_id, function($q, $id) {
            $q->whereHas('skills', function($sq) use ($id) {
                $sq->where('category_id', $id);
            });
        });

        $query->when($request->rank_id, function($q, $rankId) {
            $q->where('rank_id', $rankId);
        });

        // On charge les relations et on pagine
        $results = $query->with(['skills.category', 'rank', 'user'])->paginate(15);

        return apiResponse($results, 'success', 200);
    }
}
