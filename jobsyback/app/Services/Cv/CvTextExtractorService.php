<?php

namespace App\Services\Cv;

use Smalot\PdfParser\Parser;

class CvTextExtractorService
{
    public function extract(string $filePath): ?string
    {
        $extension = pathinfo($filePath, PATHINFO_EXTENSION);

        if ($extension === 'pdf') {
            $parser = new Parser();
            $pdf = $parser->parseFile($filePath);
            return $pdf->getText();
        }

        // ⚠️ image (OCR) → phase suivante
        return null;
    }
}
