<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Enrollment;
use Carbon\Carbon;

class CourseValidationController extends Controller
{
    public function validateStep(Request $request, Int $enrollmentId)
    {

        $enrollment = Enrollment::findOrFail($enrollmentId);

        if($request->action == "approve"){
            $enrollment->update([
                'delivery_status' => "delivered",
                // 'logistic_validated_at' => Carbon::now(),
                // 'logistic_validated_by' => $request->user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logistique validée avec succès. Les modules théoriques sont désormais accessibles pour ce candidat !',
                'data' => $enrollment
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => $enrollment
        ]);
    }

    public function logisticEnrollment(){
        $enrollments = Enrollment::where('status', "waiting_kit")
        ->with('candidat.user','candidat.contact','course')
        ->get();

        return response()->json([
            'success' => true,
            'data' => $enrollments
        ]);
    }
}
