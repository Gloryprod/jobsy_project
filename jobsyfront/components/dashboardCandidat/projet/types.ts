/** Un livrable demandé par le projet (inputs_schema, saisi dans l'administration). */
export type ChampProjet = {
  key: string;
  type: "textarea" | "url" | "file";
  label: string;
  placeholder?: string | null;
  required: boolean;
};

export type CritereProjet = { name: string; max_points: number };

export type ProjetExamen = {
  id: number;
  title: string;
  domain?: string | null;
  context_rich_text: string | null;
  inputs_schema: ChampProjet[];
  evaluation_criteria?: CritereProjet[] | null;
  /** Note minimale sur 20 */
  passing_score: number;
  time_limit_minutes: number | null;
};

export type Reponses = Record<string, string>;

export type SessionProjet = {
  id: number;
  status: "in_progress" | "submitted" | "under_review" | "approved" | "failed";
  submitted_data: Reponses | null;
  started_at: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  admin_feedback: string | null;
  /** Note sur 20, renvoyée en texte par la base (« 14.50 ») */
  final_score: number | string | null;
  /** Numéro de la tentative en cours, à partir de 1 */
  attempts_count: number;
  is_blocked: boolean;
};

/** GET /exam-submissions/project/{courseId} (ExamSubmissionController::getStudentSubmission) */
export type ProjetServi = {
  project: ProjetExamen | null;
  session: SessionProjet | null;
  grace_minutes: number;
  max_attempts: number;
  /** Fin du temps imparti et de la grâce, en millisecondes sur l'horloge du serveur */
  fin: number | null;
  finGrace: number | null;
  /** Heure du serveur moins heure du navigateur, mesurée à la réception */
  decalage: number;
};
