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

## Avancement

| Lot | Statut | PR | Vérification |
|---|---|---|---|
| Plan | Validé le 17/10/2026 | — | — |
| 0 | Branche `design/lot-0-fondations` poussée, PR à ouvrir | — | Types et build verts, captures du catalogue `/systeme` à 375 px et 1280 px |
| 1 | Prêt sur `design/lot-1-qg` | — | Types, lint et build verts. API locale (SQLite) avec deux comptes : un compte actif qui déclenche chaque quête, un compte neuf. Captures à 375 px, à 1280 px et avec animations réduites : aucun débordement, aucune erreur dans la console, aucun lien cassé |
| B1 | Prêt sur `feat/api-rang-par-xp` (back seul, depuis `main`) | — | 8 tests ajoutés (`RankProgressionTest` et `ProfileRankTest`), qui échouent sans le changement. Suite complète : 97 tests |
| Date limite | Prêt sur `fix/api-candidature-date-limite` (back seul, depuis `main`) | — | 5 tests ajoutés (`ApplicationDeadlineTest`) : les 3 cas de refus échouent sans la règle. `MissionFactory` corrigée (sa date figée au 31/10/2026 aurait fait échouer les tests à partir de novembre). Suite complète : 94 tests |
| API réunie | Les 3 branches d'API fusionnées localement, à titre de vérification | — | 105 tests, aucun conflit |
| 2a | Prêt sur `design/lot-2a-portails` (après le lot 1) | — | Types, lint et build verts. Règles testées sur des cas types. API locale avec 12 missions (rangs E à B, CDI et CDD, missions passées), deux comptes. Vérifié : verrous et manques d'XP exacts, recherche sans accents, règle CDI/CDD, missions passées masquées. Détail au clavier : focus gardé, Échap, retour du focus sur le bouton. Pas de « Postuler » sur un portail verrouillé. L'épreuve d'entrée mène à la candidature. À 375 px : aucun débordement, fenêtre à 16 px des bords. Aucune erreur dans la console, aucun lien cassé |

Constats sur l'API faits pendant le lot 1, corrigés sur la branche `fix/api-propositions-inscriptions` (PR séparée, indépendante de la refonte) :
- `GET /candidat/proposals` renvoyait `mission.budget`, une colonne qui n'existe pas : le montant était toujours vide. La réponse donne maintenant `mission.reward`, et le QG lit ce champ.
- `Enrollment` déclarait `enrolled_at` dans `$fillable`, une colonne absente de la table. Le champ est retiré, et un test vérifie désormais, pour tous les modèles, que chaque attribut de `$fillable` existe en base.
