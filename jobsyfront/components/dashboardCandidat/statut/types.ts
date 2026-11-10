import type { Rang } from "@/lib/progression";

export type Contact = {
  telephone?: string | null;
  email_secondaire?: string | null;
  linkedin?: string | null;
  whatsapp?: string | null;
};

export type Diplome = { id: number; intitule: string; fichier?: string | null };
export type Certification = { id: number; titre: string; organisme?: string | null; certificat?: string | null };
export type Cv = { id: number; fichier: string };

/** GET /candidat/profile (CandidatController::candidatProfile) */
export type Dossier = {
  id: number;
  score?: number | null;
  vitality?: number | null;
  streak_count?: number | null;
  domaine_competence?: string | null;
  is_validate?: boolean;
  date_naissance?: string | null;
  sexe?: string | null;
  nationalite?: string | null;
  ville?: string | null;
  bio?: string | null;
  adresse?: string | null;
  rank?: Rang | null;
  contact?: Contact | null;
  cv?: Cv | null;
  diplomes?: Diplome[];
  formations?: Certification[];
};

/** Un élément de GET /candidate/inventory (BadgeController::index) */
export type TitreInventaire = {
  id: string;
  name: string;
  rarity: string;
  equipped: boolean;
  unlocked: boolean;
  description?: string | null;
  /** Progression réelle vers le déblocage (BadgeEvaluatorService) */
  progress?: { current: number; max: number } | null;
};
