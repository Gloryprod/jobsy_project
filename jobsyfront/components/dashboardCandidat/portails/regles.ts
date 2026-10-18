// Règles d'affichage des portails (missions). Fonctions pures, sans appel réseau.
import { RANGS_PAR_DEFAUT, type Rang } from "@/lib/progression";
import type { MissionPortail } from "./types";

const rangParLettre = (lettre?: string | null): Rang =>
  RANGS_PAR_DEFAUT.find((rang) => rang.rank === (lettre ?? "").trim().toUpperCase()) ?? RANGS_PAR_DEFAUT[0];

/** Aux rangs E et D, seules les missions ponctuelles sont proposées (règle de l'écran d'origine). */
export const RANGS_MISSIONS_PONCTUELLES_SEULEMENT = ["E", "D"];

export function contratAccessible(mission: MissionPortail, rangCandidat: string | null | undefined): boolean {
  const lettre = rangParLettre(rangCandidat).rank;
  return !RANGS_MISSIONS_PONCTUELLES_SEULEMENT.includes(lettre) || mission.type_contrat === "Mission Ponctuelle";
}

export type EtatPortail = {
  ouvert: boolean;
  requis: Rang;
  /** XP qui manque pour atteindre le rang requis (0 si le portail est ouvert) */
  manque: number;
};

/**
 * Même règle que l'API (CandidatureController) : le seuil du rang du candidat doit atteindre
 * celui du rang minimum de la mission. Sans rang minimum, la mission est ouverte à tous (rang E).
 */
export function etatPortail(
  mission: Pick<MissionPortail, "min_rank_required">,
  rangCandidat: string | null | undefined,
  score: number | null | undefined,
): EtatPortail {
  const requis = rangParLettre(mission.min_rank_required || "E");
  const ouvert = rangParLettre(rangCandidat).points >= requis.points;
  return { ouvert, requis, manque: ouvert ? 0 : Math.max(0, requis.points - (Number(score) || 0)) };
}

// Accents combinants (U+0300 à U+036F) que normalize("NFD") sépare des lettres
const ACCENTS = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");

/** Minuscules et sans accents : « epicerie » trouve « Épicerie ». */
export function normaliser(texte: string | null | undefined): string {
  return (texte ?? "").normalize("NFD").replace(ACCENTS, "").toLowerCase();
}

export function correspondRecherche(mission: MissionPortail, recherche: string): boolean {
  const cherche = normaliser(recherche.trim());
  if (!cherche) return true;
  return [mission.title, mission.company, mission.entreprise?.nom_entreprise, mission.location, ...(mission.skills ?? [])].some((champ) =>
    normaliser(champ).includes(cherche),
  );
}
