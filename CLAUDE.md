# Jobsy : consignes du dépôt

## Structure

- `jobsyback/` : API Laravel 12 (PHP 8.3).
- `jobsyfront/` : site Next.js 16. C'est la seule partie déployée sur Vercel.
- `.github/workflows/ci.yml` : la CI. Elle lance les tests du back, puis les types et le build du front, à chaque Pull Request et à chaque push sur `main`.

## Mise en ligne : la règle

- `main` n'avance que par une Pull Request fusionnée par Gloria (`Gloryprod`, propriétaire du dépôt et du projet Vercel), avec « Create a merge commit ».
- Ne jamais pousser directement sur `main`, ne jamais utiliser `--force`.
- Pour chaque changement :
  1. créer une branche depuis `origin/main` à jour ;
  2. ouvrir une Pull Request vers `main` ;
  3. attendre que la CI soit verte ;
  4. Gloria fusionne.
- Pourquoi « Create a merge commit » : sur le forfait gratuit de Vercel (Hobby), avec un dépôt privé, Vercel ne déploie que les commits dont l'auteur est le propriétaire du compte Vercel. « Squash and merge » et « Rebase and merge » gardent l'auteur d'origine, et le déploiement serait bloqué. Le dépôt est public aujourd'hui, donc cette limite ne s'applique pas encore, mais la règle évite une panne s'il passe en privé.

## Réglages Vercel attendus (front)

- **Root Directory** : `jobsyfront`. Sans ce réglage, Vercel publie les fichiers bruts du dépôt et aucune page du site n'existe.
- **Framework Preset** : Next.js (détecté automatiquement une fois le Root Directory réglé).
- **Variable `NEXT_PUBLIC_API_URL`** : adresse racine de l'API, sans `/api`. Le code ajoute lui-même `/api` et `/storage` (voir `jobsyfront/lib/api.ts`).

## Réglages de l'API en production (hors Vercel)

- La connexion passe par des cookies httpOnly. `CORS_ALLOWED_ORIGINS` (ou `FRONTEND_URL`) doit contenir l'adresse exacte du front.
- Si le front et l'API sont sur deux sites différents (par exemple `*.vercel.app` et un autre domaine), il faut aussi mettre `AUTH_COOKIE_SAMESITE=none`, ce qui impose le HTTPS. Sinon le navigateur n'envoie pas les cookies et la connexion échoue.
- La liste complète des variables se trouve dans `jobsyback/.env.example`.

## Vérifier avant d'ouvrir une Pull Request

- Front : `cd jobsyfront && npm ci && npx tsc --noEmit && npm run build`
- Back : `cd jobsyback && composer install && vendor/bin/phpunit`
