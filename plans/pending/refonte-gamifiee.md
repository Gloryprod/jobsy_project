# Refonte gamifiée de Jobsy : « Le Système »

Statut : validé le 17/10/2026. Les décisions sont listées plus bas.
Base de travail : `origin/main` à `474af18`.
Front concerné : `jobsyfront/` (Next.js 16, Tailwind 4, framer-motion, lucide).

## Objectif

En ouvrant Jobsy, un jeune voit en quelques secondes trois choses : son rang, ce qui lui manque pour le rang suivant et sa prochaine quête. Chaque action réelle (profil, formation, mission) fait avancer son personnage. Le jeu est une lecture de sa vraie progression, pas une couche de faux points.

### Critères de réussite (à confirmer)

1. **Compréhension.** Sur 5 jeunes testés, au moins 4 savent dire, sans aide et en moins de 10 secondes sur le tableau de bord :
   - leur rang ;
   - ce qui leur manque pour le rang suivant ;
   - leur prochaine action.
2. **Engagement.** Ces indicateurs sont mesurés depuis la base par Gloria, avant le lot 1 puis un mois après chaque lot :
   - la part des inscrits qui complètent leur profil en 7 jours ;
   - la part qui postule à une mission en 14 jours ;
   - le nombre de candidats actifs par semaine.
3. **Qualité.** Tous les écrans répondent aux critères suivants :
   - rien ne déborde à 375 px ;
   - contraste AA (4,5:1 pour le texte) ;
   - animations coupées quand « réduire les animations » est activé ;
   - tableau de bord utilisable en moins de 3 secondes sur un Android d'entrée de gamme en 4G (mesure Lighthouse mobile).
4. **Zéro donnée inventée.** Aucune valeur affichée par défaut quand la donnée manque. Aujourd'hui, `vitality || 85` et `streak_count || 3` affichent des chiffres faux.

## Le concept : deux couches

- **La réalité** : les vraies informations (missions, entreprises, montants en FCFA, documents), sur une interface claire et lisible.
- **Le Système** : des fenêtres sombres et lumineuses qui se superposent à la réalité pour la commenter en langage de jeu (« [Système] Nouvelle quête de rang C détectée »). Elles s'inspirent de Solo Leveling, sans en reprendre de nom, de personnage ni d'image.

Le Système ne cache jamais une information réelle : il l'annonce, la classe et la récompense.

## Ce qui existe déjà (à garder et améliorer)

| Élément | Donnée réelle | Où |
|---|---|---|
| Rangs E → S, avec couleurs (`code_hexa`) et seuils de points 0 / 300 / 800 / 1500 / 3000 / 5000 | `ranks`, `candidats.rank_id` | `RankSeeder`, `RankService::applyCvRank` (rang tiré du diplôme du CV) |
| Expérience (XP) | `candidats.score` : +250 par mission validée, `reward_xp` d'une formation terminée, plancher du rang du CV | `MissionTrackingController`, `Enrollment`, `RankService` |
| Badges : rareté de commun à légendaire, bonus affiché, badges « équipés » | `badges`, `candidat_badges` | `BadgeEvaluatorService`, `BadgeController` |
| Vitalité (0 à 100) et série de jours actifs | `candidats.vitality`, `streak_count`, `last_activity_at` | `ProfileController` : −15 de vitalité après 48 h d'absence |
| Tableau de bord « profil RPG », inventaire, gains | — | `DashboardHome.tsx` (1438 lignes, dont environ 990 commentées), `Inventory.tsx`, `loot/page.tsx` |

Défauts relevés :
- la barre d'XP vaut `min(score, 100)%` et est donc presque toujours pleine ;
- des valeurs inventées s'affichent quand la donnée manque ;
- le rang ne monte jamais avec l'XP, seulement avec un diplôme.

## Chaque fonctionnalité dans le jeu

| Fonctionnalité réelle | Présentation dans le jeu | Ce qui reste réel | Lot |
|---|---|---|---|
| Inscription, analyse du CV | **L'Éveil** : séquence d'arrivée, évaluation du rang de départ, révélation du rang | Rang tiré du CV (IA existante) | 6 |
| Tableau de bord | **Le QG** : fenêtre de statut compacte, progression vers le rang suivant, quêtes du jour, messages du Système | Score, rang, missions, formations et propositions en cours | 1 |
| Missions | **Les Portails** : chaque mission est un portail de la couleur de son rang. Le portail est verrouillé au-dessus de ton rang | `min_rank_required`, récompense en FCFA, +250 XP, entreprise, durée, `test_severity` | 2 |
| Candidature (étapes IA) | **Épreuve d'entrée** du portail | Étapes et score IA existants | 2 |
| Propositions d'entreprises | **Invitations de guilde**, avec compte à rebours | `expires_at` réel | 2 |
| Offres confirmées, suivi | **Journal de quêtes** : étapes, contrat, validation, récompense libérée | Statuts de mission, séquestre | 2 |
| Formations | **Donjons d'entraînement** : les modules sont des salles, les quiz des combats, l'examen final le boss | Modules, quiz, 2 tentatives, délai de 24 h, `reward_xp` | 3 |
| Certification | **Titre obtenu**, à télécharger | Certificat réel | 3 |
| Profil | **Fenêtre de statut** : nom, rang, niveau, classe (domaine), titre équipé, statistiques calculées | Données du profil. Chaque statistique a une source réelle (à définir au lot 4) | 4 |
| Diplômes, certificats, badges | **Inventaire** : documents (artefacts), titres avec rareté | Documents et badges réels | 4 |
| Changement de rang | **Réévaluation** : un moment plein écran, rare et mérité | Changement réel de `rank_id` | 4 |
| Gains | **Trésor** : solde, récompenses scellées (séquestre), retraits Mobile Money | Montants exacts en FCFA. Les jetons sont un solde séparé, jamais mélangé aux gains | 5 |
| Vitalité | **Vitalité** : elle baisse à partir du 15e jour d'absence. Une **révision** payée en jetons la restaure | Absence réelle, quiz réel tiré des formations de base | J3, J4 |
| Jetons | **Jetons** : gagnés par l'activité réelle ou achetés en packs | Solde et journal en base, achat KkiaPay vérifié côté serveur | J1, J2, J4 |
| Formations de base (savoir-être) | **Donjons d'initiation** : comportement en entreprise, bonnes manières, essentiels | Formations créées par l'équipe dans l'administration | C1, puis 3a |
| Notifications | **Messages du Système** | Notifications réelles | 5 |
| Page d'accueil publique | « Le Système recrute » : aperçu du jeu, entrée candidat et entrée entreprise | Vraies fonctionnalités, aucun chiffre inventé | 6 |
| Espace entreprise | **La Guilde**, version sobre : quêtes publiées, candidats avec leur rang, récompense déposée, quête validée | Tout l'existant, sans effets de jeu | 7 |
| Administration | Inchangée, aux couleurs du nouveau thème uniquement | — | 8 |

## Direction visuelle (à valider sur la maquette du lot 0)

- **Couleurs.**
  - Bleu nuit du Système, dérivé du bleu marine de Jobsy (#000080).
  - Cyan pour les lignes et les lueurs du Système.
  - Or, dérivé du kaki de Jobsy (#F0E68C), réservé aux récompenses (XP, FCFA, butin).
  - Couleurs de rang déjà en base.
  - Couche « réalité » claire, avec un mode sombre.
- **Typographies.**
  - Tektur (titres du Système, chiffres de rang).
  - Atkinson Hyperlegible Next (texte, conçue pour la lisibilité).
  - Les deux couvrent les accents français ; à vérifier au lot 0.
- **Mouvement.** Un seul moment fort par écran : l'apparition d'une fenêtre du Système (balayage lumineux de 300 ms). La réévaluation de rang est le seul moment long. Tout se coupe avec `prefers-reduced-motion`.
- **Icônes.** lucide, déjà installé : un trait, une épaisseur. Aucun emoji.
- **Piste à explorer** : des motifs géométriques inspirés des tentures appliquées d'Abomey pour les emblèmes de rang. Ce serait une identité propre au Bénin, à valider avec Gloria et des utilisateurs avant tout usage.

## Toujours / Jamais

**Toujours**
- Chaque élément de jeu repose sur une donnée réelle de l'API.
- Les montants sont exacts, en FCFA.
- Textes en français simple, et contraste AA.
- L'écran fonctionne à 375 px et sur un réseau lent.
- Les animations se coupent avec la préférence système.
- Chaque lot passe par une PR que Gloria fusionne avec « Create a merge commit » (voir `CLAUDE.md`).
- Le prix d'un pack de jetons est affiché en FCFA avant l'achat. L'achat n'est crédité qu'après vérification du paiement par le serveur, comme pour les dépôts des entreprises.
- Les jetons se gagnent aussi par l'activité réelle. Un jeune sans argent peut toujours restaurer sa vitalité.

**Jamais**
- Copier des éléments de Solo Leveling : nom, logo, personnage, image, musique.
- Proposer des coffres aléatoires payants ou une récompense tirée au sort contre de l'argent.
- Laisser la vitalité bloquer une candidature ou réduire la visibilité d'un profil auprès des entreprises : elle sert à l'affichage et aux rappels seulement.
- Mélanger les jetons et les gains en FCFA, ou permettre de convertir des jetons en argent.
- Faire honte : pas de « zone de pénalité », pas de perte de niveau ni de rang.
- Créer une fausse urgence : seuls les vrais délais (`expires_at`) ont un compte à rebours.
- Afficher un classement public sans le consentement des candidats.
- Ajouter une bibliothèque lourde (3D, vidéo) sur les écrans du quotidien.

## Les lots

Chaque lot est vérifié avant sa PR par :
- `npx tsc --noEmit` ;
- `npm run build` ;
- des captures Playwright à 375 px et 1280 px, plus une capture avec animations réduites ;
- une relecture des textes.

Un lot n'est terminé qu'une fois fusionné, déployé par Vercel et vérifié sur le site.

| Lot | Contenu | Taille | Bloqué par |
|---|---|---|---|
| 0 | **Fondations du Système** : jetons (couleurs, typos, mouvement) dans `app/globals.css`, polices dans `app/layout.tsx`, kit `components/systeme/`, calcul de progression `lib/progression.ts`, catalogue interne `/systeme` (non indexé), plan versionné dans `plans/` | M | Décisions 1, 6 et 8 |
| 1 | **Le QG candidat** : réécriture de `DashboardHome.tsx` avec le kit, suppression des valeurs inventées et du code commenté, en-tête et navigation candidat | M | Lot 0, accord de Gloria (décision 5) |
| 2a | **Portails** : liste des missions, détail, verrou de rang | M | Lot 0 |
| 2b | **Épreuve d'entrée** : les 5 étapes de candidature. À corriger au passage : aux étapes 1 et 2, la page n'affiche pas les erreurs de l'API, qui partent seulement dans la console. Le candidat ne voit donc pas, par exemple, le refus d'un brouillon envoyé après la date limite | S | 2a |
| 2c | **Invitations de guilde et journal de quêtes** : propositions, offres confirmées | M | 2a |
| 3a | **Donjons** : catalogue et carte des modules | M | Lot 0 |
| 3b | **Combat et boss** : leçons, quiz, examen final, projet, certification | M | 3a |
| 4a | **Fenêtre de statut** : page profil | M | Lot 1 |
| 4b | **Inventaire** : documents et titres | S | 4a |
| 4c | **Réévaluation de rang** | S | 4a, lot B1 si la décision 3 est acceptée |
| 5 | **Trésor et messages du Système** : gains, notifications, cloche | M | Lot 0 |
| 6a | **L'Éveil** : inscription, connexion, premiers pas | M | Lot 0 |
| 6b | **Accueil public** | M | 6a |
| 7 | **La Guilde** : espace entreprise, version sobre | M | Lot 0 |
| 8 | **Finitions** : navigation mobile (5 entrées maximum), passe performance (Lighthouse), passe accessibilité (axe), administration aux couleurs du thème | M | Lots 1 à 7 |
| B1 | **API : le rang monte avec l'XP** (seuils existants), le diplôme ne donne que le rang de départ, notification de réévaluation | S | Décision 3 et accord de Gloria |
| C1 | **Contenu : formations de base de savoir-être** (comportement en entreprise, bonnes manières, essentiels), avec leurs questions de quiz, créées dans l'administration | — | L'équipe (Gloria). Je vérifie qu'elles existent avant J3 |
| J1 | **API : jetons** : solde, journal des mouvements, jetons gagnés par l'activité (mission validée, formation terminée) | S | Lot 0 |
| J2 | **API : achat de packs de jetons** par KkiaPay : intention de paiement, webhook vérifié, crédit idempotent | M | J1, prix fixés par Gloria |
| J3 | **API : vitalité et révision** : tâche quotidienne qui baisse la vitalité dès le 15e jour d'absence (−5 par jour, plancher 20) ; révision de 5 questions (3 de savoir-être, 2 sur la mission visée) payée en jetons, qui remet la vitalité à 100. Remplace le calcul actuel au chargement du profil | M | J1, C1, accord de Gloria |
| J4 | **Front : jetons et révision** : solde de jetons dans le Trésor, achat, écran de révision, rappel du Système quand la vitalité baisse | M | J1 à J3, lot 5 |

Ordre retenu : 0 → 1 → 2a → 2b → 2c → 3a → 3b → 4a → 4b → B1 → 4c → 5 → J1 → J2 → J3 → J4 → 6a → 6b → 7 → 8. Les lots 2, 3, 5, 6 et 7 ne dépendent que du lot 0. Ils peuvent changer d'ordre si une priorité change. Le lot B2 du premier plan (« vitalité sans punition ») est remplacé par J3.

## Lot 1 : le QG candidat (plan détaillé du 17/10/2026)

**Objectif.** La page `/dashboard/candidats` montre d'un coup d'œil trois choses : le statut (rang, progression vers le rang suivant), la prochaine action (quêtes du jour) et le suivi (candidatures, formations, propositions).

**Données.** Uniquement des routes d'API existantes, sans nouvelle route :

| Route | Ce qu'elle fournit |
|---|---|
| `GET /candidat/profile-elements` | rang (`rank`, `code_hexa`, `points`), `score`, `vitality`, `streak_count`, `domaine_competence`, `skills` |
| `GET /missions/{candidat}/myapplications` | candidatures, avec la mission et l'offre (`mission_offers`) |
| `GET /courses/my-learnings` | inscriptions aux formations, avec la formation |
| `GET /candidat/proposals` | propositions des entreprises. La base n'a **pas de date limite** pour elles, donc pas de compte à rebours |

**Quêtes du jour** : 3 au plus, dans cet ordre de priorité.
1. **Offre à confirmer.** Candidature acceptée, offre sans réponse, délai non dépassé. Lien vers `/dashboard/candidats/missions/offers/{id}`, avec un compte à rebours sur `expires_at`.
2. **Examen prêt.** Formation au statut `evaluation_ready`. Lien vers l'espace de formation.
3. **Candidature à finaliser.** Brouillon dont la date limite de la mission n'est pas dépassée.
4. **Formation en cours.** Continuer, avec sa progression et l'XP de récompense.
5. **Profil sans compétences.** Déposer ou mettre à jour le CV.
6. **Sinon.** Explorer les missions.

**Corrections incluses.**
- La barre d'XP montre la vraie progression vers le rang suivant (`lib/progression.ts`).
- Plus de vitalité à 85 ni de série à 3 inventées : sans donnée, la ligne ne s'affiche pas.
- Liens réparés : les anciens liens `/dashboard/candidats/courses…` menaient à une page inexistante. Ils deviennent `/dashboard/candidats/formations/{id}/workspace` et `/dashboard/candidats/formations`.
- Les missions validées comptent les statuts `validated` et `completed`, puisque l'XP est accordée à `validated`.
- États prévus pour le chargement (squelette), l'erreur (bouton « Réessayer ») et l'absence de données (avec une action).

**Fichiers.**
- `app/dashboard/candidats/page.tsx`
- `components/dashboardCandidat/qg/` : `QGCandidat`, `FenetreStatut`, `QuetesDuJour`, `JournalQuetes`, `Donjons`, `Invitations`, `CarteRealite`, `types`, `quetes` (calcul des quêtes)

**Vérification.**
- `tsc`, ESLint sur les fichiers du lot, puis `npm run build`.
- API locale (SQLite) avec un compte de test dont les données déclenchent chaque quête, plus un compte neuf sans données.
- Captures à 375 px, à 1280 px, et avec animations réduites.
- Aucun débordement, aucune erreur dans la console.
- Chaque lien mène à une route qui existe.

**Critères d'acceptation.**
- Rang, progression et première quête sont visibles en haut de page sur téléphone et dans le premier écran sur ordinateur.
- Aucune valeur inventée.
- Aucun lien cassé.

## Lot 2a : les Portails (plan détaillé du 17/10/2026)

**Objectif.** Sur `/dashboard/candidats/missions`, le candidat voit en un coup d'œil :
- les missions ouvertes à son rang ;
- celles qui lui sont encore fermées, et ce qui lui manque pour les ouvrir ;
- celles où il a déjà postulé.

Il peut lire le détail et entrer dans l'épreuve d'entrée (la candidature) sans quitter la liste.

**Données.** Uniquement des routes existantes :

| Source | Ce qu'elle fournit |
|---|---|
| `GET /liste_missions` | missions actives et non clôturées, avec l'entreprise, `min_rank_required`, `reward`, `deadline`, `type_contrat`, `skills` |
| `GET /missions/{candidat}/myapplications` | candidatures, partagées avec le QG |
| Utilisateur connecté (`/user`) | rang et score du candidat |

**Règles d'affichage.**
- **Verrou de rang.** Une mission est verrouillée si le seuil de son rang minimum dépasse celui du rang du candidat. C'est la même règle que l'API (`CandidatureController`). Le verrou dit le rang requis, le rang actuel et l'XP qui manque. Depuis le lot B1, ce manque est réel.
- **Règle de Gloria conservée.** Aux rangs E et D, seules les missions ponctuelles sont proposées. Un message le dit (« les CDI et CDD s'ouvrent à partir du rang C ») au lieu de les cacher sans explication.
- **Missions passées.** Une mission dont la date limite est passée (fin de journée) n'est pas affichée.
- **Déjà postulé.** Une mission où le candidat a déjà postulé affiche son statut et l'action utile (finaliser, voir l'offre), et non « Postuler ».
- **Ordre.** D'abord les portails ouverts, puis ceux où le candidat a déjà postulé, puis les portails verrouillés.

**Corrections incluses.**
- La recherche ne marchait pas aux rangs E et D.
- Le montant s'affichait brut, par exemple « 45000.00 F ».
- La fenêtre de détail n'avait pas de bouton pour postuler, ne se fermait ni avec Échap ni en cliquant à côté, et le focus clavier n'y restait pas.
- La navigation vers la candidature rechargeait toute la page (`window.location`).
- Le texte annonçait « des centaines de quêtes », un chiffre inventé.

**Fichiers.**
- `app/dashboard/candidats/missions/page.tsx`, qui garde l'export du type `Mission` utilisé par la page publique `app/missions`.
- `components/dashboardCandidat/portails/` : `PortailsMissions`, `CartePortail`, `DetailPortail`, `regles` et `types`.

**Vérification.** Même méthode qu'au lot 1, avec l'API locale et des missions supplémentaires :
- des rangs minimums de E à B ;
- des CDI et des CDD ;
- une mission dont la date limite est passée ;
- des candidatures existantes.

On contrôle en plus le détail au clavier (ouverture, Échap, retour du focus).

**Critères d'acceptation.**
- Un portail verrouillé ne propose jamais « Postuler ».
- Le montant est en FCFA lisibles.
- La recherche fonctionne à tous les rangs.
- Le détail est utilisable entièrement au clavier.

## Lot 2b : l'Épreuve d'entrée (plan détaillé du 18/10/2026)

**Objectif.** La candidature (`/dashboard/candidats/missions/{id}/application`) devient l'épreuve d'entrée du portail. Le candidat sait à tout moment :
- où il en est, et combien d'étapes il reste ;
- ce qui se passe s'il s'arrête ;
- pourquoi une étape échoue, et comment réessayer.

**Ce que fait réellement l'API**, que l'écran doit suivre (`CandidatureController`) :

| Profil et mission | Étape 1 (motivation, 3 questions) | Étape 2 (technique, 3 questions) |
|---|---|---|
| Rang E ou D | Envoie la candidature (statut « en attente ») | Aucune |
| Rang C et plus, mission ponctuelle | Candidature déjà reçue | Affine la note |
| Rang C et plus, CDD ou CDI | Reste un brouillon | Envoie la candidature |

L'IA ne lit que les 1 500 premiers caractères d'une réponse de motivation, et demande des réponses techniques de 280 caractères au plus.

**Défauts de l'écran actuel, corrigés.**
- Au rang D, l'écran affichait une étape technique sans questions et plantait (écran blanc). L'écran ne traitait à part que le rang E, alors que l'API termine aussi au rang D.
- Les erreurs des étapes 1 et 2 partaient seulement dans la console. Le candidat ne voyait rien, par exemple un refus de date limite.
- « Précédent » ramenait sur une étape déjà envoyée : refus incompréhensible, ou nouvelle génération de questions.
- Promesses ou affirmations fausses :
  - « retour par e-mail sous 48h à 72h ouvrées » : aucun délai n'est garanti ;
  - « vos réponses ont été analysées » : la notation se fait ensuite, en arrière-plan ;
  - « Neural Processing Engine v3.0 » : pur habillage ;
  - « vous ne pourrez pas revenir en arrière » : contredit par le bouton « Précédent ».
- Les zones de réponse n'avaient pas d'étiquette liée, les animations tournaient en boucle sans respecter « réduire les animations », et le minimum annoncé (10 caractères) ne correspondait pas à la règle du code (11).

**Ce que fait le nouvel écran.**
- **Accueil de l'épreuve.** Mission, récompense en FCFA, +250 XP à la validation, date limite, étapes prévues. L'écran refuse d'avance, avec la raison et l'action utile :
  - un rang insuffisant ;
  - une date limite passée ;
  - une mission fermée ;
  - une candidature déjà envoyée. Un brouillon se reprend.
- **Indicateur d'étapes**, avec la même règle que l'API : 2 étapes aux rangs E et D, 3 sinon.
- **Questions de motivation.** Étiquettes liées, conseil de l'IA, compteur de caractères (10 au minimum, 1 500 au maximum).
- **Questions techniques**, une à la fois. Compteur jusqu'à 280 caractères, retour possible à la question précédente avant l'envoi. Un message dit si la candidature est déjà reçue (mission ponctuelle) ou si cette étape l'envoie.
- **Envoi.** Le texte d'attente est honnête et reste calme si l'appareil demande moins d'animations. Une erreur s'affiche dans l'écran avec le message de l'API et un bouton « Réessayer », sans perdre les réponses.
- **Fin de l'épreuve.** Les vraies suites : l'entreprise examine les candidatures ; si elle retient le candidat, il reçoit une offre par e-mail et dans ses notifications, avec un délai pour l'accepter. Liens vers le QG et les missions.
- **Réponses gardées sur l'appareil** jusqu'à l'envoi, pour qu'une page rechargée ou un réseau coupé ne fasse pas tout perdre.

**Fichiers.**
- `app/dashboard/candidats/missions/[id]/application/page.tsx`
- `components/dashboardCandidat/epreuve/` : `EpreuveEntree`, `EtapesEpreuve`, `AccueilEpreuve`, `QuestionsMotivation`, `QuestionsTechniques`, `FinEpreuve`, `brouillon`, `types`
- `components/dashboardCandidat/portails/DetailPortail.tsx` (durée annoncée)

**Vérification.**
- `tsc`, ESLint et `build`.
- API locale avec l'ensemble des corrections d'API en cours, notation laissée en file d'attente.
- Parcours complets :
  - rang D, mission ponctuelle ;
  - rang C, mission ponctuelle ;
  - rang C, CDD.
- Cas de refus : verrou, date passée, candidature déjà envoyée. Reprise d'un brouillon.
- Erreur simulée à l'envoi : le message s'affiche, les réponses sont gardées et « Réessayer » fonctionne.
- À 375 px, à 1280 px et avec animations réduites : aucun débordement, aucune erreur dans la console. Le focus va au titre de chaque nouvelle étape.

**Critères d'acceptation.**
- Aucun écran blanc, quel que soit le rang.
- Toute erreur de l'API est lisible à l'écran.
- Aucune promesse que le système ne tient pas.
- Une page rechargée garde les réponses non envoyées.

**Zone floue.** Au rang C et plus, sur un CDD ou un CDI, un brouillon dont les questions techniques ont déjà été générées reprend à l'étape 1. L'API ne renvoie pas les questions techniques existantes au démarrage. Reprendre directement à l'étape 2 demande un petit changement d'API, à proposer à Gloria.

## Lot 2c : invitations des entreprises et journal de quêtes (plan détaillé du 18/10/2026)

Le lot est découpé en deux parties, chacune de taille M :
- **2c-A, Invitations** : répondre aux propositions des entreprises.
- **2c-B, Journal de quêtes** : l'offre à confirmer et le suivi des missions confirmées.

### 2c-A : les invitations des entreprises

**Constat.** Le candidat ne peut répondre à une proposition que par les liens de l'e-mail : le QG lui dit « réponds avec les boutons de l'e-mail ». Dans l'API (`ProposalResponseController`) :
- aucun verrou n'empêche deux réponses simultanées, par exemple un double clic. L'audit l'avait déjà relevé ;
- le message de refus affirme « L'entreprise en a été informée », alors qu'aucune notification n'est envoyée.

**API**, branche `feat/api-reponse-propositions`, empilée sur `fix/api-propositions-inscriptions` qui touche le même contrôleur :
- `ProposalResponseService` réunit l'acceptation et le refus. La transaction verrouille la proposition (`lockForUpdate`) : une seule réponse possible. Le service est utilisé à la fois par les liens de l'e-mail et par les nouvelles routes.
- Deux nouvelles routes : `POST /candidat/proposals/{id}/accept` et `POST /candidat/proposals/{id}/decline`. Elles répondent :
  - 403 si la proposition est celle d'un autre candidat ;
  - 409 si elle a déjà reçu une réponse ;
  - 410 à l'acceptation si la mission est fermée.
- Le message de refus des liens de l'e-mail ne prétend plus prévenir l'entreprise.
- Tests : acceptation (candidature créée, entreprise prévenue), refus, autre candidat, double réponse, mission fermée. Les liens de l'e-mail continuent de fonctionner (`ProposalResponseTest`).

**Front.**
- Une page `/dashboard/candidats/invitations`. Pour chaque proposition :
  - l'entreprise, la mission, la récompense et le message (texte riche affiché par `SafeHtml`) ;
  - pour une proposition en attente, « Accepter » ou « Décliner », avec une confirmation avant de décliner.
- Après l'acceptation, la page donne la vraie suite : l'entreprise prépare l'offre, qui arrive par e-mail et dans les notifications, avec un délai pour la confirmer.
- Dans le QG, la carte des invitations mène à cette page. Une invitation en attente devient une quête du jour, juste après une offre à confirmer.

### 2c-B : le journal de quêtes

**Constats.**
- **Page de l'offre** (`missions/offers/{id}`) :
  - une offre déjà acceptée ou refusée affiche encore les boutons, et une deuxième réponse échoue avec « Erreur lors de la réponse » ;
  - le refus se fait sans confirmation ;
  - le montant s'affiche brut ;
  - une erreur de chargement laisse l'écran bloqué sur le chargement.
- **Missions confirmées** (`missions/en_cours`) :
  - l'étiquette de statut est toujours vide, car elle lit une variable globale `status` au lieu de `offer.status` ;
  - les erreurs d'action ne sont pas affichées ;
  - le lien du contrat apparaît même sans contrat ;
  - le lieu affiché est celui de la mission, et non le lieu de rendez-vous de l'offre ;
  - les animations sont en boucle.

**Front.**
- **Offre à confirmer.** La page tient compte de l'état de l'offre : en attente (compte à rebours sur `expires_at`, accepter ou décliner avec confirmation), acceptée, déclinée ou expirée. Elle affiche la date, l'heure et le lieu de rendez-vous, le contact, les instructions et la récompense. Les erreurs montrent le message de l'API.
- **Journal de quêtes.** Chaque mission confirmée suit cinq étapes réelles :
  1. offre acceptée ;
  2. arrivée signalée ;
  3. présence confirmée par l'entreprise, avec génération du contrat ;
  4. travail terminé ;
  5. mission validée (paiement et +250 XP).

  Les actions du candidat sont « Signaler mon arrivée » et « Déclarer la mission terminée ». Les étapes qui dépendent de l'entreprise sont annoncées comme telles. La récompense affiche le montant net après la commission Jobsy de 10 % (`WalletService::COMMISSION_RATE`). Le contrat n'apparaît que s'il existe.

**Vérification.**
- Tests PHPUnit de l'API.
- Pour le front : API locale, avec les branches d'API appliquées temporairement.
- Parcours :
  - accepter et décliner une invitation ;
  - répondre à une offre (et voir qu'une offre déjà acceptée ne propose plus de bouton) ;
  - signaler son arrivée, puis déclarer la mission terminée après la confirmation de présence par l'entreprise.
- Erreurs affichées. À 375 px, à 1280 px et avec animations réduites. Pas de régression sur les écrans précédents.

## Lot 3a : les donjons, catalogue et carte des modules (plan détaillé du 27/10/2026)

**Objectif.** Avant d'entrer dans une formation, le jeune sait :
- ce qu'elle lui rapporte (XP, badge, certificat) ;
- ce qu'elle lui demande : nombre de modules, quiz, examen final ou projet, kit de matériel ;
- où il en est.

Les leçons, les quiz et l'examen restent dans l'espace de formation (lot 3b).

**Constats.**
- **Catalogue** (`formations/page.tsx`) :
  - la progression d'une formation commencée n'est pas affichée, alors que l'API la donne (`progress_percentage`) ;
  - les filtres affichent des codes techniques (STANDARD, LOGISTIQUE, EXPERT) sans dire ce qu'ils impliquent ;
  - le bouton inscrit tout de suite, sans prévenir qu'une formation demande un kit livré ou un projet final à deux tentatives ;
  - la recherche tient compte des accents ;
  - « Réessayer » recharge toute la page.
- **Page des modules** (`formations/{id}/modules`) :
  - aucune page n'y mène ;
  - elle reprend du code d'administration en commentaire (suppression d'un module) ;
  - elle affiche un module par page.
- **API.** `GET /get_modules/{id}` renvoie à tout candidat connecté, inscrit ou non :
  - le contenu complet des leçons ;
  - les questions des quiz **avec les bonnes réponses** (`correct_answers`).

  Or `submitQuiz` ne montre les corrections qu'après un quiz réussi : cette route contourne la règle.

**API**, branche `fix/api-carte-modules`, depuis `main` :
- `GET /get_modules/{id}` renvoie un **résumé** par module : titre, description, ordre, nombre de leçons, durée totale, nombre de questions du quiz.
  - Pour un candidat inscrit, il ajoute aussi les leçons terminées et l'état du quiz (réussi ou non).
  - Il ne renvoie plus ni contenu de leçon ni question.
- Réponse 404 pour une formation désactivée que le candidat ne suit pas, avec la même règle que le catalogue.
- Tests : pas de contenu ni de réponse dans la réponse, progression exacte d'un inscrit, formation désactivée, ordre des modules.

**Front.**
- **Catalogue : les donjons d'entraînement.**
  - En tête, les donjons en cours du candidat : progression réelle et prochaine étape.
  - Filtres avec les noms de l'administration, chacun expliqué en une phrase :
    - Standard : quiz et examen en ligne ;
    - Logistique : avec un kit de matériel livré ;
    - Expert : projet pratique final.
  - **Cartes.** Chacune montre :
    - le type, le titre et une description courte ;
    - le nombre de salles (modules) ;
    - la récompense (+XP, badge) ;
    - l'état réel : nouveau, en cours avec %, kit en attente, boss prêt, en correction, certifié, non validé ;
    - l'action « Voir le donjon ».
  - Recherche sans accents.
- **Carte du donjon** (`formations/{id}/modules`, l'adresse existante). Elle présente :
  - l'entrée : pour une formation avec kit, le matériel doit être livré avant la première salle ;
  - les salles (modules) dans l'ordre, avec leurs leçons, leur durée et leur quiz. Chaque salle est franchie, en cours ou à venir : le parcours est séquentiel, comme dans l'espace de formation ;
  - le boss, avec ses vraies règles :
    - Standard et Logistique : examen final en QCM, nouvelle tentative 24 h après un échec ;
    - Expert : projet pratique, 2 tentatives au plus, avec 24 h d'écart ;
  - le trésor : XP, badge, certificat vérifiable.

  L'action suit l'état : « Entrer dans le donjon » (inscription, puis l'espace de formation), « Continuer », « Suivre la livraison du kit », « Affronter le boss », « Voir mon certificat ».

**Vérification.**
- Tests PHPUnit de l'API.
- API locale avec des formations des trois types et un candidat dans chaque état : non inscrit, en cours, kit en attente, boss prêt, certifié, non validé.
- Contrôles :
  - états des salles conformes aux leçons terminées et aux quiz réussis ;
  - aucune réponse de quiz dans les échanges réseau ;
  - inscription réelle depuis la carte ;
  - erreurs affichées ;
  - focus au clavier ;
  - 375 px, 1280 px et animations réduites ;
  - pas de régression sur le QG.

## Lot 3b : l'espace de formation (plan détaillé du 01/11/2026)

L'espace de formation compte environ 2 400 lignes : apprentissage, examen final, projet pratique, certificat, attente du kit. Le lot est donc découpé en deux parties :
- **3b-A, les salles** : les leçons et les quiz de module ;
- **3b-B, le boss** : l'examen final, le projet pratique, le certificat et l'attente du kit.

### 3b-A : les salles

**Constats** (`LearningPage.tsx`) :
- après un quiz raté, chaque question est marquée « ✗ Incorrect », même les bonnes. L'API ne renvoie la correction qu'en cas de réussite : l'écran affiche donc une information fausse ;
- le candidat ne sait pas si une question attend une ou plusieurs réponses, alors que la notation en dépend. Deux cases cochées sur une question à réponse unique valent zéro ;
- le seuil de 80 % n'est annoncé qu'après un échec ;
- la liste des leçons est faite de `div` cliquables : elle n'est pas utilisable au clavier ;
- les messages passent par des toasts qui disparaissent ;
- un `console.log` est resté, et l'indicateur de chargement ne tourne pas ;
- un score de 0 % s'affiche « 0 » seul.

**API**, branche `feat/api-salles-quiz`, empilée sur `fix/api-carte-modules` (constantes) :
- l'espace de formation indique pour chaque question de quiz si plusieurs réponses sont attendues (`is_multiple`, comme l'examen final), et renvoie le seuil du quiz ;
- une leçon ne peut pas être marquée terminée tant que le kit n'est pas livré (même règle que le quiz) ;
- tests.

**Front** :
- l'écran d'une salle : la leçon en cours sur fond clair, lisible, et le plan des salles à côté, avec un bouton par leçon et la raison du verrou ;
- le quiz devient un combat du Système :
  - choix unique ou multiple annoncé pour chaque question (boutons radio ou cases) ;
  - seuil annoncé avant ;
  - après un échec, seulement le score et la règle. Après une réussite, la correction ;
- messages dans la page, focus sur le titre de chaque nouvelle leçon ;
- lien vers la carte du donjon.

**Vérification** : tests PHPUnit ; API locale ; parcours d'une salle complète (leçons, quiz raté puis réussi) ; verrous ; clavier ; 375 px, 1280 px et animations réduites.

### 3b-B : le boss

Le projet pratique (`FinalExamProject`, 892 lignes) forme une partie à lui seul. Le boss est donc découpé à son tour :
- **3b-B1** : l'examen final en QCM, le certificat et l'attente du kit ;
- **3b-B2** : le projet pratique.

**Constats du 3b-B1.**
- **Examen final** (`FinalExamIntro.tsx`) :
  - après une réussite, le message annonce « Vous pouvez retenter le test pour atteindre les 100 % », alors que l'API refuse tout nouvel essai une fois l'examen réussi ;
  - un envoi pendant le délai de 24 h reçoit une réponse « bloquée » avec le code 200 : l'écran plante sur `data.is_passed` ;
  - le compteur « répondues » compte aussi une question dont on a décoché toutes les cases ;
  - les choix sont des boutons sans rôle de case ni de bouton radio ;
  - le résultat passe par un toast, et l'écran bascule aussitôt sans le laisser lire ;
  - le compte à rebours clignote en boucle.
- **Certificat** (`CertifiedScreen.tsx`) : 130 lignes de code mis en commentaire, et la copie du lien échoue sans message si le presse-papiers est refusé.
- **Attente du kit** (`LogisticHoldScreen.tsx`) :
  - animations en boucle ;
  - phrase coupée par des espaces (« to        ute préoccupation ») ;
  - le bouton « Valider la réception » est proposé avant même que l'admin ait marqué le kit comme livré.

**Front (sans changement d'API).**
- **Le boss : l'examen final.** Les règles réelles de la carte (seuil, délai) sont annoncées avant. Chaque question est un choix unique ou multiple.
  - Après une victoire : le score, puis « Voir mon certificat ».
  - Après un échec : le score, la règle et l'heure de la prochaine tentative, puis « Revoir les salles ».
  - Pendant le délai : le compte à rebours réel.
  - Une réponse « bloquée » est gérée.
- **Le trésor : le certificat.** XP et badge gagnés, lien de vérification public (copié, ou affiché s'il ne peut pas l'être), téléchargement du PDF.
- **L'entrée : le kit.** Chaque étape est écrite en toutes lettres.
  - Tant que le kit n'est pas livré : explication et « Vérifier à nouveau ».
  - Une fois livré : « J'ai reçu mon kit ».
  - Lien vers le profil pour le téléphone et l'adresse de livraison.
- Les questions du combat et de l'examen partagent un même composant.

**Vérification** : API locale ; examen raté puis bloqué, puis réussi ; certificat (lien, PDF) ; kit en livraison puis livré ; clavier ; 375 px, 1280 px et animations réduites ; pas de régression sur les salles ni sur les donjons.

### 3b-B2 : le projet pratique (plan détaillé du 02/11/2026)

Le boss des formations Expert (mode C) : un projet noté sur 20 par un jury. Le candidat a un temps imparti, puis une période de grâce. Il a 2 tentatives, avec 24 h d'attente après un échec.

**Constats.**
- **Une tentative peut être perdue dès le démarrage.**
  - Le chrono se calcule avec l'horloge du téléphone. Sur un téléphone qui avance d'une heure, le temps paraît écoulé dès l'ouverture.
  - Sans réponse, l'écran déclare alors une « copie blanche » : la tentative est perdue. Avec des réponses, la copie part au jury, inachevée.
  - L'API accepte ces deux demandes sans vérifier l'heure limite.
- **La grâce promise n'est pas tenue.** Le texte annonce 30 minutes de grâce, et l'API les accepte. L'écran envoie pourtant la copie au bout de 10 minutes (`EXTRA_TIME_MINUTES = 10`).
- **Enregistrement automatique silencieux.** Quand il échoue, rien ne s'affiche : le candidat croit son travail enregistré.
- **Note fausse.** Après une réussite, l'écran affiche « 14 % obtenus » au lieu de 14 sur 20.
- **Écran bloqué.** Après les 24 h d'attente, l'écran ne propose pas la nouvelle tentative. Il faut recharger la page.
- **Erreurs illisibles.** Un champ refusé par l'API (lien invalide, texte trop court) donne « Erreur lors de la soumission ». Un fichier refusé (format, plus de 20 Mo) donne « Échec du téléversement ». La raison de l'API se perd, car elle n'envoie pas de `message`.
- **Fichiers.**
  - Le champ ne dit ni les formats ni la taille maximale acceptés par l'API (PDF, ZIP, RAR, PNG, JPG ; 20 Mo).
  - Un fichier envoyé ne peut plus être remplacé.
  - Le champ n'a pas d'étiquette liée.
- **Envoi définitif sans confirmation.**
- **Animations en boucle.** Le chrono clignote, puis rebondit pendant toute la grâce.
- **Projet absent.** L'écran propose « Retourner au cours », mais aucun écran ne transmet ce bouton.
- **Accès trop large.** `GET /exam-submissions/project/{courseId}` renvoie le sujet à tout candidat connecté, même non inscrit.

**API (`fix/api-projet-pratique`, depuis `main`).**
- La lecture du projet est réservée aux inscrits (403 sinon). Elle renvoie aussi :
  - l'heure du serveur ;
  - la durée de la grâce ;
  - le nombre maximal de tentatives ;
  - pour une session en cours : la fin du temps imparti et la fin de la grâce.
- L'envoi automatique et la copie blanche sont refusés (422) avant la fin de la grâce. La copie blanche est aussi refusée pour un projet sans limite de temps.
- Les refus de validation (envoi, téléversement) renvoient aussi un `message`.
- Tests ajoutés pour chaque règle.

**Front.**
- **Accueil.**
  - Les règles réelles : temps imparti, grâce, note à atteindre sur 20, tentative en cours sur le maximum.
  - Ce que le jury note : les critères et leurs points.
  - L'XP et le badge à gagner.
  - Avertissement : le chrono tourne même si on quitte la page.
  - Le bouton dit ce qu'il fait : « Démarrer le chrono ».
- **Pendant le projet.**
  - Chrono à la minute, sur l'heure du serveur, sans animation en boucle.
  - Bandeau quand la grâce commence. Annonce aux lecteurs d'écran à chaque changement de phase seulement.
  - Énoncé, puis les livrables. Chaque champ a son étiquette, son aide et son erreur.
  - État de l'enregistrement : en cours, enregistré à telle heure, ou échec avec « Réessayer ».
  - Vérification avant l'envoi, avec les règles de l'API (champ requis, lien http ou https, texte de 10 caractères au moins), puis confirmation.
  - À la fin de la grâce : envoi automatique du dernier brouillon, ou copie blanche s'il est vide.
- **Fichier.**
  - Formats et taille annoncés, et vérifiés avant l'envoi.
  - Erreur de l'API affichée.
  - Fichier remplaçable.
- **Après l'envoi.** Copie chez le jury : date d'envoi, et e-mail au moment de la correction.
- **Échec.**
  - Note sur 20, seuil et retour du jury.
  - Puis, selon le cas : compte à rebours réel, « Recharger » une fois le délai passé, « Repasser le projet », ou tentatives épuisées.
- **Réussite.** Note sur 20, puis « Voir mon certificat ».
- **Projet absent.** Explication, et lien vers la carte du donjon.
- `FinalExamProject` garde son nom et ses paramètres, et affiche le nouveau composant (`components/dashboardCandidat/projet`).

**Vérification** :
- tests de l'API, et suite complète ;
- API locale, avec chaque état :
  - accueil ;
  - démarrage, saisie et enregistrement ;
  - enregistrement en échec ;
  - champ invalide ;
  - fichier refusé, puis accepté et remplacé ;
  - confirmation, puis envoi ;
  - correction par l'admin en échec, attente de 24 h, nouvelle tentative ;
  - grâce, puis envoi automatique ;
  - copie blanche ;
  - tentatives épuisées ;
  - réussite, puis certificat ;
- horloge du navigateur décalée d'une heure : la tentative n'est pas perdue ;
- clavier ; 375 px, 1280 px et animations réduites ;
- pas de régression sur le boss en QCM, les salles et les donjons.

## Lot 4a : la fenêtre de statut (plan détaillé du 10/11/2026)

La page `/dashboard/candidats/profile` montre le personnage du candidat, et lui permet de tenir son dossier à jour. Aucun changement d'API.

**Constats** (`ProfileDetailPage.tsx`, 626 lignes).
- **Fausses informations.**
  - « Profil vérifié par la guilde » et une coche verte s'affichent même quand l'équipe n'a pas validé le profil.
  - Le CV annonce PDF et DOC. L'API n'accepte que le PDF, jusqu'à 2 Mo.
- **Adresse impossible à saisir.** L'écran d'attente du kit envoie le candidat au profil pour vérifier son adresse de livraison. Le profil ne permet ni de la voir ni de la modifier.
- **Champs incohérents.**
  - La nationalité et l'e-mail secondaire sont affichés, mais ne se modifient pas.
  - Le sexe et la date de naissance se modifient, mais ne sont pas affichés.
  - WhatsApp n'apparaît nulle part.
- **Vocabulaire qui gêne.** « Cristal de contact », « parchemin », « Réinitialiser le document » pour supprimer un CV.
- **Actions dangereuses ou muettes.**
  - Suppression d'un CV, d'un diplôme ou d'un certificat sans confirmation.
  - Modification sans bouton « Annuler ».
  - Après le choix d'un CV, rien n'indique quel fichier est retenu.
  - Pour changer de CV, il faut d'abord le supprimer, alors que l'API sait le remplacer.
  - Les mots de passe restent dans le formulaire après le changement.
- **Erreurs illisibles.** Tout refus de l'API donne un message générique (intitulé déjà utilisé, lien invalide, fichier trop lourd). Les messages de validation de l'API sont en anglais.
- **Accessibilité.** Étiquettes non liées aux champs, boutons sans nom, texte de 9 à 10 px, marge de 32 px sur téléphone.
- **Bio.** Texte d'attente avec des fautes, affiché en italique entre apostrophes.

**Statistiques (zone floue du plan, tranchée en D30).** Toutes viennent de données réelles, déjà renvoyées par l'API :

| Ligne | Source | Sans donnée |
|---|---|---|
| Missions validées | Candidatures au statut `validated` ou `completed` | 0 |
| Réputation | Moyenne de `mission_offers.rating` (note sur 5 donnée par l'entreprise à la validation), et nombre de notes | « Pas encore de note » |
| Ponctualité | `mission_offers.is_on_time` (renseigné par l'entreprise à l'arrivée) : à l'heure, sur le nombre de missions renseignées | « Pas encore de mission » |
| Savoir | Formations au statut `certified` | 0 |
| Série et vitalité | `profile-elements` | Ligne masquée |

**Front** (`components/dashboardCandidat/statut`).
- **La fenêtre de statut.** Nom, rang, progression vers le rang suivant (même bloc que le QG), classe, statistiques, compétences, titres équipés avec un lien vers l'inventaire.
- **La reconnaissance du profil.**
  - Validé : dit clairement.
  - Sinon : les trois étapes réelles (CV déposé, diplôme ajouté, vérification par l'équipe).
- **Couche réalité : le dossier**, avec des mots simples.
  - Informations : ville, adresse, nationalité, sexe, date de naissance, présentation.
  - Contact : e-mail du compte (lecture seule), téléphone, WhatsApp, e-mail secondaire, LinkedIn.
  - Chaque carte se modifie sur place, avec « Annuler », le focus au bon endroit et une erreur sous chaque champ.
- **CV.** Formats réels annoncés et vérifiés, envoi dès le choix du fichier, remplacement direct, annonce de l'analyse en cours, suppression avec confirmation.
- **Diplômes et certifications.** Formulaire d'ajout avec étiquettes, nom du fichier choisi, formats annoncés, suppression avec confirmation.
- **Mot de passe.** Étiquettes, vérification avant l'envoi, erreur sous le bon champ, champs vidés après le succès.
- `ProfileDetailPage` garde son nom et affiche le nouveau composant.

**Vérification** : API locale ; candidat neuf, en attente de validation, puis validé ; modification et annulation de chaque carte ; refus de chaque champ ; CV déposé, refusé, remplacé, supprimé ; diplôme en double ; certificat ; mot de passe faux, puis changé pour de vrai ; statistiques comparées à la base ; clavier ; 375 px, 1280 px et animations réduites ; pas de régression sur le QG.

## Lot 4b : l'inventaire (plan détaillé du 10/11/2026)

La page `/dashboard/candidats/inventaire` rassemble les titres (badges) du candidat et ses documents. Aucun changement d'API.

**Constats** (`Inventory.tsx`, 720 lignes).
- **Promesses fausses.**
  - « Boost Visibilité : +X % » additionne les bonus des badges débloqués, et chaque badge affiche le sien (« +5 % Proactivité »). Rien dans l'API ne les applique (décision D31).
  - Chaque diplôme porte l'étiquette « Diplôme Validé », même quand l'équipe n'a rien vérifié.
  - Un certificat Jobsy sans XP renseignée affiche « +100 XP ».
- **Chiffres faux.**
  - « Missions » ne compte que le statut `completed`, alors que le QG et la fenêtre de statut comptent aussi `validated`, le statut où l'XP est accordée.
  - « Formations » compte toutes les inscriptions, même celles à peine commencées.
  - La jauge d'XP est rapportée à 10 000 XP, un plafond qui n'existe nulle part.
- **Certificats Jobsy sans lien.** Ils ne mènent ni à la page de vérification publique ni au PDF.
- **Données répétées.** L'écran reconstitue diplômes et certifications à partir de copies répétées dans chaque badge.
- **Retours muets.** Équiper ou retirer un titre passe par un toast. Le bouton change de liste sans que le focus suive. La limite de 5 titres n'est expliquée qu'après coup.
- **Animations en boucle** (flamme qui pulse) et textes de 10 à 11 px.

**Ce que voient les entreprises.** La fiche candidat d'une entreprise (`MatchingController`) montre les titres équipés, les diplômes, les certifications externes et les certificats Jobsy. L'inventaire le dit.

**Front** (`components/dashboardCandidat/inventaire`).
- **Couche Système : les titres.**
  - Titres équipés, avec le compteur (5 au plus) et « Retirer ».
  - Titres débloqués, avec « Équiper ». Quand la limite est atteinte, l'écran le dit avant l'envoi.
  - Titres à débloquer, avec leur condition et leur progression réelle (« 1 sur 5 »).
  - Rareté affichée, bonus retirés (D31).
  - Le focus suit le titre dans sa nouvelle liste, et le résultat est annoncé.
- **Couche réalité : les documents.**
  - Certificats Jobsy : formation, date, XP réelle, lien vers la page de vérification publique.
  - Diplômes et certifications externes : fichier consultable, sans étiquette « validé ».
  - Lien vers le profil pour les ajouter ou les supprimer.
- `Inventory.tsx` garde son nom et affiche le nouveau composant.

**Vérification** : API locale ; candidat neuf (aucun titre), candidat avec titres débloqués et à débloquer ; équiper, retirer, limite de 5 (avant l'envoi et refus de l'API), erreur réseau ; certificats Jobsy et lien de vérification ; documents comparés à la base ; clavier ; 375 px, 1280 px et animations réduites ; pas de régression sur la fenêtre de statut.

## Lot 4c : la réévaluation de rang (plan détaillé du 15/11/2026)

Quand le rang change vraiment, le candidat le voit : une fenêtre du Système s'ouvre sur le QG, une seule fois.

**Constats.**
- Depuis le lot B1, l'API enregistre une notification `rank_promoted` à chaque montée de rang (ancien rang, nouveau rang, XP). Elle n'apparaît que dans la liste des notifications.
- Cette notification passait par la file d'attente. Sans worker, elle n'était jamais enregistrée.
- L'API ne savait marquer comme lues que toutes les notifications d'un coup.

**API (`fix/api-reevaluation`, depuis `main`).**
- La notification de promotion est enregistrée tout de suite, sans file d'attente.
- `PATCH /candidat/notifications/{id}/read` marque une seule notification comme lue, parmi celles de l'utilisateur.

**Front** (`components/dashboardCandidat/qg/Reevaluation.tsx`).
- Sur le QG, une promotion non lue ouvre la fenêtre « Réévaluation » : ancien rang, nouveau rang, XP, et ce que le rang ouvre.
- Plusieurs promotions non lues n'ouvrent qu'une fenêtre, du premier rang au dernier.
- « Continuer » ou Échap ferme la fenêtre et marque ces notifications comme lues, sans toucher aux autres.
- « Voir les missions » mène aux missions.
- Si la lecture échoue, la fenêtre se ferme quand même. Elle reviendra à la prochaine visite.
- Seule animation : le balayage du kit, coupé quand l'appareil demande moins d'animations.

**Vérification** : tests de l'API ; API locale : promotion réelle (XP qui passe un seuil), fenêtre ouverte une seule fois, autres notifications intactes, double promotion, Échap, échec de la lecture ; clavier ; 375 px et animations réduites ; pas de régression sur le QG.

## Lot 5 : le Trésor et les messages du Système (plan détaillé du 16/11/2026)

Les gains (`/dashboard/candidats/loot`), les notifications (`/dashboard/candidats/notifications`) et la cloche de l'en-tête. Aucun changement d'API.

**Comment circule l'argent** (`WalletService`).
- Quand l'entreprise finance une mission, une opération `transfer` en attente (`pending`) apparaît chez le candidat : c'est la récompense **scellée**, nette de la commission de 10 %.
- À la validation, elle passe à `completed` et le solde du candidat augmente.
- Si la mission est arrêtée, elle passe à `cancelled`.
- Un retrait retire tout de suite le montant du solde (`withdrawal`, `pending`). Il passe à `processing` pendant le virement, puis `completed`. S'il échoue (`failed`), le montant est rendu.

**Constats.**
- **Statuts faux.** Tout ce qui n'est pas `completed` s'affiche « En cours », avec un « + » : une récompense annulée et un retrait refusé (montant rendu) passent pour des gains à venir.
- **Libellés en anglais.** Un retrait s'appelle « Withdrawal » (nom technique de l'opération).
- **Montants.** Ils sont formatés selon la langue du téléphone (« 1,000 F »).
- **Retrait.**
  - Le bouton s'ouvre même avec un solde à 0.
  - Le minimum de l'API (100 FCFA) n'est pas annoncé.
  - Les réseaux ne sont pas des choix accessibles.
  - La fenêtre n'a ni focus gardé ni Échap.
  - Les messages parlent de « conseil » et de « mages ».
- **Notifications.**
  - Le message est coupé à deux lignes, sans moyen de le lire en entier.
  - Seule l'offre d'une entreprise mène quelque part.
  - « Tout marquer comme lu » ne met pas à jour la cloche, qui garde son compteur pendant une minute.
  - Le chargement prend tout l'écran.
- **La cloche.** Son compteur clignote en boucle et n'est pas plafonné.

**Front.**
- **Le Trésor** (`components/dashboardCandidat/tresor`).
  - Couche Système : disponible, scellé (en séquestre, versé à la validation de la mission) et total gagné, en FCFA exacts.
  - Bouton « Retirer » seulement si un retrait est possible.
- **Le retrait.** Fenêtre accessible :
  - montant, avec le solde et le minimum annoncés ;
  - réseau en boutons radio ;
  - numéro avec un exemple ;
  - vérification avant l'envoi avec les règles de l'API ;
  - refus de l'API affiché ;
  - résultat annoncé.
- **L'historique.** Couche réalité : chaque opération avec un libellé clair, la mission, la date, le montant signé et son vrai statut.
- **Messages du Système** (`components/dashboardCandidat/notifications`).
  - Regroupés par jour, message complet.
  - Lien selon le type : offre reçue, relance d'offre, promotion de rang.
  - Non lus signalés en texte, pas seulement par la couleur.
  - « Tout marquer comme lu » partage le cache de la cloche.
- **La cloche.** Plus de clignotement, compteur plafonné à « 9+ ».
- Les pages gardent leur adresse et affichent les nouveaux composants.

**Vérification** : API locale, compte avec récompense scellée, récompense versée, récompense annulée, retraits en attente, versé et refusé ; retrait refusé avant l'envoi, refusé par l'API et réussi pour de vrai (solde en base) ; notifications de chaque type ; tout marquer comme lu et la cloche à jour ; clavier ; 375 px et animations réduites ; pas de régression sur le QG.

## Lot 6a : l'Éveil, inscription et connexion (plan détaillé du 17/11/2026)

Le parcours d'entrée : choix du profil, inscription, confirmation de l'adresse, connexion, mot de passe oublié et réinitialisation.

**Constats.**
- **Pas d'étiquettes.** Les champs n'ont qu'un texte d'exemple, qui disparaît pendant la saisie. Les erreurs ne sont pas liées aux champs.
- **Mot de passe.**
  - La règle diffère d'un écran à l'autre. La réinitialisation n'exige pas de minuscule.
  - Le profil accepte un mot de passe de 8 caractères sans autre règle, côté écran comme côté API.
  - Seule la connexion permet d'afficher le mot de passe saisi.
- **Messages.**
  - Les résultats passent par des fenêtres d'alerte (SweetAlert).
  - Les refus de l'API arrivent en anglais (« The email has already been taken. »).
  - Un lien de réinitialisation expiré donne une erreur sans issue.
- **Après l'inscription.** Le parcours s'arrête sur « vérifiez votre boîte mail », sans dire ce qui vient ensuite.
- **Chargement.** « Loading... » en anglais pendant le chargement de la réinitialisation.

**API (`fix/api-politique-mot-de-passe`, depuis `main`).** Reprend un travail resté en local depuis l'audit :
- `PasswordPolicy` : une seule règle, avec des messages en français, pour l'inscription, la réinitialisation et le changement depuis le profil (candidat et entreprise) ;
- trois réglages lus correctement quand leur valeur est vide dans le `.env` : `CORS_ALLOWED_ORIGINS`, `SESSION_SECURE_COOKIE` et `KKIAPAY_API_URL`.

**Front** (`components/auth`).
- **Un cadre commun** : une fenêtre du Système sur fond de nuit, le lien de retour et le titre. Plus de photo de fond, qui pesait lourd en 3G et rendait le texte difficile à lire.
- **Des champs complets** : étiquette, aide, erreur liée au champ, autocomplétion. Le mot de passe s'affiche ou se masque, et ses règles se cochent pendant la saisie (`lib/password.ts`, même règle que l'API).
- **Le choix du profil** : « Je cherche des missions » ou « Je recrute », chacun avec une phrase d'explication.
- **L'inscription.**
  - Erreurs de l'API traduites sous le bon champ.
  - Adresse déjà inscrite : renvoi de l'e-mail de confirmation proposé.
  - Après l'envoi, la suite en trois étapes : compte créé, adresse à confirmer (avec le renvoi), puis connexion et CV.
- **La connexion.**
  - Message clair pour des identifiants faux, un compte non confirmé (avec le renvoi) et trop de tentatives.
  - Redirection selon le rôle.
- **Le mot de passe oublié** : message affiché dans la page.
- **La réinitialisation.**
  - Lien incomplet ou expiré : explication et lien pour en demander un nouveau.
  - Réussite : lien vers la connexion.
- **L'adresse confirmée** : les prochaines étapes.
- Le changement de mot de passe du profil (lot 4a) suit la même règle.

**Vérification** : tests de l'API ; API locale : inscriptions candidat et entreprise réelles, refus de chaque champ, adresse déjà prise, connexion (identifiants faux, compte non confirmé, puis réussie), mot de passe oublié, réinitialisation réelle par le lien du journal, lien expiré ; clavier ; 375 px et animations réduites.

## Lot 6b : l'accueil public (plan détaillé du 17/11/2026)

La page d'accueil (`/`), avec l'en-tête et le pied de page communs aux pages publiques.

**Constats.**
- **Chiffres inventés.** « +2 400 jeunes actifs », « 92 % des inscrits gagnent leur premier salaire en moins de 7 jours », « 380 entreprises locales », « 7 jeunes diplômés sur 10 ». Aucun ne vient de la base.
- **Faux témoignages.** Trois jeunes, des montants et un CDI chez une vraie entreprise, notés cinq étoiles.
- **Logos de vraies entreprises.** MTN, Moov, SBEE, La Poste et Sobebra sont présentées comme clientes. Les images n'existent pas dans le dépôt : la section affiche six cadres vides.
- **Promesses fausses.** « Payé le jour même », « virement instantané », « Télécharge l'app », « Résultat garanti ». La récompense est en réalité versée à la validation de la mission, et il n'y a pas d'application mobile.
- **Pied de page.** Un numéro factice (+229 67 00 00 00), des réseaux sociaux qui mènent à `#`, et trois liens vers des pages qui n'existent pas (`/profil`, `/recrutement`, `/tarifs`).
- **En-tête.** Le bouton du menu mobile n'a pas de nom pour les lecteurs d'écran, et l'inscription n'est accessible que par la page de connexion.
- **Poids.** Une photo plein écran sur téléphone, et des animations à l'apparition de chaque bloc, même quand l'appareil demande moins d'animations.

**Front** (`components/accueil`).
- **« Le Système recrute. »** Une fenêtre du Système sur fond de nuit. Une phrase dit ce qu'est Jobsy, puis trois entrées : « Je cherche des missions », « Je recrute » et « Se connecter ».
- **Le jeu en quatre étapes**, toutes réelles :
  1. l'Éveil : le CV donne le rang de départ ;
  2. les donjons : formations, quiz, examen final et certificat, avec de l'XP ;
  3. les portails : missions ouvertes selon le rang, épreuve d'entrée ;
  4. le Trésor : récompense mise sous séquestre par l'entreprise, versée à la validation, retrait Mobile Money.
- **Les rangs, de E à S.** Le diplôme fixe le rang de départ, et l'XP fait monter.
- **Les dernières missions ouvertes**, tirées de `GET /public_missions` (trois au plus) : rang requis, entreprise, lieu et récompense. S'il n'y en a aucune, ou si l'API ne répond pas, un message le dit sans bloquer la page.
- **Pour les entreprises** : publier une mission, recevoir des candidats classés par rang et par score d'épreuve, déposer la récompense, valider la mission.
- **L'en-tête public** : le logo, les pages existantes, « Se connecter » et « Créer un compte ». Le menu mobile a un nom accessible.
- **Le pied de page** : seulement les pages qui existent, et le lien vers la page de contact.
- Plus de photo ni d'animation à l'apparition. Le balayage des fenêtres du Système reste, et il est coupé quand l'appareil demande moins d'animations.
- Les six sections remplacées sont supprimées.

**Hors lot.** Les pages publiques Missions, Formations, Entreprises et Contact gardent leur contenu, avec le nouvel en-tête et le nouveau pied de page. La page de contact affiche elle aussi des numéros factices et une adresse à confirmer. Gloria doit fournir les vraies coordonnées.

**Vérification** : API locale avec des missions réelles, puis sans mission, puis API arrêtée. Liens vers chaque entrée. Clavier et menu mobile. Pages Missions, Formations, Entreprises et Contact toujours lisibles sous l'en-tête. 375 px et animations réduites. Aucune erreur dans la console.

## Lot 7 : la Guilde, l'espace entreprise (plan du 18/11/2026)

L'espace entreprise compte environ 5 700 lignes. Il est découpé en cinq lots, chacun avec sa PR. Ils gardent tous la version sobre (décision 2) : les rangs et les fenêtres du Système servent de repères, sans effet de jeu.

| Lot | Contenu |
|---|---|
| 7a | Tableau de bord, en-tête, navigation, portefeuille (recharge et historique) |
| 7b | Missions : listes ouvertes et clôturées, création, modification, actions |
| 7c | Candidatures et matching : liste des candidats d'une mission, profil, invitations |
| 7d | Suivi des recrutés : offre, séquestre, validation et paiement |
| 7e | Profil de l'entreprise |

### Lot 7a : le tableau de bord de la Guilde (plan détaillé)

**Constats.**
- **Rang absent.** L'API ne chargeait pas le rang des candidats : toutes les candidatures affichaient « Rang Nouveau ». En revanche, elle renvoyait leur fiche complète, avec l'adresse et la date de naissance.
- **Chiffre faux.** « N talents ont été recrutés » affichait en réalité le nombre de candidatures.
- **Recharge.**
  - Un montant vide ou de moins de 100 FCFA partait quand même vers l'API, et la fenêtre se fermait avant la réponse.
  - La fenêtre n'avait ni étiquette liée au champ, ni Échap, ni focus gardé.
  - Après le paiement, rien n'indique que le solde se met à jour à la confirmation.
- **Page entière en erreur** si l'historique ne se charge pas.
- **Historique.** Tout ce qui n'est pas terminé s'affiche « Échoué ». Une récompense versée s'affiche avec un montant négatif sans explication.
- **Décor trompeur.** Une puce « VIP » sur la carte du portefeuille.
- **En-tête.**
  - Le logo mène à `/dashboard/entreprise`, une page qui n'existe pas (404).
  - Le menu mobile mène à `/dashboard/entreprises/listCandidateProfile`, qui n'existe pas non plus.
  - La cloche et le menu du compte n'ont pas de nom accessible et ne s'ouvrent pas au clavier.
  - L'icône du logo clignote sans fin.
- **Navigation.** Le bouton qui réduit le menu n'a pas de nom accessible, et la page en cours n'est pas annoncée. Faute de frappe : « Clotûrées ».

**API (`fix/api-tableau-guilde`, depuis `main`).** Pour les candidatures à traiter, l'API renvoie le rang, le nom, la ville et le titre de la mission, et rien d'autre. Pour les missions terminées, elle ajoute `hired_count`, le nombre de candidats recrutés. 2 tests.

**Front.**
- **Le tableau de bord.**
  - Les quatre compteurs de missions, chacun avec un libellé clair et un lien vers sa liste.
  - Les candidatures à traiter, avec l'emblème du rang.
  - Le portefeuille en FCFA exacts, avec les derniers mouvements dans la page.
  - Les missions terminées à relancer, avec le vrai nombre de recrutés.
- **La recharge.**
  - Une fenêtre accessible, qui vérifie le montant comme l'API (de 100 à 10 000 000 FCFA, nombre entier).
  - Les refus de l'API sont affichés.
  - Après l'ouverture du paiement, un message dit que le solde sera mis à jour dès la confirmation, avec un bouton pour l'actualiser.
- **Un historique qui ne se charge pas** ne bloque plus que son propre bloc.
- **L'en-tête** : liens réparés, cloche et menu du compte accessibles, plus d'animation en boucle, menu mobile dans une fenêtre accessible.
- **La navigation** : nom du bouton de réduction, page en cours annoncée (`aria-current`), libellés corrigés.

**Vérification** : tests de l'API ; API locale avec une entreprise qui a des missions ouvertes, désactivées et clôturées, des candidatures, une mission terminée et des mouvements ; recharge (montants refusés, refus de l'API, ouverture du paiement) ; historique en erreur ; clavier ; 375 px et animations réduites.

### Lot 7b : les missions de la Guilde (plan détaillé du 18/11/2026)

**Constats.**
- **Création impossible.** L'API exige l'urgence de la mission, mais le formulaire ne l'envoie pas : toute nouvelle mission est refusée, avec un message en anglais dans une bulle qui disparaît. La durée, montrée aux candidats, n'est pas demandée non plus.
- **Formulaire.**
  - Les étiquettes ne sont pas liées aux champs, et aucun champ n'est marqué obligatoire.
  - Les erreurs ne s'affichent pas sous le bon champ.
  - « Rémunération » n'a pas d'unité, et les exemples sont étrangers au Bénin (« Paris / Remote »).
  - Une mission relancée reprend sa date limite passée, que l'API refuse.
  - La page de création appelle `/missions/null` quand elle ne relance rien.
- **Listes.**
  - Un tableau à 6 colonnes déborde sur téléphone.
  - Le nombre de candidatures compte aussi les brouillons.
  - Toutes les actions sont cachées dans un menu « ⋯ » sans nom.
- **Actions.**
  - Après une suppression, la mission reste affichée jusqu'au rechargement.
  - Le message de désactivation est inversé : « Mission activée » quand on désactive.
  - Les confirmations passent par des fenêtres SweetAlert.
- **Notifications.** À la clôture, la notification et l'e-mail aux candidats non retenus partent en file d'attente, que rien ne traite en production. Ils n'arrivent jamais. C'est le cas de cinq notifications, dont celle du candidat retenu.

**API (`fix/api-notifications-immediates`, depuis `main`).** La notification dans l'application part tout de suite (`viaConnections`). Seul l'e-mail reste en file : il ne peut plus faire échouer la requête. Cela couvre cinq notifications : mission clôturée, candidat retenu, proposition acceptée, relances du candidat et de l'entreprise. 1 test.

**Front** (`components/dashboardEntreprise/missions`).
- **Des cartes de quête** à la place des tableaux, pour les missions ouvertes comme pour les missions clôturées. Chaque carte montre :
  - le statut écrit en toutes lettres et le rang minimum ;
  - la récompense et la date limite ;
  - les candidatures envoyées, sans les brouillons, et les recrutés ;
  - les actions en clair : candidatures, invitations, modifier, puis désactiver, clôturer ou supprimer, avec une confirmation accessible.
- **Recherche et filtre** (toutes, ouvertes, désactivées). La suppression groupée est gardée.
- **Le formulaire.**
  - Étiquettes liées, champs obligatoires marqués, règles de l'API vérifiées avant l'envoi, erreurs sous chaque champ.
  - Ajout de l'urgence et de la durée.
  - Nom de l'entreprise prérempli.
  - Avertissement quand un CDD ou un CDI est réservé aux rangs E ou D, qui ne voient que les missions ponctuelles.
  - Date limite à choisir de nouveau pour une relance.

**Vérification** : tests de l'API ; API locale : création réelle (refus de chaque champ, puis réussite), modification, relance d'une mission terminée, désactivation et réactivation, clôture (candidatures rejetées, notification enregistrée), suppression simple et groupée, refus d'une suppression de mission engagée ; recherche et filtre ; clavier ; 375 px et animations réduites.

### Lot 7c : les candidatures et le matching (plan détaillé du 18/11/2026)

Environ 2 000 lignes, découpées en deux PR :
- **7c-A** : la page des candidatures d'une mission (candidatures reçues, prise de service, candidats suggérés) et le dossier du candidat ;
- **7c-B** : le profil ouvert depuis les suggestions, l'envoi d'une invitation et la page des invitations.

#### 7c-A : les candidatures (plan détaillé)

**Constats.**
- **Page des candidatures.**
  - 330 lignes de code mort commenté.
  - La mission n'est pas nommée.
  - Le statut de chaque candidature (en attente, retenue, refusée) n'est pas affiché, et un candidat déjà retenu peut être coché de nouveau.
  - Les rangs E et D sont rebaptisés par des titres inventés (« Apprenti Junior », « Agent Certifié »).
  - Une candidature sans évaluation affiche un score vide. Les points forts et faibles de l'épreuve ne sont jamais montrés.
- **Prise de service.**
  - Le formulaire n'a ni étiquettes liées ni vérification. La validité de l'offre peut dépasser la date de prise de service.
  - Les invitations partent en boucle : si la deuxième échoue, la première est déjà envoyée, et la page ne dit pas laquelle a échoué. La liste n'est pas rechargée.
- **Candidats suggérés.**
  - L'API proposait des candidats d'un rang trop bas pour postuler, et des candidats qui avaient déjà postulé.
  - Les compétences communes ne s'affichaient jamais : la page lisait un champ qui n'existe pas (`matching_skills` au lieu de `matched`).
  - L'icône clignote sans fin.
- **Dossier du candidat.**
  - La page plante si le candidat n'a pas d'analyse de CV ou pas de rang.
  - Elle masque les expériences et les diplômes des rangs E et D.
  - Le bouton « Contacter » ne fait rien. Les coordonnées, visibles une fois que le candidat a postulé, ne sont jamais affichées.
  - « Failed to load » en anglais.

**API (`fix/api-matching-rang`, depuis `main`).** Les candidats suggérés sont limités à ceux qui peuvent postuler : la règle de rang est celle de la candidature, et ceux qui ont déjà postulé sont écartés. Chaque suggestion porte le rang. 1 test.

**Front** (`components/dashboardEntreprise/candidatures`).
- **L'en-tête** : la mission (titre, rang minimum, récompense, date limite) et un retour aux missions.
- **Les candidatures.**
  - Chaque carte affiche l'emblème du rang réel, le nom, la ville et le statut en toutes lettres.
  - Elle montre aussi le score d'épreuve et son niveau, ou « Évaluation en attente ». Le résumé, les points forts et les points faibles sont dans un détail repliable.
  - Le lien mène au dossier.
  - Recherche et filtre par statut. Seules les candidatures en attente peuvent être retenues.
- **La prise de service.**
  - Une fenêtre accessible, avec les règles de l'API vérifiées avant l'envoi et une validité de l'offre au plus tard le jour de la prise de service.
  - Le résultat est donné candidat par candidat, et la liste est rechargée.
- **Les candidats suggérés** : le rang, le pourcentage de correspondance, les compétences communes et manquantes, et le profil complet (inchangé jusqu'au lot 7c-B).
- **Le dossier du candidat.**
  - Les sections s'affichent dès qu'elles ont un contenu, quel que soit le rang.
  - Les coordonnées s'affichent quand l'API les rend visibles. Sinon, la page explique quand elles le deviennent.

**Vérification** : tests de l'API ; API locale : candidatures en attente, retenue et refusée, avec et sans évaluation ; prise de service (refus de chaque champ, validité après la prise de service), envoi réel à deux candidats dont un refusé par l'API ; suggestions (rang trop bas absent, compétences communes) ; dossier avec et sans CV, coordonnées visibles ou non ; clavier ; 375 px et animations réduites.

#### 7c-B : les invitations (plan détaillé du 19/11/2026)

**Constats.**
- **Le profil ouvert depuis les suggestions.**
  - Ce n'est pas une vraie fenêtre : le focus n'y reste pas, Échap ne la ferme pas et le bouton de fermeture n'a pas de nom.
  - Un candidat sans domaine renseigné reçoit le titre inventé « Apprenti Junior Jobsy », et son rang n'est pas affiché.
  - Si le profil ne se charge pas, la fenêtre reste vide, sans message.
  - Les certifications Jobsy n'ont pas de lien de vérification, alors que l'API le permet.
- **L'invitation.**
  - Les étiquettes du formulaire ne sont pas liées, et les règles de l'API (objet, message de 10 caractères au moins) ne sont pas vérifiées avant l'envoi.
  - Le message de réussite disparaît seul au bout de 2,5 secondes.
  - Rien n'indique qu'un candidat est déjà invité : un second envoi est refusé.
  - L'API accepte une invitation sur une mission désactivée ou clôturée, que le candidat ne pourra pas accepter.
  - Les retours à la ligne du message disparaissent dans l'espace du candidat, et l'e-mail affiche les apostrophes codées (« l&#039;offre »).
- **La page des invitations.**
  - La mission n'est pas nommée. Le statut de l'offre (envoyée, refusée, acceptée) se lit mal, et le bouton principal clignote sans fin.
  - L'API renvoie l'adresse e-mail de chaque candidat invité, même s'il n'a pas encore répondu ou s'il a refusé.
  - Le formulaire de prise de service ne vérifie que la date et l'heure. Il n'a pas d'étiquettes liées, et la validité de l'offre peut dépasser la prise de service.
  - « Modifier » reste proposé quand le candidat a déjà accepté l'offre, ce que l'API refuse.
  - Messages en bulles qui disparaissent, pagination par 6, jargon (« onboarding »).

**API (`fix/api-invitations`, depuis `main`).**
- Une invitation sur une mission désactivée ou clôturée est refusée, avec un message clair.
- La liste des invitations ne donne l'adresse e-mail du candidat qu'une fois l'invitation acceptée, comme les autres coordonnées.
- L'e-mail d'invitation affiche le message tel qu'il a été écrit (il est déjà nettoyé à l'enregistrement).
- Les suggestions et le profil complet ne renvoient plus de titre inventé quand le domaine est vide, et donnent le nom prénom d'abord, comme le reste de l'espace entreprise.
- Tests pour chaque point.

**Front.**
- **Le profil** : une fenêtre accessible (fenêtre de dialogue, titre, focus rendu au bouton d'origine) qui affiche :
  - le rang, les compétences et les badges équipés ;
  - les certifications Jobsy avec leur lien de vérification, les formations externes et les diplômes ;
  - un message clair avec « Réessayer » si le chargement échoue.
- **L'invitation** se rédige dans la même fenêtre.
  - Étiquettes liées et règles de l'API vérifiées avant l'envoi.
  - Le résultat reste affiché, et un candidat déjà invité est signalé avec la date et l'état de son invitation.
  - Les candidats suggérés déjà invités portent la mention « Invité ».
- **La page des invitations.**
  - Un en-tête avec la mission et un retour aux candidatures.
  - Des cartes par invitation : statut de l'invitation et de l'offre en toutes lettres, date d'envoi, message envoyé dans un détail repliable, lien vers le dossier.
  - Le filtre par statut et la recherche par nom.
  - L'adresse e-mail seulement quand l'API la donne.
  - La prise de service réutilise la fenêtre du lot 7c-A : mêmes règles, et préremplie quand on corrige une offre encore sans réponse. « Modifier » n'est proposé que dans ce cas, et « Envoyer une nouvelle offre » après un refus.
- **Côté candidat** : les retours à la ligne du message de l'entreprise sont gardés.

**Vérification** : tests de l'API ; API locale : invitation réelle depuis une suggestion (refus d'un message trop court, invitation enregistrée, mention « Invité », second envoi signalé) ; refus sur une mission clôturée ; page des invitations avec une invitation en attente, une refusée et une acceptée (adresse e-mail visible pour celle-ci seulement) ; prise de service sur l'invitation acceptée (refus de chaque champ, offre en base), modification d'une offre sans réponse ; message à la ligne dans l'espace du candidat ; clavier ; 375 px et animations réduites.

### Lot 7d : les recrutés (plan détaillé du 19/11/2026)

**Constats.**
- **Le paiement du candidat peut se perdre en route.**
  - « Valider et démarrer » lance la mission, puis tente de bloquer la récompense.
  - Si ce blocage échoue (solde disponible trop bas) ou si la fenêtre KkiaPay est fermée, la mission est en cours sans séquestre.
  - La page ne propose ensuite plus jamais de garantir la récompense, et l'API refuse la validation sans séquestre : le candidat ne peut pas être payé.
- Le front choisit entre portefeuille et KkiaPay d'après le solde total, alors que l'API compte le solde disponible (le solde moins les fonds déjà bloqués).
- « Recaler » agit au premier clic, sans confirmation.
- L'état du paiement (bloqué, payé, rendu) n'est jamais affiché, et les statuts s'affichent en anglais (« service_started », « in_progress »).
- Les offres sans réponse ou refusées sont mêlées aux recrutés.
- 295 lignes de code mort commenté ; fenêtres PrimeReact sans titre lié ; étoiles de notation peu accessibles ; messages en bulles qui disparaissent.
- **API.** La récompense peut être bloquée sur une offre que le candidat n'a pas acceptée, ou déjà terminée : les fonds resteraient bloqués sans moyen de les rendre. Un second paiement KkiaPay peut être lancé pour une récompense déjà bloquée.

**API (`fix/api-sequestre`, depuis `main`).**
- La récompense ne peut être bloquée que sur une offre acceptée et en cours (acceptée, prise de service, mission en cours, travail terminé), depuis le portefeuille comme après un paiement KkiaPay.
- Le paiement KkiaPay d'une mission est refusé si l'offre n'est pas en cours, ou si la récompense est déjà bloquée ou payée.
- Tests pour chaque point.

**Front** (`components/dashboardEntreprise/recrutes`).
- **L'en-tête** : la mission, un retour aux candidatures et le solde disponible.
- **Une carte par recruté** (offre acceptée) :
  - le statut en toutes lettres et la prise de service (date, heure, lieu) ;
  - la présence signalée, la ponctualité et la note ;
  - le contrat à télécharger.
- **Le paiement** est affiché sur chaque carte : non garanti, bloqué, payé (avec la commission) ou rendu. Tant qu'il n'est pas garanti, la carte propose de le garantir :
  - par un blocage sur le solde disponible, s'il suffit ;
  - sinon par un paiement KkiaPay, avec un bouton pour actualiser après la confirmation.
- **Confirmer la prise de service** : une fenêtre demande la ponctualité.
  - Quand le solde le permet, la récompense est bloquée d'abord. Si ce blocage échoue, rien n'est lancé.
  - Sinon la mission démarre quand même (le candidat est sur place), et la carte rappelle de garantir la récompense.
- **Ne pas retenir** : une confirmation qui dit que la récompense bloquée redevient disponible.
- **Valider le travail** : une note de 1 à 5 (boutons radio) et un avis facultatif de 2 000 caractères au plus. Ce n'est proposé qu'une fois la récompense garantie ; sinon la carte explique pourquoi.
- **Les offres sans réponse** sont comptées, avec un lien vers les candidatures.

**Vérification** : tests de l'API ; API locale : recrutés dans chaque état ; garantie par le solde (solde et séquestre en base) ; prise de service confirmée (blocage puis démarrage, contrat généré et téléchargé) ; candidat non retenu (séquestre rendu) ; validation avec note et avis (candidat payé, commission, mission terminée) ; validation impossible sans garantie ; paiement KkiaPay ouvert quand le solde ne suffit pas (passerelle simulée), puis séquestre constaté après actualisation ; clavier ; 375 px et animations réduites.

### Lot 7e : le profil de l'entreprise (plan détaillé du 19/11/2026)

**Constats.**
- **La présentation s'affiche avec ses balises.** L'éditeur l'enregistre en HTML, et la page la montre comme du texte (« <p>…</p> »).
- **Les enregistrements trompent.**
  - Chaque formulaire se ferme avant la réponse de l'API.
  - En cas de refus, une bulle disparaît, et la page affiche les valeurs refusées comme si elles étaient enregistrées.
  - En cas de réussite, la page réaffiche un instant les anciennes valeurs.
- **L'API refuse sans explication.** Le site web doit être une adresse complète (https://…), et les réseaux sociaux aussi. Le front ne le dit pas, et le refus arrive en anglais.
- Les icônes des réseaux sociaux mènent à « # » quand le lien est vide, et n'ont pas de nom accessible.
- La fenêtre des réseaux sociaux n'est pas une vraie fenêtre de dialogue.
- **Le logo.** N'importe quel fichier est envoyé (l'API n'accepte que JPG, PNG ou WebP de 2 Mo au plus), et l'image est cassée tant qu'il n'y a pas de logo.
- Les champs n'ont pas d'étiquettes liées, et le téléphone non plus.
- **Mot de passe.** Pas d'étiquettes, aucune règle affichée, des champs qui ne se vident pas après la réussite.
  - Le travail en cours sur les mots de passe (règle commune, champ avec « afficher ») est repris ici, comme au lot 6a pour le candidat.
- **API.** Le nom de l'entreprise peut être vidé, alors qu'il s'affiche sur les missions et dans les invitations. Les coordonnées n'ont pas de longueur maximale : au-delà de 255 caractères, la base refuse l'écriture et l'API répond par une erreur.

**API (`fix/api-profil-entreprise`, depuis `main`).**
- Le nom de l'entreprise ne peut plus être vidé ; l'envoi du seul logo reste possible.
- Les coordonnées sont limitées à 255 caractères, la taille de leurs colonnes.
- Tests pour chaque point.

**Front** (`components/dashboardEntreprise/profil`).
- **L'en-tête** : le logo (ou les initiales), le nom, le secteur et la ville.
  - « Changer le logo » vérifie le type et la taille avant l'envoi.
  - Le résultat s'affiche dans la page.
- **Trois cartes à modifier** : les informations de l'entreprise, la présentation, et les coordonnées avec les réseaux sociaux.
  - Chacune passe de la lecture à un formulaire avec étiquettes liées.
  - Les règles de l'API sont vérifiées avant l'envoi, et le formulaire ne se ferme qu'après la réussite.
  - Les refus s'affichent sous chaque champ, en français.
- **La présentation** s'affiche mise en forme, et se modifie avec le même éditeur que les missions.
- **Les réseaux sociaux** ne s'affichent que s'ils sont renseignés, sous forme de liens nommés.
- **Le mot de passe** reprend la règle commune (`lib/password`) et le champ avec « afficher » (`PasswordInput`).
  - Les erreurs s'affichent sous chaque champ, par exemple un mot de passe actuel incorrect.
  - Les champs se vident après la réussite.

**Vérification** : tests de l'API ; API locale : affichage d'un profil complet et d'un profil vide ; logo refusé (type, taille) puis envoyé ; informations (nom vide et site sans https refusés, enregistrement réel) ; présentation mise en forme ; coordonnées et réseaux (refus, enregistrement, liens) ; mot de passe (règle, confirmation, mot de passe actuel faux, réussite puis connexion avec le nouveau) ; clavier ; 375 px et animations réduites.

## Décisions prises le 17/10/2026

1. Le concept « deux couches » (réalité claire, fenêtres du Système sombres par-dessus) est la direction.
2. L'espace entreprise reçoit une version sobre (rangs et cartes de quête, sans effets) et l'administration n'est pas gamifiée.
3. Le rang monte avec l'XP réelle, et le diplôme ne fixe que le rang de départ (lot B1, côté API), sous réserve de l'accord de Gloria.
4. **Vitalité (décision du porteur).**
   - Elle ne baisse qu'à partir du 15e jour d'absence : −5 par jour, sans descendre sous 20.
   - Pour la restaurer, le jeune dépense des jetons et réussit une courte révision. La vitalité revient alors à 100.
   - La révision compte 5 questions : 3 tirées des formations de base de savoir-être, 2 sur le type de mission visée.
   - Une vitalité basse sert à l'affichage et aux rappels seulement : elle ne bloque rien et ne réduit pas la visibilité du profil.
   - Les formations de base de savoir-être sont une source de revenu pour Jobsy.
   - Lots C1 et J1 à J4.
5. **Jetons.** Ils se gagnent par l'activité réelle et s'achètent en packs par KkiaPay.
6. Je partage ce plan avec Gloria avant le lot 1, car elle travaille en ce moment sur le tableau de bord. Il est dans la PR du lot 0.
7. Le travail se fait dans un second dossier (git worktree) basé sur le dernier `main`, pour ne pas toucher au travail en cours sur les mots de passe.
8. Le travail sur les mots de passe part dans sa propre PR, séparée de la refonte, quand il sera prêt.
9. Pas d'images générées par IA payantes au départ : formes CSS et SVG, plus les photos existantes. Une génération ne se fait qu'avec un devis validé.
10. Pas de sons pour l'instant.
11. Le succès se mesure par un test avec 5 jeunes et par les chiffres de la base fournis par Gloria (critères 1 et 2).

## Hypothèses retenues

1. Les jeunes utilisent surtout un téléphone Android, souvent en 4G ou en 3G.
2. Le vocabulaire de jeu reste en français : « quête », « portail », « rang », « guilde », « Système ».
3. Les rangs gardent les lettres E → S et leurs couleurs actuelles.
4. On ne retire pas MUI, PrimeReact et Flowbite pendant la refonte. Les nouveaux écrans utilisent le kit, et le nettoyage des bibliothèques est une décision à part.
5. La structure des URL ne change pas. Seuls les intitulés de la navigation changent.
6. Une révision ratée peut être refaite une fois sans dépenser de nouveaux jetons.
7. Les jetons n'expirent pas et ne se transfèrent pas entre comptes.

## Barème des jetons proposé (17/10/2026, à valider par Gloria)

Trois principes guident ce barème :
- **Une seule révision par retour.** La vitalité ne baisse qu'après 14 jours d'absence et une révision réussie la remet à 100.
- **La révision est gratuite pour un jeune actif.** Une mission validée ou deux formations terminées rapportent de quoi en payer une.
- **De petits montants ronds**, faciles à payer en Mobile Money.

| Élément | Proposition | Pourquoi |
|---|---|---|
| Coût d'une révision | **10 jetons** | Une révision réussie remet la vitalité à 100. Une révision ratée peut être refaite une fois sans payer |
| Bienvenue (profil complété, CV analysé) | **+10 jetons**, une seule fois | La première révision est offerte |
| Mission validée par la guilde | **+10 jetons** (en plus des 250 XP existants) | Une mission réelle paie une révision |
| Formation terminée | **+5 jetons** | Deux formations paient une révision |
| Pack Éclaireur | **10 jetons = 200 FCFA** (20 FCFA le jeton) | Une révision |
| Pack Aventurier | **30 jetons = 500 FCFA** (environ 16,7 FCFA le jeton, −17 %) | Trois révisions |
| Pack Champion | **70 jetons = 1 000 FCFA** (environ 14,3 FCFA le jeton, −29 %) | Pour les absences répétées |

Ce que le barème évite volontairement :
- **Gagner des jetons en se connectant ou en postulant.** On pourrait les accumuler sans rien accomplir, et ça encouragerait les candidatures en masse.
- **Un abonnement.** Le paiement reste ponctuel.

Garde-fou à l'achat : avant de payer, le Système affiche le solde. Si le jeune a déjà de quoi faire une révision, il le dit au lieu de pousser à acheter.

Repères à confirmer :
- 200 FCFA représentent environ 0,4 % du SMIG de 52 000 FCFA par mois (montant en vigueur depuis 2023 selon WageIndicator, à vérifier dans le décret).
- Les frais KkiaPay sur Mobile Money seraient d'environ 1,5 à 2,2 % (estimation non officielle, à vérifier dans le contrat marchand). Il faut aussi vérifier le montant minimum d'un paiement KkiaPay, et s'il existe des frais fixes qui rendraient le pack à 200 FCFA peu rentable.

## Zones floues (à préciser au moment du lot concerné)

- **Validation du barème des jetons** (lots J1 et J2) : la proposition ci-dessus est à valider par Gloria.
- **Prix des formations de base** (lot C1) : c'est la principale source de revenu prévue. Ces prix sont à fixer à part.
- **Conditions de vente des jetons** (lot J2) : il faut des conditions générales de vente et une règle de remboursement avant de vendre quoi que ce soit. C'est à faire relire par une personne compétente au Bénin.
- **Contenu des formations de base** (lot C1) : il est écrit par l'équipe. Le lot J3 ne peut pas sortir sans au moins une formation de base et ses questions.
- Les **statistiques de la fenêtre de statut** (lot 4a) : quelles données réelles alimentent la fiabilité, la réputation et le savoir ? Il existe peut-être des avis d'entreprises ; à vérifier dans l'API.
- Les **quêtes du jour** (lot 1) : faut-il les calculer côté front à partir des données existantes, ou créer un point d'API dédié ?
- Les **seuils de rang** (lot 1 ou B1) : aucune route d'API ne liste les rangs. `lib/progression.ts` recopie `RankSeeder` en attendant. Une route `GET /ranks` éviterait un écart si les seuils changent en base.

## Journal des décisions

- D1 : on construit sur la gamification existante (rangs, badges, vitalité, inventaire) au lieu de la remplacer. Elle est en base et Gloria y travaille.
- D2 : compétence `frontend-design` (Anthropic, Apache 2.0) installée dans `~/.claude/skills/` pour guider la direction visuelle. La base de données de UI/UX Pro Max n'est pas synchronisée sur ce PC : seules ses règles d'ergonomie sont utilisées.

- D3 (17/10/2026, porteur) : la vitalité baisse après 14 jours d'absence et se restaure par une révision payée en jetons. Les jetons se gagnent et s'achètent. Une vitalité basse ne bloque rien. Cette décision remplace le lot B2 « vitalité sans punition » par les lots C1 et J1 à J4.

- D4 (lot 0) : pas de « niveau » séparé à l'intérieur d'un rang pour l'instant. La barre de progression vers le rang suivant joue ce rôle, et un seul axe de progression est plus facile à comprendre (critère 1). Cette décision est facile à revoir au lot 4a si le test avec les jeunes le demande.
- D5 (lot 0) : les nouvelles polices (`font-systeme`, `font-lisible`) ne servent qu'aux écrans refondus. La police de base du site (Geist) ne change pas avant que tous les écrans soient passés au kit.
- D6 (lot 1) : le QG est un nouveau composant (`components/dashboardCandidat/qg/`). `DashboardHome.tsx` n'est plus affiché, mais il n'est ni modifié ni supprimé. Gloria travaille dessus, ce qui évite les conflits, et sa suppression reste sa décision.
- D7 (lot 1) : l'en-tête et la navigation candidat ne changent pas encore. Renommer « Missions » en « Portails » avant que l'écran des missions soit refait créerait une incohérence. Chaque intitulé changera avec son lot, et la navigation sera refaite au lot 8.
- D8 (lot 1) : les quêtes du jour sont calculées côté front, à partir des routes existantes, par une fonction pure (`components/dashboardCandidat/qg/quetes.ts`). Une route d'API dédiée ne se justifiera que si les règles deviennent trop lourdes pour le navigateur.
- D9 (lot 2a) : la navigation garde « Missions », un mot clair pour un nouvel utilisateur (couche réalité). « Portail » n'apparaît que dans les fenêtres du Système. Cette décision complète D7.
- D10 (lot 2a) : le badge de correspondance IA (`MissionMatchBadge`) ne s'affiche que dans le détail d'une mission. Il fait un appel d'API par mission, et sur la liste cela faisait autant d'appels que de cartes, ce qui coûte cher en 3G.
- D11 (lot 2a) : une mission dont la date limite est passée n'est plus affichée dans la liste. Le porteur a décidé le 18/10/2026 que l'API la refuse aussi (branche `fix/api-candidature-date-limite`) :
  - plus de candidature démarrée ni de brouillon envoyé après la fin du jour limite ;
  - une candidature reçue à temps peut toujours compléter son étape technique.
- D12 (lot B1) : en plus du rang qui monte à chaque gain d'XP, une migration de rattrapage met à niveau, une seule fois, les candidats qui avaient déjà assez de score. En complément, le profil d'un candidat validé se charge même sans analyse de CV. Il répondait 404, ce qui mettait tout le tableau de bord en erreur.
- D13 (lot 2b) : l'enchaînement des étapes suit la réponse de l'API (questions techniques renvoyées ou non), et non une supposition du front sur le rang. L'indicateur annonce le nombre d'étapes avec la même règle que l'API.
- D14 (lot 2b) : on ne revient jamais sur une étape déjà envoyée. À l'intérieur de l'étape technique, on peut revenir à une question précédente tant que rien n'est envoyé.
- D15 (lot 2b) : les réponses non envoyées sont gardées dans le navigateur (`localStorage`, une clé par candidature) et effacées après l'envoi. C'est un confort : l'écran fonctionne aussi sans.
- D16 (lot 2b) : les anciens composants de candidature (`IntroStep`, `MotivationStep`, `TechnicalStep`, `AIProcessing`, `CompletionStep`, `ProgressBar`) ne sont plus utilisés, mais ils ne sont pas supprimés. Supprimer des fichiers de l'équipe demande l'accord de Gloria (même principe que D6).
- D17 (lot 2c) : accepter une proposition reste possible après la date limite de la mission. C'est une invitation directe de l'entreprise, et la règle de la décision D11 vise les candidatures spontanées. En revanche, une mission fermée (inactive ou clôturée) refuse l'acceptation.
- D18 (lot 2c) : la page des invitations est une nouvelle adresse (`/dashboard/candidats/invitations`). On l'atteint depuis le QG et les quêtes du jour. Elle n'apparaît pas encore dans la navigation, qui sera refaite au lot 8 (D7).
- D19 (lot 2c) : le montant net affiché au candidat (récompense moins la commission Jobsy de 10 %, arrondie au franc) est calculé dans le front, avec la règle de `WalletService` (`lib/recompense.ts`). Si le taux change dans l'API, ce fichier doit suivre. Une route qui renvoie le net éviterait cet écart.
- D20 (lot 2c) : les messages de refus de l'API des offres vouvoient le candidat (« Vous avez déjà répondu à cette offre. ») et le suivi répond « Action impossible ». Le front affiche ses propres messages selon le code de la réponse (409, 410, 403) au lieu de les recopier.
- D21 (lot 2c) : le journal de quêtes n'a plus de recherche ni de pagination. Un candidat a peu de missions confirmées, et les missions terminées sont listées en version compacte. À revoir si les listes s'allongent.
- D22 (lot 2c) : l'ancien hook `useCountdown` n'est plus utilisé, mais il n'est pas supprimé (même principe que D16).
- D23 (lot 3a) : la carte du donjon reprend l'adresse existante `/formations/{id}/modules`, une page à laquelle rien ne menait (hypothèse 5 : les adresses ne changent pas). On y arrive depuis le catalogue.
- D24 (lot 3a) : la carte n'affiche que le plan du donjon. Le contenu des leçons et les quiz restent dans l'espace de formation, après inscription (lot 3b). L'API ne renvoie donc plus qu'un résumé par module.
- D25 (lot 3a) : les types gardent les noms de l'administration (Standard, Logistique, Expert), chacun expliqué en une phrase. Le jeune doit savoir avant d'entrer si la formation demande un kit livré ou un projet final.
- D26 (lot 3a) : les seuils (80 % pour un quiz, 75 % pour l'examen final), le délai de 24 h et les 2 tentatives du projet viennent de l'API (constantes de `CourseWorkspaceController` et `UserExamSession`). Le front ne les recopie pas.
- D27 (lot 3b-B2) : les critères de notation du jury sont montrés au candidat avant et pendant le projet. L'API les renvoyait déjà. Savoir ce qui est noté aide à réussir, et ne donne aucune réponse.
- D28 (lot 3b-B2) : le chrono du projet suit l'heure du serveur, et non celle du téléphone. L'API refuse l'envoi automatique et la copie blanche avant la fin de la grâce. Un téléphone mal réglé ne fait donc plus perdre de tentative.
- D29 (lot 3b-B2) : le brouillon gardé dans le navigateur est propre à chaque tentative (une clé par session et par numéro de tentative). Le brouillon enregistré par l'API reste la référence, et le brouillon local ne sert que s'il est vide.
- D30 (lot 4a) : les statistiques de la fenêtre de statut sont la réputation (note moyenne des entreprises), la ponctualité (arrivées à l'heure) et le savoir (formations certifiées), calculées dans le front à partir des candidatures et des inscriptions déjà chargées. Sans donnée, elles le disent, au lieu d'afficher un chiffre inventé.
- D31 (lot 4a) : les titres équipés s'affichent sans leur « bonus » (« +15 % Confiance Recruteur ») : rien dans l'API ne l'applique, ce serait une promesse fausse. L'inventaire et l'équipement restent au lot 4b.
- D32 (lot 4a) : le dossier reste dans la couche réalité, avec des mots simples (téléphone, CV), car un jeune doit savoir exactement ce qu'il remplit.
- D33 (lot 4b) : l'inventaire lit les titres dans `/candidate/inventory`, les diplômes et certifications externes dans `/candidat/profile`, et les certificats Jobsy dans `/courses/my-learnings`, qui donne le lien de vérification. Les copies des documents répétées dans chaque badge ne sont plus utilisées.
- D34 (lot 4b) : la limite de 5 titres équipés est recopiée dans le front, comme la commission en D19 : l'API la fixe dans `BadgeController` sans la renvoyer. Si elle change, `inventaire/regles.ts` doit suivre. Le refus de l'API reste affiché.
- D35 (lot 4c) : la réévaluation réutilise la notification `rank_promoted` du lot B1 au lieu d'un nouvel état en base : la fenêtre s'ouvre tant que cette notification n'est pas lue. La fenêtre vit sur le QG seulement, la page où le candidat arrive.
- D36 (lot 6a) : les pages de connexion et de mot de passe servent aussi aux entreprises : elles vouvoient, comme avant. L'inscription du candidat aussi, pour rester cohérente avec la connexion.
- D37 (lot 6a) : le lot 6a passe avant les jetons (J1 à J4), dont le barème et les prix attendent Gloria. La « révélation du rang » de l'Éveil reste la quête du CV et la réévaluation (lot 4c). Une notification de rang après l'analyse du CV et la validation viendra plus tard.
- D38 (lot 6b) : l'accueil ne montre ni chiffre, ni témoignage, ni logo d'entreprise tant qu'ils ne viennent pas de la base ou d'un accord écrit. Les coordonnées de contact du pied de page sont retirées en attendant les vraies, que Gloria doit fournir.
- D39 (lot 7) : l'espace entreprise est découpé en cinq lots (7a à 7e), un par écran ou groupe d'écrans, chacun avec sa PR, comme les lots 2 et 3.

## Avancement

| Lot | Statut | PR | Vérification |
|---|---|---|---|
| Plan | Validé le 17/10/2026 | — | — |
| 0 | Fusionné le 17/10/2026, déployé, `/systeme` en ligne | #5 | Types et build verts, captures du catalogue `/systeme` à 375 px et 1280 px |
| 1 | Fusionné le 18/10/2026 | #9 | Types, lint et build verts. API locale (SQLite) avec deux comptes : un compte actif qui déclenche chaque quête, un compte neuf. Captures à 375 px, à 1280 px et avec animations réduites : aucun débordement, aucune erreur dans la console, aucun lien cassé |
| B1 | Fusionné le 18/10/2026 (back seul) | #8 | 8 tests ajoutés (`RankProgressionTest` et `ProfileRankTest`), qui échouent sans le changement. Suite complète : 97 tests |
| Date limite | Fusionné le 18/10/2026 (back seul) | #7 | 5 tests ajoutés (`ApplicationDeadlineTest`) : les 3 cas de refus échouent sans la règle. `MissionFactory` corrigée (sa date figée au 31/10/2026 aurait fait échouer les tests à partir de novembre). Suite complète : 94 tests |
| 2a | Fusionné le 18/10/2026 | #10 | Types, lint et build verts. Règles testées sur des cas types. API locale avec 12 missions (rangs E à B, CDI et CDD, missions passées), deux comptes. Vérifié : verrous et manques d'XP exacts, recherche sans accents, règle CDI/CDD, missions passées masquées. Détail au clavier : focus gardé, Échap, retour du focus sur le bouton. Pas de « Postuler » sur un portail verrouillé. L'épreuve d'entrée mène à la candidature. À 375 px : aucun débordement, fenêtre à 16 px des bords. Aucune erreur dans la console, aucun lien cassé |
| 2b | Fusionné le 25/10/2026 | #11 | Types, lint et build verts. API locale, 3 comptes (rangs D, E, C), notation en file d'attente. 24 contrôles automatiques réussis : 3 parcours complets (rang D en mission ponctuelle, rang C en mission ponctuelle, rang C en CDD) ; 4 refus d'avance (verrou, date passée, déjà postulé, reprise d'un brouillon) ; réponses retrouvées après rechargement ; refus 410 et coupure réseau affichés, réponses gardées, « Réessayer » qui fonctionne ; focus au titre de chaque étape ; statut « en attente » en base après l'envoi ; brouillons effacés. À 375 px et avec animations réduites : aucun débordement, aucune erreur dans la console. Pas de régression sur le QG ni sur les portails |
| Réponse aux propositions | Fusionné le 25/10/2026 (back seul) | #12 | 8 tests ajoutés (`CandidatProposalResponseTest`) : acceptation, refus, autre candidat, double réponse, mission fermée, liste qui indique la mission fermée, liens de l'e-mail. Tous échouent sans le changement. Suite complète : 100 tests |
| 2c | Fusionné le 25/10/2026 | #13 | Types, lint et build verts. API locale réunie (4 branches d'API) et un compte dédié. 81 contrôles automatiques réussis : invitations acceptées et déclinées pour de vrai, mission fermée (pas d'« Accepter », refus possible), quêtes du jour dans le bon ordre ; offre acceptée, déclinée avec confirmation, expirée, introuvable ; journal à cinq étapes avec arrivée signalée, présence confirmée par l'entreprise via la vraie route (contrat généré et téléchargé), puis travail terminé ; montants nets exacts ; erreurs 403, 409, 410 et coupures réseau affichées ; focus rendu au bon endroit (Échap, Annuler, après chaque réponse) ; statuts vérifiés en base. À 375 px et avec animations réduites : aucun débordement, aucune animation en boucle, aucune erreur dans la console. Pas de régression sur le QG ni sur les missions |
| API réunie | Les 4 branches d'API fusionnées localement, à titre de vérification | — | 113 tests, aucun conflit |
| Carte des modules | Fusionné le 02/11/2026 (back seul) | #15 | 6 tests ajoutés (`CourseMapTest`) : pas de contenu ni de réponse de quiz, résumé dans l'ordre, avancement d'un inscrit, quiz raté, formation désactivée, boss Expert. Tous échouent sans le changement. Suite complète : 119 tests |
| 3a | Fusionné le 02/11/2026 | #16 | Types, lint et build verts. API locale avec 8 formations des trois types et un candidat dans chaque état. 50 contrôles automatiques réussis : donjons en cours triés par urgence, formations désactivées (suivie visible, jamais suivie absente), recherche sans accents ni tiret, filtres ; carte : salles franchie, en cours et à venir conformes aux leçons et aux quiz, seuils et règles du boss venus de l'API, kit en livraison, certifié, boss prêt, non vaincu, introuvable ; inscription réelle (Expert numérique, Expert avec kit) et erreur simulée ; aucune réponse de quiz ni contenu de leçon dans les 8 réponses de la carte reçues. À 375 px et avec animations réduites : aucun débordement, aucune animation en boucle, aucune erreur dans la console. Pas de régression sur le QG |
| Salles (API) | Fusionné le 02/11/2026 (back seul) | #17 | 3 tests ajoutés (`CourseRoomsTest`) : choix multiple annoncé sans les réponses, seuil, leçon fermée tant que le kit n'est pas livré. Les 2 premiers échouent sans le changement. Suite complète : 122 tests |
| 3b-A | Fusionné le 02/11/2026 | #18 | Types, lint et build verts. API locale. 31 contrôles automatiques réussis : ouverture sur la première étape non terminée, étape fermée expliquée, leçons texte et PDF (fichier réel), focus au titre de chaque étape, combat (seuil annoncé, choix unique ou multiple), réponses manquantes, échec sans fausse correction, retenter, victoire avec correction, le dernier combat mène au boss sans bascule automatique, formation à 100 % en base, coupure réseau. À 375 px et avec animations réduites : aucun débordement, aucune animation en boucle, plan atteignable au clavier, aucune erreur dans la console. Lot 3a toujours à 50 contrôles sur 50 |
| 3b-B1 | Fusionné le 02/11/2026 | #19 | Types, lint et build verts. Aucun changement d'API. API locale. 32 contrôles automatiques : accueil du boss avec les règles de la carte, choix unique, réponses manquantes, réponse « bloquée » sans plantage, compteur exact, échec (score, règle, prochaine tentative, plus de fausse promesse), délai (compte à rebours réel, un seul en-tête, salles à réviser, aucune animation en boucle), échec vieilli de 25 h puis victoire, certificat (XP, lien public copié, copie refusée, PDF téléchargé, page de vérification), boss fermé (403), kit en préparation puis livré par l'admin et réception confirmée. 375 px sans débordement. Salles (31) et donjons (50) toujours verts. Deux exécutions se sont arrêtées sur une attente au même endroit avant deux exécutions complètes : la page était correcte au diagnostic, cause non prouvée (lenteur du serveur de test) |
| Projet pratique (API) | Fusionné le 05/11/2026 (back seul) | #20 | 6 tests ajoutés (`ProjectDeadlineTest`) : sujet réservé aux inscrits, échéances et heure du serveur, copie blanche refusée avant la fin de la grâce et sans limite de temps, envoi automatique refusé avant la fin de la grâce, message lisible sur un refus de validation. Tous échouent sans le changement. Suite complète : 119 tests. Se fusionne sans conflit avec les autres branches d'API |
| 3b-B2 | Fusionné le 10/11/2026 | #21 | Types, lint et build verts. API locale réunie (salles + projet). 63 contrôles automatiques : accueil (règles, livrables, critères, XP), démarrage, chrono, focus ; brouillon enregistré, échec annoncé puis « Réessayer » ; livrables manquants, focus sur le premier ; fichier refusé (format, taille, refus de l'API), envoyé, consultable et remplacé, bouton atteint au clavier ; refus de l'API sous le bon livrable ; confirmation et Échap ; copie chez le jury ; correction en échec par l'admin (vraie route), compte à rebours, délai vieilli, 2e et dernière tentative avec des livrables vides, réussite et certificat ; grâce puis envoi automatique du brouillon ; copie blanche ; tentatives épuisées ; projet absent ; coupure réseau ; horloge du navigateur en avance d'une heure sans tentative perdue. 375 px et animations réduites : aucun débordement, aucune animation en boucle, aucune erreur dans la console. Boss en QCM (32), salles (31) et donjons (50) toujours verts |
| 4a | Fusionné le 14/11/2026 | #24 | Types, lint et build verts. Aucun changement d'API. API locale (code de `main`), 2 comptes. 64 contrôles automatiques : statistiques comparées à la base (missions, réputation, ponctualité, formations), aucune statistique inventée pour un candidat neuf, pas de fausse validation, puis validation réelle de l'admin ; informations et contact modifiés, annulés, refusés (avant l'envoi et par l'API), coupure réseau, enregistrés en base ; CV refusé, envoyé, remplacé, supprimé ; diplôme en double, ajout et suppression ; certification ; mot de passe trop court, faux, changé, puis connexion réelle ; focus à chaque étape, boutons de fichier au clavier. 375 px et animations réduites : aucun débordement, aucune animation en boucle, champs en 16 px, aucune erreur dans la console. QG contrôlé après le partage du bloc de rang |
| 4b | Fusionné le 14/11/2026 | #25 | Types, lint et build verts. Aucun changement d'API. API locale (code de `main`), 2 comptes, titres de test supprimés après la vérification. 36 contrôles automatiques : candidat neuf (aucun titre, conditions et progression, documents vides, aucun bonus) ; candidat avec 6 titres débloqués : équiper, limite de 5 expliquée sans requête, retirer, clavier, refus de l'API et coupure réseau sans changement en base, focus qui suit le titre ; titres, progression et documents comparés à la base ; fichiers consultables ; page de vérification du certificat ouverte ; inventaire indisponible. 375 px et animations réduites : aucun débordement, aucune animation en boucle, aucun texte sous 14 px, aucune erreur dans la console. Fenêtre de statut toujours à 64 contrôles sur 64 |
| Réévaluation (API) | Fusionné le 15/11/2026 (back seul) | #27 | 3 tests ajoutés (`RankReevaluationTest`) : promotion enregistrée sans file d'attente, une seule notification lue, notification d'un autre introuvable. Les 2 premiers échouent sans le changement. Suite complète : 138 tests |
| 4c | Fusionné le 15/11/2026 | #28 | Types, lint et build verts. API locale. 13 contrôles automatiques : aucune fenêtre sans promotion, promotion réelle par l'XP, contenu de la fenêtre, focus gardé, « Continuer » (promotion lue, autre notification intacte), pas de retour au rechargement, double promotion en une fenêtre, Échap, lecture en échec, « Voir les missions ». 375 px et animations réduites : fenêtre dans l'écran, aucune animation en boucle, aucune erreur dans la console |
| 5 | Prêt sur `design/lot-5-tresor` (depuis `main`) | — | Types, lint et build verts. Aucun changement d'API. API locale, 2 comptes. 29 contrôles automatiques : soldes et historique conformes aux opérations en base (récompense versée, scellée, annulée ; retraits versé, en cours, refusé) ; retrait : Échap et focus rendu, champs manquants, minimum, solde dépassé, refus de l'API, retrait réel enregistré en base avec solde à jour ; solde vide sans bouton ; messages : non lus en texte, message complet, liens par type, regroupement par jour, cloche annoncée puis mise à jour sans recharger après « Tout marquer comme lu » ; QG sans réévaluation pour une promotion déjà lue. 375 px et animations réduites : aucun débordement, fenêtre dans l'écran, aucune animation en boucle (logo de l'en-tête corrigé), aucune erreur dans la console |
| Mot de passe (API) | Prêt sur `fix/api-politique-mot-de-passe` (back seul, depuis `main`) | — | 3 tests ajoutés (`PasswordPolicyTest`), qui échouent tous sans le changement. Suite complète : 149 tests |
| 6a | Prêt sur `design/lot-6a-eveil` (depuis `main`, après l'API du mot de passe) | — | Types, lint et build verts. API locale. 31 contrôles automatiques : choix du profil, étiquettes, champs manquants et focus, règles cochées, mot de passe affichable, inscriptions candidat et entreprise réelles en base, adresse déjà prise (message en français et renvoi), connexion (identifiants faux, compte non confirmé, confirmation par le lien du journal, réussite), règle appliquée au profil, mot de passe oublié, réinitialisation réelle puis lien déjà utilisé et lien incomplet, connexion avec le nouveau mot de passe. 375 px et animations réduites : aucun débordement, aucune animation en boucle. Lot 4a toujours à 64 contrôles sur 64 |
| 6b | Prêt sur `design/lot-6b-accueil` (empilé sur le lot 6a) | — | Types, lint et build verts. Aucun changement d'API. API locale. 36 contrôles automatiques : un seul titre, aucun chiffre, témoignage, logo ni promesse inventés, aucune image ; quatre étapes et six rangs ; les trois dernières missions de l'API dans l'ordre, montant exact ; entrées candidat, entreprise et connexion ; 9 liens internes vivants, plus de « # » ; clavier ; Missions, Formations, Entreprises et Contact lisibles sous l'en-tête à 1280 et 375 px ; menu mobile (nom, Échap, focus rendu) ; aucune mission ; API injoignable ; 375 px et animations réduites ; aucune erreur dans la console |
| API 7a | Prêt sur `fix/api-tableau-guilde` (depuis `main`) | — | Candidatures à traiter : rang chargé, fiche limitée au nom, à la ville et au rang. Missions terminées : `hired_count`. 2 tests, qui échouent sans la correction. Suite : 148 tests |
| 7a | Prêt sur `design/lot-7a-guilde` (empilé sur le lot 6b) | — | Types, lint et build verts. API locale avec l'API 7a. 33 contrôles automatiques : compteurs conformes à la base ; candidatures envoyées seulement, avec le rang réel, sans adresse ni e-mail dans la réponse ; portefeuille et mouvements exacts (libellés, signes, statuts) ; vrai nombre de recrutés ; navigation (page en cours, menu réduit nommé) ; logo réparé ; cloche et menu du compte au clavier ; 8 liens vivants ; recharge (vide, moins de 100, décimal, plus de 10 000 000 refusés sans appel à l'API ; Échap ; refus de l'API ; montant envoyé ; annonce après l'ouverture du paiement) ; historique en erreur ; 375 px, menu mobile, animations réduites ; entreprise sans activité ; aucune erreur dans la console. Non vérifié : le paiement KkiaPay réel |
| API 7b | Prêt sur `fix/api-notifications-immediates` (depuis `main`) | — | Cinq notifications : le canal « database » part tout de suite (`viaConnections`), l'e-mail reste en file. 1 test, qui échoue sans la correction. Suite : 147 tests |
| 7b | Prêt sur `design/lot-7b-missions` (empilé sur le lot 7a) | — | Types, lint et build verts. API locale avec l'API 7b et une file en base, comme en production. 34 contrôles automatiques : cartes (candidatures sans brouillon, recrutés, statut), recherche et filtre ; désactivation (confirmation, message juste, focus rendu) et réactivation ; clôture (candidat refusé et prévenu dans l'application) ; suppression d'une mission engagée refusée dans la fenêtre ; suppression groupée avec la mission engagée signalée ; création réelle (refus de chaque champ, avertissement CDD dès le rang E, urgence et durée enregistrées), modification, relance avec une nouvelle date ; cache séparé des missions clôturées ; 375 px et animations réduites ; aucune erreur dans la console. Lot 7a toujours vert (33) |
| API 7c | Prêt sur `fix/api-matching-rang` (depuis `main`) | — | Candidats suggérés : rang minimum de la candidature appliqué, candidats déjà là écartés, rang renvoyé. 1 test, qui échoue sans la correction. Suite : 147 tests |
| 7c-A | Prêt sur `design/lot-7c-candidatures` (empilé sur le lot 7b) | — | Types, lint et build verts. API locale avec l'API 7c. 25 contrôles automatiques : en-tête de la mission ; rang réel, score et niveau, évaluation en attente, statuts écrits, plus de titres inventés ; évaluation (résumé, points forts et à surveiller) ; seules les candidatures en attente retenues ; filtre et recherche ; suggestions (rang suffisant, compétences communes, ni rang trop bas ni candidat déjà là) ; profil ouvert puis focus rendu ; prise de service (envoi vide, validité après la prise de service refusée, bilan avec un envoi réel et un refus, focus sur le bilan, offre en base, liste rechargée) ; dossier avec coordonnées, dossier sans lien (coordonnées masquées et expliquées, expériences et formation), dossier introuvable ; 375 px et animations réduites ; aucune erreur dans la console |
| API 7c-B | Prêt sur `fix/api-invitations` (empilé sur `fix/api-matching-rang`) | — | Invitation refusée sur une mission désactivée ou clôturée ; e-mail du candidat donné seulement après acceptation ; message de l'e-mail sans double échappement ; plus de titre inventé dans les suggestions et le profil, nom donné prénom d'abord comme ailleurs. 4 tests, qui échouent sans la correction. Suite : 151 tests |
| 7c-B | Prêt sur `design/lot-7c-invitations` (empilé sur le lot 7c-A) | — | Types, lint et build verts. API locale avec l'API 7c-B. 35 contrôles automatiques : suggestions déjà invitées signalées ; profil (fenêtre nommée, rang, compétences, certifications, Échap et focus rendu) ; invitation (préremplie, message trop court refusé, envoi réel, focus sur la confirmation, retours à la ligne gardés en base, mention « Invité », pas de second envoi) ; refus en clair sur une mission clôturée ; page des invitations (mission nommée, e-mail seulement après acceptation, statuts écrits, filtres, recherche, message à la ligne) ; offre envoyée à un invité (refus de chaque champ, offre en base, liste rechargée) ; offre corrigée (préremplie, en base, fenêtre à jour) ; dossier d'un invité avec ses coordonnées ; message à la ligne côté candidat ; 375 px et animations réduites ; aucune erreur dans la console |
| API 7d | Prêt sur `fix/api-sequestre` (depuis `main`) | — | Séquestre possible seulement sur une offre acceptée et en cours (portefeuille et webhook KkiaPay) ; paiement KkiaPay refusé pour une offre hors cours ou une récompense déjà garantie. 3 tests, qui échouent sans la correction. Suite : 149 tests |
| 7d | Prêt sur `design/lot-7d-recrutes` (empilé sur le lot 7c-B) | — | Types, lint et build verts. API locale avec l'API 7d. 34 contrôles automatiques : lien depuis la mission ouverte, solde disponible, offres sans réponse écartées et comptées, aucun statut en anglais ; état de chaque recruté ; garantie par le solde (fenêtre, séquestre et solde en base, carte à jour) ; prise de service (ponctualité obligatoire, blocage annoncé, blocage refusé sans démarrage, démarrage réel, contrat généré et téléchargé) ; candidat non retenu (refus 403 expliqué, séquestre annulé et fonds rendus) ; validation (note obligatoire, paiement net, commission, +250 points, compte débité) ; solde insuffisant : validation impossible, paiement KkiaPay ouvert sans voler le focus, intention créée, séquestre constaté après actualisation (webhook simulé) ; 375 px et animations réduites ; aucune erreur dans la console. Lot 7b : 34 contrôles |
| API 7e | Prêt sur `fix/api-profil-entreprise` (depuis `main`) | — | Nom de l'entreprise obligatoire quand il est envoyé (le logo seul reste possible) ; coordonnées limitées à 255 caractères. 3 tests, dont 2 qui échouent sans la correction (le troisième garde l'envoi du logo seul). Suite : 149 tests |
| 7e | Prêt sur `design/lot-7e-profil` (empilé sur le lot 7d) | — | Types, lint et build verts. API locale avec l'API 7e. 30 contrôles automatiques : en-tête (nom, secteur, réseaux renseignés seulement, initiales sans logo) ; présentation mise en forme ; liens du site, de l'e-mail et du téléphone ; informations (étiquettes, nom vide et site invalide refusés, refus de l'API en français avec saisie gardée, enregistrement réel, https:// ajouté, lecture à jour, focus) ; présentation (éditeur nommé, enregistrement réel, paragraphes) ; coordonnées (e-mail et ancien numéro à 8 chiffres refusés, enregistrement réel, lien ajouté à l'en-tête) ; logo (type et taille refusés, faux fichier refusé par l'API, envoi réel) ; profil vide ; mot de passe (champs obligatoires, règle, confirmation, mot de passe actuel faux, « Afficher », réussite puis connexion avec le nouveau) ; 375 px et animations réduites ; aucune erreur dans la console. Correction du focus après un envoi (7c-B, 7d) : lots 7c-B 35 et 7d 34 contrôles |

Constat pour Gloria (lot 2b) : les questions de secours de l'API, servies quand l'IA est indisponible, vouvoient le candidat (« Qu'est-ce qui vous motive… »), alors que l'interface le tutoie. À harmoniser dans `ApplicationAIService` si elle le souhaite.

Constats pour Gloria (lot 2c) :
- Le candidat peut signaler son arrivée à tout moment, même plusieurs jours avant le rendez-vous : l'API ne compare pas avec `start_date`. Le front le rappelle (« une fois sur place, le jour du rendez-vous ») sans bloquer. Faut-il une règle côté API ?
- Le statut `expired` des propositions est prévu dans les commentaires de l'API, mais rien ne l'attribue : une invitation sans réponse reste en attente indéfiniment.
- Le message de refus des liens de l'e-mail affirmait « L'entreprise en a été informée » alors qu'aucune notification n'est envoyée. Il est corrigé sur `feat/api-reponse-propositions`.

Constats sur l'API faits pendant le lot 1, corrigés sur la branche `fix/api-propositions-inscriptions` (PR #6, fusionnée le 18/10/2026) :
- `GET /candidat/proposals` renvoyait `mission.budget`, une colonne qui n'existe pas : le montant était toujours vide. La réponse donne maintenant `mission.reward`, et le QG lit ce champ.
- `Enrollment` déclarait `enrolled_at` dans `$fillable`, une colonne absente de la table. Le champ est retiré, et un test vérifie désormais, pour tous les modèles, que chaque attribut de `$fillable` existe en base.
