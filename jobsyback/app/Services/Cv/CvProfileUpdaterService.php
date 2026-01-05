<?php

namespace App\Services\Cv;

use App\Models\Candidat;

class CvProfileUpdaterService
{
    public function update(Candidat $candidat, array $data): void
    {
        // Contact
        if (!empty($data['email']) || !empty($data['telephone'])) {
            $candidat->contact()->updateOrCreate(
                [],
                [
                    'email_secondaire' => $data['email'],
                    'telephone' => $data['telephone'],
                ]
            );
        }

        // Diplômes
        foreach ($data['diplomes'] ?? [] as $diplome) {
            $candidat->diplomes()->firstOrCreate([
                'nom' => $diplome,
            ]);
        }
    }
}
