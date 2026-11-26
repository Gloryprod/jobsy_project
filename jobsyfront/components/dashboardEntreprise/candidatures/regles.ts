// Règles des candidatures côté entreprise (lot 7c-A). Fonctions pures, sans appel réseau.
import type { TonStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { aujourdhui } from "../missions/regles";

type RangApi = { rank: string; label?: string | null; code_hexa?: string | null } | null;

// GET /missions/{id}/applications (brouillons exclus par l'API)
export type CandidatureRecue = {
  id: number;
  status: string;
  global_score: number | null;
  badge: string | null;
  ai_summary: string | null;
  created_at: string;
  candidat: {
    id: number;
    ville?: string | null;
    domaine_competence?: string | null;
    user: { nom: string; prenom: string } | null;
    rank: RangApi;
  } | null;
  assessment?: { ai_feedback_details?: { points_forts?: string[]; points_faibles?: string[] } | null } | null;
};

// GET /missions/{id}/suggested-candidates
export type CandidatSuggere = {
  id: number;
  full_name: string;
  title: string | null;
  match_score: number;
  skills_breakdown?: { matched?: string[]; missing?: string[] };
  rank?: RangApi;
};

export function nomCandidat(c: CandidatureRecue): string {
  return [c.candidat?.user?.prenom, c.candidat?.user?.nom].filter(Boolean).join(" ") || "Candidat";
}

export function statutCandidature(status: string): { libelle: string; ton: TonStatut } {
  if (status === "accepted") return { libelle: "Retenu, offre envoyée", ton: "succes" };
  if (status === "rejected") return { libelle: "Non retenu", ton: "neutre" };
  return { libelle: "En attente", ton: "attente" };
}

/** Niveau attribué par l'évaluation de l'épreuve d'entrée (ApplicationAIService::normalizeAnalysis). */
export const NIVEAUX: Record<string, string> = { EXPERT: "Expert", CONFIRMED: "Confirmé", JUNIOR: "Junior", REJECTED: "Insuffisant" };

export function evaluation(c: Pick<CandidatureRecue, "global_score" | "badge">): string {
  if (c.global_score === null || c.global_score === undefined) return "Évaluation en attente";
  const niveau = NIVEAUX[c.badge ?? ""];
  return `${c.global_score}/100${niveau ? `, niveau ${niveau}` : ""}`;
}

export type PriseDeService = { start_date: string; start_time: string; place: string; contact_person: string; expires_at: string; onboarding_instructions: string };
export type ErreursPrise = Partial<Record<keyof PriseDeService, string>>;
export const ORDRE_PRISE: (keyof PriseDeService)[] = ["start_date", "start_time", "place", "contact_person", "expires_at", "onboarding_instructions"];

/** Règles de MissionOffersRequest, plus une validité de l'offre au plus tard le jour de la prise de service. */
export function verifierPriseDeService(v: PriseDeService, maintenant = new Date()): ErreursPrise {
  const e: ErreursPrise = {};
  const jour = aujourdhui(maintenant);
  const obligatoire = "Ce champ est obligatoire.";
  if (!v.start_date) e.start_date = obligatoire;
  else if (v.start_date <= jour) e.start_date = "Choisissez une date à partir de demain.";
  if (!v.start_time) e.start_time = obligatoire;
  else if (!/^\d{2}:\d{2}$/.test(v.start_time)) e.start_time = "Indiquez l'heure au format 08:30.";
  for (const champ of ["place", "contact_person"] as const) {
    if (!v[champ].trim()) e[champ] = obligatoire;
    else if (v[champ].trim().length > 255) e[champ] = "255 caractères au maximum.";
  }
  if (!v.expires_at) e.expires_at = obligatoire;
  else if (v.expires_at <= jour) e.expires_at = "Choisissez une date à partir de demain.";
  else if (v.start_date && v.expires_at > v.start_date) e.expires_at = "Le candidat doit répondre au plus tard le jour de la prise de service.";
  return e;
}
