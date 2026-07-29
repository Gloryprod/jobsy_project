<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Enrollment; 
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Str;

class CertificateVerificationController extends Controller
{
    public function verify(string $hash)
    {
        // On cherche l'inscription qui possède ce hash unique
        // On charge en même temps les relations candidat (avec l'user pour le nom/prénom) et le cours
        $enrollment = Enrollment::with(['candidat.user', 'course'])
            ->where('certificate_hash', $hash)
            ->where('status', 'certified')
            ->first();

        if (!$enrollment) {
            return response()->json([
                'status' => 'invalid',
                'message' => 'Ce certificat n\'existe pas ou est invalide.'
            ], 404);
        }

        // Si trouvé, on renvoie les détails officiels à afficher sur la page publique
        return response()->json([
            'status' => 'valid',
            'message' => 'Certificat authentique vérifié avec succès.',
            'data' => [
                'recipient_name' => $enrollment->candidat->user->prenom . ' ' . $enrollment->candidat->user->nom,
                'course_title' => $enrollment->course->title,
                'course_id' => $enrollment->course->id,
                'certified_at' => $enrollment->certified_at->format('d/m/Y'),
                'certificate_hash' => $enrollment->certificate_hash,
                // Tu pourras ajouter plus tard le lien de téléchargement du PDF ici
            ]
        ]);
    }


    public function downloadCertificate(Request $request, Int $courseId, String $hash)
    {
        // 1. Récupérer l'inscription certifiée avec les relations pour le nom et le titre du cours
         $enrollment = Enrollment::with(['candidat.user', 'course'])
            ->where('certificate_hash', $hash)
            ->where('status', 'certified')
            ->firstorFail();

        // 2. Préparer les données pour le template HTML
        $data = [
            'name' => $enrollment->candidat->user->prenom . ' ' . $enrollment->candidat->user->nom,
            'courseTitle' => $enrollment->course->title,
            'date' => $enrollment->certified_at ? $enrollment->certified_at->format('d/m/Y') : now()->format('d/m/Y'),
            'hash' => $enrollment->certificate_hash
        ];

        // 3. Charger la vue HTML et forcer le format A4 en Paysage (landscape)
        $pdf = Pdf::loadView('pdfs.certificate_pdf', $data)
                ->setPaper('a4', 'landscape');

        // 4. Télécharger le fichier directement
        $fileName = 'Certificat_Jobsy_' . Str::slug($enrollment->course->title) . '.pdf';
        return $pdf->download($fileName);
    }
}
