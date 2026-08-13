<?php

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Models\CategoryKeyword;
use App\Models\Skills;
use App\Models\Candidat;
use App\Models\Course;
use App\Mail\ExamCertifiedMail;
use App\Mail\ExamFailedMail;

if (!function_exists('apiResponse')) {
    function apiResponse($data = null, $message = null, $status = 'success', $code = 200)
    {
        return response()->json([
            'status' => $status,
            'message' => $message,
            'data' => $data
        ], $code);
    }
}

function deleteFile(?string $path)
{
    if ($path && Storage::disk('public')->exists($path)) {
        Storage::disk('public')->delete($path);
    }
}

function identifyRankCode($title) {
    if (str_contains($title, 'doctorat') || str_contains($title, 'phd')) return 'S';
    if (str_contains($title, 'master') || str_contains($title, 'maitrise') || str_contains($title, 'ingénieur')) return 'A';
    if (str_contains($title, 'licence') || str_contains($title, 'bachelor') || str_contains($title, 'bac + 3')) return 'B';
    if (str_contains($title, 'bts') || str_contains($title, 'dut')) return 'C';
    if (str_contains($title, 'bac') || str_contains($title, 'baccalaureat')) return 'D';
    
    return 'E'; // Par défaut
}

function getCategoryIdFromText(string $text): ?int
{
    $text = Str::lower($text);

    // On récupère les mots-clés du plus long au plus court pour la précision
    $keywords = CategoryKeyword::orderByRaw('LENGTH(keyword) DESC')->get();

    foreach ($keywords as $item) {
        if (Str::contains($text, Str::lower($item->keyword))) {
            return $item->category_id;
        }
    }

    return 11; // À ranger dans "Divers" si aucun match
}

function processSkillsFromIA(Candidat $candidat, array $skillsIA)
{
    foreach ($skillsIA as $skillName) {
        $cleanName = trim($skillName);

        $categoryId = getCategoryIdFromText($cleanName);

        $skill = Skills::firstOrCreate(
            ['name' => $cleanName],
            ['category_id' => $categoryId ] // "Divers" si non trouvé
        );

        // 4. Lier le candidat à ce skill dans la table pivot
        $candidat->skills()->syncWithoutDetaching([$skill->id]);
    }
}

/**
 * Envoie l'email adéquat au candidat (Succès ou Échec)
 */
function sendResultEmail(bool $isPassed, int $globalScore, Candidat $candidat, Course $course, ?string $certificateHash): void
{
    try {
        // Récupération de l'email candidat
        $recipientEmail = $candidat->user->email ?? $candidat->email ?? null;

        if (!$recipientEmail) {
            Log::warning("Envoi de mail impossible : aucun email trouvé pour le candidat #{$candidat->id}");
            return;
        }

        if ($isPassed) {
            Mail::to($recipientEmail)->queue(
                new ExamCertifiedMail($candidat, $course, $certificateHash, $globalScore)
            );
        } else {
            Mail::to($recipientEmail)->queue(
                new ExamFailedMail($candidat, $course, $globalScore)
            );
        }
    } catch (\Throwable $e) {
        Log::error("Erreur lors de l'envoi de l'email d'examen (#{$course->id}) : " . $e->getMessage());
    }
}
