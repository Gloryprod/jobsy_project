<?php
    
    namespace App\Listeners;
    
    use App\Events\CvUploaded;
    use App\Models\Cv;
    use App\Services\Cv\CvTextExtractorService;
    use App\Services\Cv\CvParserService;
    use App\Services\Cv\CvProfileUpdaterService;
    use Illuminate\Contracts\Queue\ShouldQueue;
    use Illuminate\Queue\InteractsWithQueue;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Facades\Storage;


    class ProcessUploadedCv implements ShouldQueue
    {
        /**
         * Create the event listener.
         */
        public function __construct()
        {
            //
        }

        /**
         * Handle the event.
         */
        use InteractsWithQueue;

        public function handle(CvUploaded $event): void
        {
            Log::info('ProcessUploadedCv lancé', [
                'cv_id' => $event->cvId
            ]);

            $cv = Cv::with('candidat')->find($event->cvId);

            if (!$cv) {
                Log::error('CvUploaded event reçu sans CV');
                return;
            }

            $candidat = $cv->candidat;

            try {
                // 1️⃣ Récupération du fichier
                $filePath = Storage::disk('public')->path($cv->fichier);

                // 2️⃣ Extraction du texte
                $text = app(CvTextExtractorService::class)
                    ->extract($filePath);

                Log::info('CV TEXT EXTRACTED', [
                    'cv_id' => $cv->id,
                    'text_length' => strlen($text),
                    'text_preview_start' => substr($text, 0, 1000),
                    'text_preview_middle' => substr($text, intval(strlen($text)/2), 1000),
                    'text_preview_end' => substr($text, -1000),
                ]);

                if (!$text) {
                    Log::warning('Impossible d’extraire le texte du CV', [
                        'cv_id' => $cv->id,
                    ]);
                    return;
                }

                // 3️⃣ Analyse du contenu
                $parsedData = app(CvParserService::class)
                    ->parse($text);

                Log::info('CV PARSED DATA', $parsedData);

                // 4️⃣ Mise à jour du profil
                // app(CvProfileUpdaterService::class)
                //     ->update($candidat, $parsedData);

            } catch (\Throwable $e) {
                Log::error('Erreur traitement CV', [
                    'cv_id' => $cv->id,
                    'message' => $e->getMessage(),
                ]);
            }
        }

    }
