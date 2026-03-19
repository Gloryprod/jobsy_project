<?php

namespace App\Traits;

use Illuminate\Http\Request;

trait CanBulkDelete
{
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:' . $this->model()->getTable() . ',id',
        ]);

        $this->model()->whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Éléments supprimés']);
    }

    abstract protected function model();
}
