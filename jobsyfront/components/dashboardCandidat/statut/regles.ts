// Règles de la fenêtre de statut (lot 4a), sans React : statistiques réelles et vérification du dossier.
import { statutErreur } from "@/lib/erreurs";
import { safeHttpUrl } from "@/lib/utils";
import { STATUTS_MISSION_VALIDEE, type Candidature, type Inscription } from "../qg/types";

export type Statistiques = {
  missionsValidees: number;
  /** null tant qu'aucune entreprise n'a noté de mission */
  reputation: { moyenne: number; notes: number } | null;
  ponctualite: { aLHeure: number; total: number } | null;
};

/** Réputation et ponctualité viennent des retours des entreprises sur les missions (décision D30). */
export function calculerStatistiques(candidatures: Candidature[]): Statistiques {
  const offres = candidatures.flatMap((c) => (c.mission_offers ? [c.mission_offers] : []));
  const validees = offres.filter((o) => STATUTS_MISSION_VALIDEE.includes(o.status ?? ""));
  const notes = validees.map((o) => Number(o.rating)).filter((note) => Number.isFinite(note) && note > 0);
  const arrivees = offres.filter((o) => o.is_on_time === true || o.is_on_time === false);

  return {
    missionsValidees: validees.length,
    reputation: notes.length > 0 ? { moyenne: notes.reduce((somme, note) => somme + note, 0) / notes.length, notes: notes.length } : null,
    ponctualite: arrivees.length > 0 ? { aLHeure: arrivees.filter((o) => o.is_on_time).length, total: arrivees.length } : null,
  };
}

export const compterFormationsCertifiees = (inscriptions: Inscription[]) => inscriptions.filter((i) => i.status === "certified").length;

export const pluriel = (nombre: number, mot: string) => `${nombre} ${mot}${nombre > 1 ? "s" : ""}`;

export function formaterMoyenne(moyenne: number): string {
  return moyenne.toLocaleString("fr-FR", { maximumFractionDigits: 1 });
}

/** La base peut renvoyer une date avec l'heure : un champ date attend AAAA-MM-JJ. */
export const pourChampDate = (valeur: string | null | undefined) => (valeur ? valeur.slice(0, 10) : "");

export function formaterDateNaissance(valeur: string | null | undefined): string | null {
  const date = new Date(pourChampDate(valeur));
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("fr-FR", { dateStyle: "long", timeZone: "UTC" });
}

export const telephoneValide = (valeur: string) => /^\+?[\d\s().-]{8,20}$/.test(valeur.trim());
export const emailValide = (valeur: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());

export function lienValide(valeur: string): boolean {
  if (!safeHttpUrl(valeur)) return false;
  try {
    return Boolean(new URL(valeur.trim()).hostname);
  } catch {
    return false;
  }
}

export const LONGUEUR_MIN_MOT_DE_PASSE = 8;

/** Formats et taille validés par l'API (CvRequest, DiplomeRequest, FormationRequest). */
export type RegleFichier = { accept: string; aide: string; refus: string };
export const FICHIER_CV: RegleFichier = { accept: ".pdf", aide: "PDF, 2 Mo au plus.", refus: "Ton CV doit être un PDF." };
export const FICHIER_PREUVE: RegleFichier = {
  accept: ".pdf,.jpg,.jpeg,.png",
  aide: "PDF, JPG ou PNG, 2 Mo au plus.",
  refus: "Ce format n'est pas accepté. Envoie un PDF, un JPG ou un PNG.",
};
const TAILLE_MAX_FICHIER = 2 * 1024 * 1024;

/** Pré-contrôle avant l'envoi, pour éviter d'attendre un refus en 3G. L'API reste juge. */
export function verifierFichier(fichier: File, regle: RegleFichier): string | null {
  const extension = fichier.name.split(".").pop()?.toLowerCase() ?? "";
  if (!regle.accept.split(",").includes(`.${extension}`)) return regle.refus;
  if (fichier.size > TAILLE_MAX_FICHIER) return "Ce fichier dépasse 2 Mo. Réduis-le, puis réessaie.";
  return null;
}

/** Message d'un envoi refusé pour une autre raison que la validation d'un champ. */
export function messageEnvoi(erreur: unknown, parDefaut: string): string {
  const code = statutErreur(erreur);
  if (code === null) return "La connexion a été coupée. Vérifie ton réseau, puis réessaie.";
  if (code === 429) return "Trop d'envois d'un coup. Attends une minute, puis réessaie.";
  if (code === 413) return "Ce fichier est trop lourd pour être envoyé.";
  return parDefaut;
}
