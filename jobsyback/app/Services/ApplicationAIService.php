<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Candidat;
use App\Models\Mission;
use Illuminate\Support\Facades\Http;
use Exception;

class ApplicationAIService
{
    protected string $apiKey ;

    public function __construct()
    {
        $this->apiKey = config('services.nlp.key');
    }

    /**
     * Génère les questions de l'Étape 1 : Motivation & Sérieux
     */
    public function generateMotivationQuestions(Candidat $candidat, Mission $mission)
    {        
        // On prépare le contexte du candidat
        $candidatStatus = ($candidat->rank->rank === 'E' || $candidat->rank->rank === 'D') ? "débutant / profil opérationnel" : "diplômé / profil expert (Rang {$candidat->rank->rank})";
        
        // On prépare le contexte de la mission
        $missionType = $mission->type_contrat === 'Mission Ponctuelle' ? "PONCTUELLE et immédiate" : "de longue durée ({$mission->type_contrat})";

        $prompt = "
        Tu es un expert en recrutement. Ta mission est de générer 3 questions d'entretien pour l'étape 'Motivation & Sérieux'.
        Pour les profils de Rang E ou D et missions ponctuelles, l'objectif principal est de vérifier la motivation, la capacité et la disponibilité du candidat.
        En général poses des questions simples et pas trop longues ce n'est pas un entretien technique.
        
        CONTEXTE MISSION :
        - Titre : {$mission->title}
        - Domaine : {$mission->category}
        - Type : {$missionType}
        - Description : {$mission->description}

        CONTEXTE CANDIDAT :
        - Profil : {$candidatStatus}

        CONSIGNES :
        1. Les questions doivent aider à déterminer si le candidat a bien compris les enjeux de ce poste ou mission spécifique.
        2. Si le candidat est de Rang E, pose des questions concrètes sur la fiabilité et la disponibilité.
        3. Si la mission est ponctuelle, demande comment il gère l'efficacité immédiate.
        4. Ajoute un 'context_hint' pour chaque question pour expliquer au candidat ce que l'on cherche à évaluer.

        FORMAT JSON ATTENDU :
        {
          'questions': [
            {
              'id': 1,
              'label': 'La question ici...',
              'context_hint': 'Le conseil ici...'
            }
          ]
        }";

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60) // On attend jusqu'à 60 secondes
                ->connectTimeout(10)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile', // ou gpt-3.5-turbo
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un recruteur virtuel qui répond uniquement en JSON.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'response_format' => ['type' => 'json_object']
                ]);

            return $response->json()['choices'][0]['message']['content'];
        } catch (Exception $e) {
            throw new Exception("Erreur lors de la génération des questions : " . $e->getMessage());
        }
    }

    public function generateTechnicalQuestions(Application $application)
    {
        $mission = $application->mission;
        $candidat = $application->candidat;
        $step1Answers = $application->assessment->step_1_data['responses'];
        $step1Questions = $application->assessment->step_1_data['questions'];

        $prompt = "
        ### RÔLE
        Tu es un expert métier senior en {$mission->category}. 
        Ton but est de valider les compétences techniques d'un candidat pour une mission précise.

        ### CONTEXTE DE LA MISSION
        - TITRE : {$mission->title}
        - DESCRIPTION : {$mission->description}
        - COMPÉTENCES CLÉS : " . implode(', ', $mission->skills) . "
        - NIVEAU REQUIS : {$candidat->rank->label}

        ### MISSION DE GÉNÉRATION
        Génère 3 questions techniques FLASH qui testent EXCLUSIVEMENT les points mentionnés dans la description et les compétences clés.

        ### RÈGLES DE PERTINENCE
        1. **Zéro théorie** : Ne demande pas de définitions. Pose des questions sur un geste métier, une norme ou une résolution de problème liée à '{$mission->title}'.
        2. **Analyse de l'étape 1** : Le candidat a dit : " . json_encode($step1Answers) . ". Si une compétence y est revendiquée, vérifie-la.
        3. **Format Court** : La question doit appeler une réponse de maximum 280 caractères.

        ### FORMAT JSON (STRICT)
        {
        'questions': [
            { 
            'id': 1, 
            'label': 'Question ultra-spécifique sur un point de la description', 
            'context_hint': 'Indice métier pour gagner du temps' 
            }
        ]
        }";

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60) // On attend jusqu'à 60 secondes
                ->connectTimeout(10)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile', // ou gpt-3.5-turbo
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un recruteur virtuel qui répond uniquement en JSON.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'response_format' => ['type' => 'json_object']
                ]);

            return $response->json()['choices'][0]['message']['content'];
        } catch (Exception $e) {
            throw new Exception("Erreur lors de la génération des questions 2: " . $e->getMessage());
        }
    }


    public function analyzeFullApplication(Application $application)
    {
        $mission = $application->mission;
        $step1 = $application->assessment->step_1_data;
        $step2 = $application->assessment->step_2_data;
        $candidat = $application->candidat;

        $prompt = "
        Tu es un recruteur expert. Analyse cet entretien complet :
        
        MISSION : {$mission->title}
        DESCRIPTION : {$mission->description}
        MOTIVATION (Step 1) : 
            -   Questions : " . json_encode($step1['questions'] ?? []) . " 
            -   Réponses : " . json_encode($step1['responses'] ?? []) . "
        TECHNIQUE (Step 2) : 
            -   Questions : " . json_encode($step2['questions'] ?? []) . " 
            -   Réponses : " . json_encode($step2['responses'] ?? []) . "

        ### ANALYSE DE CRÉDIBILITÉ
        Vérifie pour chaque réponse :
        1. **Sens critique** : La réponse a-t-elle un rapport avec la question ?
        2. **Qualité** : Est-ce du texte intelligible ou du remplissage aléatoire (ex: 'asdfgh', 'test', '...') ?
        3. **Expertise** : Le candidat utilise-t-il un vocabulaire minimum lié à {$mission->category} ?

        ### CONSIGNES DE NOTATION
        - Si les réponses n'ont aucun sens : Score = 0, Badge = 'REJECTED', Commentaire = 'Candidature non sérieuse (réponses incohérentes)'.
        - Si une réponse technique est fausse mais que la démarche est expliquée : Sois indulgent selon le rang {$candidat->rank->label}.
        - Si le candidat répond à côté de la plaque par manque de compétence (et non par manque de sérieux) : Attribue un score faible mais reste constructif.

        FORMAT JSON :
        {
            'score': 85,
            'badge': 'EXPERT',
            'summary': 'Résumé de 2 lignes pour le recruteur',
            'details': { 'points_forts': [], 'points_faibles': [] }
        }";

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60) // On attend jusqu'à 60 secondes
                ->connectTimeout(10)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile', // ou gpt-3.5-turbo
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un recruteur virtuel qui répond uniquement en JSON.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'response_format' => ['type' => 'json_object']
                ]);

            return $response->json()['choices'][0]['message']['content'];
        } catch (Exception $e) {
            throw new Exception("Erreur lors de l'analyse de la candidature: " . $e->getMessage());
        }
    }

    public function analyzeSimpleApplication(Application $application)
    {
        $mission = $application->mission;
        $step1 = $application->assessment->step_1_data;
        $candidat = $application->candidat;

        $prompt = "
        ### RÔLE
        Tu es un recruteur spécialisé dans les profils opérationnels et débutants (Rangs D et E). 
        Ton objectif est d'évaluer la motivation et le sérieux d'un candidat pour une mission qui ne requiert pas de test technique complexe.

        ### CONTEXTE DE LA MISSION
        - MISSION : {$mission->title}
        - DESCRIPTION : {$mission->description}
        - RANG DU CANDIDAT : {$candidat->rank->rank} ({$candidat->rank->label})

        ### DONNÉES À ANALYSER (Étape de Motivation)
        Questions posées :
        " . json_encode($step1['questions'] ?? []) . "
        Réponses du candidat :
        " . json_encode($step1['responses'] ?? []) . "

        ### CRITÈRES D'ÉVALUATION
        1. **Sérieux de la réponse** : Le candidat a-t-il fait l'effort de rédiger des phrases complètes ? Détecte le 'n'importe quoi' (ex: 'ok', '...', 'asdf').
        2. **Disponibilité & Ponctualité** : Les réponses montrent-elles une volonté d'être réactif et fiable ?
        3. **Adéquation** : Le candidat a-t-il compris la nature de la mission {$mission->title} ?
        4. **Zéro Technique** : Ne le juge pas sur des connaissances techniques pointues, mais sur sa capacité à suivre des instructions.

        ### RÈGLES DE BADGE & SCORE
        - **Score (0-100)** : Basé sur la qualité de l'expression et la force de la motivation.
        - **Badge 'CONFIRMED'** : Si les réponses sont claires, motivées et professionnelles.
        - **Badge 'JUNIOR'** : Si les réponses sont courtes mais sérieuses.
        - **Badge 'REJECTED'** : Si les réponses sont incohérentes, vides, ou irrespectueuses.
        *Note : Le badge 'EXPERT' n'est pas utilisé pour les rangs D/E.*

        ### FORMAT DE SORTIE JSON (STRICT)
        {
        'score': integer,
        'badge': 'CONFIRMED' | 'JUNIOR' | 'REJECTED',
        'summary': 'Résumé très court du profil pour le recruteur (2 lignes max)',
        'details': {
            'points_forts': ['Ex: Ponctualité affirmée', 'Ex: Bonne compréhension de la mission'],
            'points_faibles': ['Ex: Réponses très brèves']
        }
        }";

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(60)
                ->connectTimeout(10)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => 'llama-3.3-70b-versatile',
                    'messages' => [
                        ['role' => 'system', 'content' => 'Tu es un recruteur virtuel qui répond uniquement en JSON.'],
                        ['role' => 'user', 'content' => $prompt]
                    ],
                    'response_format' => ['type' => 'json_object']
                ]); 

            return $response->json()['choices'][0]['message']['content'];
        } catch (Exception $e) {
            throw new Exception("Erreur lors de l'analyse de la candidature: " . $e->getMessage());
        }
    }
}