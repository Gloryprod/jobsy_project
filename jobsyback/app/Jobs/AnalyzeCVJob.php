<?php

namespace App\Jobs;

use App\Models\Candidat;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Services\Cv\CVParserService;
use Illuminate\Support\Facades\Log;
use App\Models\CvDatas;

class AnalyzeCVJob implements ShouldQueue
{
    use Queueable;

    protected string $filePath;
    protected int $userId;

    public function __construct($filePath, $userId)
    {
        $this->filePath = $filePath;
        $this->userId = $userId;
    }

    public function handle(CVParserService $nlpService): void
    {
        $fullPath = storage_path("app/public/$this->filePath");
        $text = "";

        // --- ÉTAPE 1 : Tentative rapide avec Smalot ---
        try {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($fullPath);
            $text = $pdf->getText();
        } catch (\Exception $e) {
            Log::warning("Smalot a échoué, passage à l'outil système.");
        }

        // --- ÉTAPE 2 : Si Smalot a renvoyé du vide ou très peu de texte ---
        // (Moins de 100 caractères pour un CV, c'est suspect)
        if (strlen(trim($text)) < 100) {
            $exePath = 'C:\xpdf\bin64\pdftotext.exe'; // Chemin vers votre nouveau fichier
            
            if (file_exists($exePath)) {
                $cmd = '"' . $exePath . '" ' . escapeshellarg($fullPath) . ' -';
                $text = shell_exec($cmd);
                Log::info("Extraction via pdftotext.exe effectuée.");
            }
        }

        // --- ÉTAPE 3 : Vérification finale et IA ---
        if (strlen(trim($text)) < 10) {
            Log::error("Impossible d'extraire du texte lisible pour l'user {$this->userId}");
            return;
        }

        // On nettoie le texte avant de l'envoyer à Groq
        $cleanText = iconv("UTF-8", "UTF-8//IGNORE", $text);
        
        $structuredData = $nlpService->parse($cleanText);

        if (!empty($structuredData)) {
            Log::info('CV ANALYZED SUCCESS', ['user' => $this->userId, 'type' => gettype($structuredData), 'data' => $structuredData]);


            $user = Candidat::find($this->userId);
            if ($user && is_array($structuredData)) {
                CvDatas::updateOrCreate(
                    ['candidat_id' => $this->userId],
                    [
                        'candidate_name' => $structuredData['Name'] ?? null,
                        'skills'         => $structuredData['Skills'] ?? [],
                        'education'      => $structuredData['Education'] ?? [],
                        'raw_ai_data'    => $structuredData
                    ]
                );
            }

            Log::info('INFORMATION SAVED', ['user' => $this->userId, 'data' => $structuredData]);
            
        }
    }
}