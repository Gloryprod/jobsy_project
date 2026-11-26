// Règles des missions de la Guilde (lot 7b). Fonctions pures, sans appel réseau.
import type { TonStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { RANGS_MISSIONS_PONCTUELLES_SEULEMENT } from "@/components/dashboardCandidat/portails/regles";

type OffreListe = { status?: string | null; accepted_at?: string | null } | null;
type CandidatureListe = { id: number; status: string; mission_offers?: OffreListe };

// Mission telle que la renvoient GET /missions et GET /missions/closed (avec applications.mission_offers)
export type MissionGuilde = {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number | string;
  duration?: string | null;
  deadline: string;
  description: string;
  skills: string[] | string | null;
  urgency?: string | null;
  test_severity?: string | null;
  category?: string | null;
  applicants?: number | null;
  type_contrat: string;
  active: boolean | number;
  min_rank_required?: string | null;
  closed_at?: string | null;
  applications?: CandidatureListe[];
};

const OFFRE_ACCEPTEE = ["accepted", "in_progress", "work_finished", "completed"];

/** Candidatures envoyées (sans les brouillons) et candidats recrutés (offre acceptée). */
export function compterMission(mission: Pick<MissionGuilde, "applications">): { candidatures: number; recrutes: number } {
  const liste = mission.applications ?? [];
  return {
    candidatures: liste.filter((a) => a.status !== "draft").length,
    recrutes: liste.filter((a) => !!a.mission_offers && (!!a.mission_offers.accepted_at || OFFRE_ACCEPTEE.includes(a.mission_offers.status ?? ""))).length,
  };
}

export function statutMission(mission: Pick<MissionGuilde, "active" | "closed_at">): { libelle: string; ton: TonStatut } {
  if (mission.closed_at) return { libelle: "Clôturée", ton: "neutre" };
  return mission.active ? { libelle: "Ouverte", ton: "succes" } : { libelle: "Désactivée", ton: "attente" };
}

export const URGENCES: Record<string, string> = { normal: "Normale", urgent: "Urgente", premium: "Premium" };
export const DIFFICULTES: Record<string, string> = { light: "Facile", standard: "Moyenne", expert: "Difficile" };
export const CONTRATS = ["Mission Ponctuelle", "CDD", "CDI"];

export function listeCompetences(skills: MissionGuilde["skills"]): string[] {
  const liste = Array.isArray(skills) ? skills : (skills ?? "").split(",");
  return liste.map((s) => s.trim()).filter(Boolean);
}

/** Texte d'un contenu HTML (éditeur de description), pour compter ses caractères comme l'API les voit à peu près. */
export function texteSeul(html: string | null | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export type ValeursMission = {
  title: string;
  company: string;
  location: string;
  reward: string;
  duration: string;
  deadline: string;
  urgency: string;
  type_contrat: string;
  applicants: string;
  min_rank_required: string;
  test_severity: string;
  category: string;
  skills: string;
  description: string;
};

export type ErreursMission = Partial<Record<keyof ValeursMission, string>>;

/** Date du jour au format AAAA-MM-JJ, dans le fuseau de l'appareil. */
export function aujourdhui(maintenant = new Date()): string {
  const deux = (n: number) => String(n).padStart(2, "0");
  return `${maintenant.getFullYear()}-${deux(maintenant.getMonth() + 1)}-${deux(maintenant.getDate())}`;
}

/** Mêmes règles que MissionRequest côté API, avec des messages en français. */
export function verifierMission(v: ValeursMission, maintenant = new Date()): ErreursMission {
  const e: ErreursMission = {};
  const obligatoire = "Ce champ est obligatoire.";
  for (const champ of ["title", "company", "location", "urgency", "type_contrat", "min_rank_required", "test_severity", "category"] as const) {
    if (!v[champ].trim()) e[champ] = obligatoire;
  }
  for (const champ of ["title", "company", "location"] as const) {
    if (!e[champ] && v[champ].trim().length > 255) e[champ] = "255 caractères au maximum.";
  }
  if (!v.reward.trim()) e.reward = obligatoire;
  else if (!/^\d+$/.test(v.reward.trim())) e.reward = "Indiquez un nombre entier de FCFA, sans espace.";
  if (!v.deadline) e.deadline = obligatoire;
  else if (v.deadline <= aujourdhui(maintenant)) e.deadline = "Choisissez une date à partir de demain.";
  if (v.applicants.trim() && !/^\d+$/.test(v.applicants.trim())) e.applicants = "Indiquez un nombre entier.";
  if (listeCompetences(v.skills).length === 0) e.skills = "Indiquez au moins une compétence.";
  const description = texteSeul(v.description);
  if (!description) e.description = obligatoire;
  else if (description.length < 10) e.description = "Décrivez la mission en 10 caractères au moins.";
  return e;
}

/** Les rangs E et D ne voient que les missions ponctuelles : un CDD ou un CDI ouvert dès E ou D n'atteindra que les rangs C et plus. */
export function contratInvisible(typeContrat: string, rang: string): boolean {
  return !!typeContrat && typeContrat !== "Mission Ponctuelle" && RANGS_MISSIONS_PONCTUELLES_SEULEMENT.includes(rang);
}

// Noms des champs de l'API, dans l'ordre du formulaire (pour placer le focus sur la première erreur)
export const ORDRE_CHAMPS: (keyof ValeursMission)[] = [
  "title",
  "company",
  "location",
  "reward",
  "duration",
  "deadline",
  "urgency",
  "type_contrat",
  "applicants",
  "min_rank_required",
  "test_severity",
  "category",
  "skills",
  "description",
];
