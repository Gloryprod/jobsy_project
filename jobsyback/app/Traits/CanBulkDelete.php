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

        $this->bulkDeleteQuery()->whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Éléments supprimés']);
    }

    abstract protected function model();

    /**
     * Requête de base des éléments supprimables. À surcharger pour limiter au propriétaire.
     */
    protected function bulkDeleteQuery()
    {
        return $this->model()->newQuery();
    }
}
