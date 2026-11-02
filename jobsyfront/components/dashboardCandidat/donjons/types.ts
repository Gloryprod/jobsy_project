// Formes des réponses de l'API pour les formations, vues comme des donjons (voir les contrôleurs cités).

/** Une formation : GET /open/courses et GET /get_modules/{id} (CourseCatalogueController). */
export type Formation = {
  id: number;
  title: string;
  /** Texte riche saisi dans l'administration : à afficher avec SafeHtml */
  description?: string | null;
  /** A : Standard, B : Logistique (kit livré), C : Expert (projet final) */
  validation_mode: string;
  /** Mode C seulement : « Digital » ou « Kit » */
  type_contenu?: string | null;
  delivered_skills?: string[] | null;
  reward_xp?: number | null;
  /** Badge gagné à la certification, par exemple « Badge Accueil » */
  reward_asset?: string | null;
  is_active?: boolean | number | null;
  /** Catalogue seulement : les modules, pour les compter */
  modules?: { id: number }[];
};

/**
 * Inscription du candidat. Statuts : enrolled, waiting_kit (kit en cours de livraison), learning,
 * evaluation_ready (tous les modules franchis), pending_review (projet en correction), certified, failed.
 */
export type InscriptionFormation = {
  id: number;
  status: string;
  progress_percentage?: number | string | null;
  delivery_status?: string | null;
};

/** GET /open/courses (CourseCatalogueController::index) */
export type EntreeCatalogue = {
  course: Formation;
  is_enrolled: boolean;
  enrollment: InscriptionFormation | null;
};

/** Résumé d'un module : ni contenu de leçon ni question de quiz. */
export type ModuleCarte = {
  id: number;
  title: string;
  description?: string | null;
  order: number;
  lessons_count: number;
  duration_minutes: number;
  quiz_questions_count: number;
  /** null tant que le candidat n'est pas inscrit */
  lessons_completed: number | null;
  /** null sans inscription ou sans quiz */
  quiz_passed: boolean | null;
};

export type ExamenFinal = {
  /** quiz : QCM final (modes A et B) ; project : projet pratique (mode C) */
  type: "quiz" | "project";
  /** Projet : nombre maximal de tentatives ; QCM : pas de limite */
  max_attempts: number | null;
  questions_count?: number;
  time_limit_minutes?: number | null;
  /** En % pour le QCM ; note minimale du projet */
  passing_score?: number | null;
  retry_delay_hours: number;
};

/** GET /get_modules/{id} (CourseCatalogueController::getModules) */
export type CarteFormation = {
  course: Formation;
  enrollment: InscriptionFormation | null;
  modules: ModuleCarte[];
  /** Note minimale (en %) pour réussir le quiz d'un module */
  quiz_passing_score: number;
  final_exam: ExamenFinal;
};
