<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Traits\CanBulkDelete;
use App\Models\Module;
use App\Http\Requests\ModuleRequest;

class ModuleController extends Controller
{
    use CanBulkDelete;

    protected function model() {
        return new Module();
    }

    public function show(Module $module){

        // return apiResponse(
        //     $module->with(['lessons', 'quiz_questions']),
        //     'Module récupéré avec succès',
        //     'success',
        //     200
        // );  
         
        return response()->json($module->load(['lessons', 'quiz_questions']));

    }

    public function destroy(Request $request, Module $module)
    {
        $module->delete();
        return apiResponse(
            null,
            'Module supprimé avec succès'
        );
    }

}
