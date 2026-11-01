// Formes de GET /candidat/formations/{id}/workspace-standard (CourseWorkspaceController::showStandardWorkspace).

export type QuestionQuiz = {
  id: number;
  question_text: string;
  options: string[];
  points: number;
  /** Plusieurs réponses attendues : la notation en dépend (deux cases cochées sur une question à réponse unique valent zéro) */
  is_multiple?: boolean;
};

/** Une étape d'une salle : une leçon, ou le quiz du module (toujours en dernier). */
export type Capsule = {
  /** « lesson-5 » ou « qcm-2 » */
  id: string;
  /** Leçons : identifiant en base */
  db_id?: number;
  /** Quiz : module concerné */
  module_id?: number;
  title: string;
  type: "video" | "text" | "qcm" | "pdf";
  /** « 10 min » pour une leçon, « 3 questions » pour un quiz */
  duration: string;
  content_text?: string | null;
  video_url?: string | null;
  pdf_url?: string | null;
  is_completed: boolean;
  questions?: QuestionQuiz[];
};

/** Une salle : un module et ses étapes. */
export type Section = {
  id: number;
  title: string;
  capsules: Capsule[];
};

/** POST /candidat/modules/{id}/submit-quiz : la correction n'arrive qu'en cas de réussite */
export type ResultatQuiz = {
  is_passed: boolean;
  score: number;
  corrections: Record<number, { is_correct: boolean; correct_answers: string[] }> | [];
  message?: string;
};
