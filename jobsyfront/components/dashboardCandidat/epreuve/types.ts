// Formes des réponses de l'API utilisées par l'épreuve d'entrée (CandidatureController, MissionsController::show).
import type { MissionPortail } from "../portails/types";

/** Question générée par l'IA, ou question de secours si l'IA est indisponible (1 à 5 par étape). */
export type QuestionEpreuve = {
  id: number;
  label: string;
  context_hint?: string | null;
};

/** GET /show/{id} : la mission seule, sans l'entreprise. */
export type MissionEpreuve = Omit<MissionPortail, "entreprise"> & {
  closed_at?: string | null;
  entreprise?: MissionPortail["entreprise"];
};

export type Reponses = Record<number, string>;

export type Phase = "accueil" | "motivation" | "technique" | "fin";

/** L'IA ne lit que les 1 500 premiers caractères d'une réponse (ApplicationAIService::MAX_ANSWER_LENGTH). */
export const LONGUEUR_MAX_MOTIVATION = 1500;
export const LONGUEUR_MIN_MOTIVATION = 10;
/** Les questions techniques appellent une réponse de 280 caractères au plus (consigne donnée à l'IA). */
export const LONGUEUR_MAX_TECHNIQUE = 280;
