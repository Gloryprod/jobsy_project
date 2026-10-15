<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Nettoie le HTML déjà enregistré avant l'ajout de sanitizeHtml() (XSS stocké).
     * Irréversible par nature : le HTML dangereux supprimé n'est pas restauré.
     */
    private array $columns = [
        'missions' => 'description',
        'mission_offers' => 'onboarding_instructions',
        'entreprises' => 'description',
        'courses' => 'description',
        'modules' => 'description',
        'exam_projects' => 'context_rich_text',
        'mission_proposals' => 'message',
    ];

    public function up(): void
    {
        foreach ($this->columns as $table => $column) {
            if (!Schema::hasTable($table) || !Schema::hasColumn($table, $column)) {
                continue;
            }

            DB::table($table)
                ->whereNotNull($column)
                ->select(['id', $column])
                ->chunkById(200, function ($rows) use ($table, $column) {
                    foreach ($rows as $row) {
                        $clean = sanitizeHtml($row->{$column});

                        if ($clean !== $row->{$column}) {
                            DB::table($table)->where('id', $row->id)->update([$column => $clean]);
                        }
                    }
                });
        }
    }

    public function down(): void
    {
        //
    }
};
