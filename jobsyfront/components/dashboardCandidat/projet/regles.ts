// Règles du projet pratique (lot 3b-B2), sans React : chrono, vérification des livrables, brouillon local.
import { safeHttpUrl } from "@/lib/utils";
import type { ChampProjet, Reponses } from "./types";

export type PhaseChrono = "normal" | "grace" | "fini";

/** Phase de l'épreuve à un instant donné (horloge du serveur). Sans limite de temps, toujours « normal ». */
export function phaseChrono(fin: number | null, finGrace: number | null, maintenant: number): PhaseChrono {
  if (fin === null || finGrace === null) return "normal";
  if (maintenant < fin) return "normal";
  return maintenant < finGrace ? "grace" : "fini";
}

/** « 1 h 05 », « 42 min », « moins d'une minute » : le chrono s'affiche à la minute, sans secondes qui défilent. */
export function formaterRestant(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "moins d'une minute";
  const heures = Math.floor(minutes / 60);
  return heures > 0 ? `${heures} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
}

/** Note sur 20 renvoyée par la base (« 14.50 ») : « 14,5 ». */
export function formaterNote(note: number | string | null | undefined): string {
  const valeur = Number(note);
  return Number.isFinite(valeur) ? valeur.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : "0";
}

/** Longueur minimale d'une réponse écrite, comme la validation de l'API (min:10). */
export const LONGUEUR_MIN_TEXTE = 10;

/** Mêmes règles que l'API à l'envoi : champ requis, lien http(s), texte de 10 caractères au moins. */
export function verifierLivrables(champs: ChampProjet[], reponses: Reponses): Record<string, string> {
  const erreurs: Record<string, string> = {};
  for (const champ of champs) {
    const valeur = (reponses[champ.key] ?? "").trim();
    if (!valeur) {
      if (champ.required) erreurs[champ.key] = champ.type === "file" ? "Ajoute ce fichier." : "Ce livrable est obligatoire.";
      continue;
    }
    if ((champ.type === "url" || champ.type === "file") && !lienValide(valeur)) {
      erreurs[champ.key] = "Indique un lien complet, qui commence par https://";
    } else if (champ.type === "textarea" && valeur.length < LONGUEUR_MIN_TEXTE) {
      erreurs[champ.key] = `Écris au moins ${LONGUEUR_MIN_TEXTE} caractères.`;
    }
  }
  return erreurs;
}

function lienValide(valeur: string): boolean {
  if (!safeHttpUrl(valeur)) return false;
  try {
    return Boolean(new URL(valeur).hostname);
  } catch {
    return false;
  }
}

/** Au moins un livrable rempli : sinon, à la fin du temps, c'est une copie blanche. */
export const aDesReponses = (reponses: Reponses) => Object.values(reponses).some((valeur) => typeof valeur === "string" && valeur.trim() !== "");

/**
 * Pré-contrôle du fichier avant l'envoi, pour éviter d'attendre un téléversement refusé en 3G.
 * L'API reste juge (upload-temp-file : PDF, ZIP, RAR, PNG, JPG, 20 Mo) et son message est affiché.
 */
export const FICHIER_ACCEPTE = ".pdf,.zip,.rar,.png,.jpg,.jpeg";
export const TAILLE_MAX_FICHIER = 20 * 1024 * 1024;

export function verifierFichier(fichier: File): string | null {
  const extension = fichier.name.split(".").pop()?.toLowerCase() ?? "";
  if (!FICHIER_ACCEPTE.split(",").includes(`.${extension}`)) return "Ce format n'est pas accepté. Envoie un PDF, un ZIP, un RAR ou une image PNG ou JPG.";
  if (fichier.size > TAILLE_MAX_FICHIER) return "Ce fichier dépasse 20 Mo. Réduis-le ou compresse-le en ZIP.";
  return null;
}

/** Brouillon gardé dans le navigateur, propre à chaque tentative (décision D29). */
export const cleBrouillon = (sessionId: number, tentative: number) => `projet_${sessionId}_${tentative}`;

export function lireBrouillon(cle: string): Reponses | null {
  try {
    const brut = localStorage.getItem(cle);
    const valeur: unknown = brut ? JSON.parse(brut) : null;
    if (!valeur || typeof valeur !== "object") return null;
    return Object.fromEntries(Object.entries(valeur).filter(([, v]) => typeof v === "string")) as Reponses;
  } catch {
    return null;
  }
}

export function ecrireBrouillon(cle: string, reponses: Reponses) {
  try {
    localStorage.setItem(cle, JSON.stringify(reponses));
  } catch {
    // Stockage plein ou refusé : le brouillon de l'API suffit
  }
}

export function effacerBrouillon(cle: string) {
  try {
    localStorage.removeItem(cle);
  } catch {
    // Rien à faire
  }
}
