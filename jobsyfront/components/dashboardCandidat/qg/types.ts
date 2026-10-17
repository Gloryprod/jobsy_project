// Formes des réponses de l'API utilisées par le QG candidat (voir les contrôleurs cités).
import type { Rang } from "@/lib/progression";

/** GET /candidat/profile-elements (ProfileController::setProfileElements) */
export type ProfilCandidat = {
  id: number;
  score?: number | null;
  vitality?: number | null;
  streak_count?: number | null;
  domaine_competence?: string | null;
  rank?: Rang | null;
  skills?: { id: number; name: string }[];
};

/** mission_offers : relation hasOne de la candidature */
export type OffreMission = {
  id: number;
  status?: string | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  start_date?: string | null;
};

export type MissionResume = {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  /** decimal(10,2) : arrive sous forme de texte, par exemple "45000.00" */
  reward?: number | string | null;
  deadline?: string | null;
};

/** GET /missions/{candidat}/myapplications (CandidatureController::getApplications) */
export type Candidature = {
  id: number;
  status: string;
  created_at?: string;
  mission: MissionResume | null;
  mission_offers?: OffreMission | null;
};

/** GET /courses/my-learnings (CourseCatalogueController::myLearnings) */
export type Inscription = {
  id: number;
  course_id: number;
  progress_percentage?: number | null;
  status: string;
  certificate_hash?: string | null;
  course: { id: number; title: string; reward_xp?: number | null } | null;
};

/** GET /candidat/proposals (CandidatProposalController::index). Pas de date limite en base. */
export type Proposition = {
  id: number;
  status: string;
  subject: string;
  message: string;
  sent_at?: string | null;
  mission: { id: number | null; title: string; budget?: number | string | null; location?: string | null };
  entreprise: { nom_entreprise: string; logo?: string | null };
};
