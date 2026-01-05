<?php

namespace App\Services\Cv;

class CvParserService
{
    private array $diplomaRank = [
        'phd' => 5,
        'doctorat' => 5,
        'master' => 4,
        'msc' => 4,
        'licence' => 3,
        'bachelor' => 3,
        'bts' => 2,
        'dut' => 2,
        'cap' => 1,
        'bepc' => 1,
        'cep' => 0,
    ];

    public function parse(string $text): array
    {
        $text = $this->normalize($text);

        $title = $this->extractTitle($text);
        $diplomas = $this->extractDiplomas($text);
        $lastDiploma = $this->getLastDiploma($diplomas);

        return [
            'title' => $title,
            'last_diploma' => $lastDiploma,
            'all_diplomas' => $diplomas,
        ];
    }

    private function normalize(string $text): string
    {
        $text = strtolower($text);
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    private function extractTitle(string $text): ?string
    {
        $lines = preg_split('/[\r\n]+/', $text);

        $keywords = [
            'développeur', 'developer', 'ingénieur',
            'data', 'analyste', 'designer',
            'étudiant', 'fullstack', 'backend', 'frontend'
        ];

        foreach (array_slice($lines, 0, 15) as $line) {
            foreach ($keywords as $keyword) {
                if (str_contains($line, $keyword)) {
                    return ucfirst(trim($line));
                }
            }
        }

        return null;
    }

    private function extractDiplomas(string $text): array
    {
        $patterns = [
            '/(licence|bachelor)[^\.]{0,80}/i',
            '/(master|msc)[^\.]{0,80}/i',
            '/(doctorat|phd)[^\.]{0,80}/i',
            '/(dut|bts)[^\.]{0,80}/i',
        ];

        $diplomas = [];

        foreach ($patterns as $pattern) {
            if (preg_match_all($pattern, $text, $matches)) {
                foreach ($matches[0] as $match) {
                    $diplomas[] = trim($match);
                }
            }
        }

        return array_unique($diplomas);
    }

    private function getLastDiploma(array $diplomas): ?string
    {
        $best = null;
        $bestRank = -1;

        foreach ($diplomas as $diploma) {
            foreach ($this->diplomaRank as $key => $rank) {
                if (str_contains(strtolower($diploma), $key) && $rank > $bestRank) {
                    $best = $diploma;
                    $bestRank = $rank;
                }
            }
        }

        return $best;
    }
}
