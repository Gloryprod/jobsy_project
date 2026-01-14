<?php

namespace App\Services\Cv;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CVParserService
{
    protected string $apiKey;
    protected string $apiUrl;
    protected string $content;

    public function __construct()
    {
        $this->apiKey = config('services.nlp.key');
        $this->apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        $this->content = 'You are an expert recruitment assistant specializing in data extraction. Your task is to parse the provided text and extract specific professional information into a structured JSON format.

        ### Instructions:
        1. **Name**: Extract the full name of the person.
        2. **Title**: Identify a professional title or "quality" based on the context. If no clear title is found or implied, leave this field as an empty string ("").
        3. **Skills**: Extract all technical and soft skills as an array of strings.
        4. **Education (Degrees)**: ONLY include formal academic degrees (Bac, BTS, Licence, Master, PhD/Doctorat, etc.). 
        5. **OtherCertifications**: Extract non-degree training, professional certifications, workshops, or short-term courses.
        6. **Experiences**: Extract professional experiences (JobTitle, Company, Duration, Description).

        ### Constraints:
        - Return ONLY valid JSON.
        - Ensure a clear distinction between formal degrees and short-term certifications.
        - If a section is missing in the text, return an empty array [].

        ### Expected JSON Structure:
        {
        "Name": "Full Name",
        "Title": "Professional Title",
        "Skills": ["Skill 1", "Skill 2"],
        "Education": [
            {
            "Degree": "Degree name (Formal)",
            "Institution": "University/School",
            "Duration": "Period"
            }
        ],
        "OtherCertifications": [
            {
            "CourseName": "Training or Certification name",
            "Provider": "Organization",
            "Date": "Year or Period"
            }
        ],
        "Experiences": [
            {
            "JobTitle": "Position",
            "Company": "Company",
            "Duration": "Period",
            "Description": "Tasks"
            }
        ]
        }';
    }

    public function parse(string $rawText): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->apiUrl, [
                    'model' => 'llama-3.3-70b-versatile', // Modèle ultra performant et gratuit
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => $this->content
                        ],
                        [
                            'role' => 'user',
                            'content' => "Extract from this CV: " . mb_substr($rawText, 0, 4000)
                        ]
                    ],
                    'response_format' => ['type' => 'json_object'] // Force la sortie en JSON
                ]);

            if ($response->failed()) {
                Log::error("Erreur Groq : " . $response->body());
                return [];
            }

            $data = $response->json();
            // Récupération du contenu JSON généré
            $content = $data['choices'][0]['message']['content'] ?? '{}';

            return json_decode($content, true);

        } catch (\Exception $e) {
            Log::error("Échec Groq : " . $e->getMessage());
            return [];
        }
    }
}