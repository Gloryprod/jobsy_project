<?php

namespace App\Http\Requests\Concerns;

/**
 * Nettoie les champs HTML (éditeurs riches) avant validation, pour ne jamais enregistrer de HTML dangereux.
 * La requête déclare ses champs : protected array $htmlFields = ['description'];
 */
trait SanitizesHtmlFields
{
    protected function prepareForValidation(): void
    {
        $clean = [];

        foreach ($this->htmlFields ?? [] as $field) {
            if (is_string($this->input($field))) {
                $clean[$field] = sanitizeHtml($this->input($field));
            }
        }

        if ($clean) {
            $this->merge($clean);
        }
    }
}
