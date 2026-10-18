// Réponses non envoyées gardées dans le navigateur, jusqu'à l'envoi de la candidature.
// C'est un confort : en navigation privée ou si le stockage est bloqué, l'épreuve fonctionne sans.
import type { QuestionEpreuve, Reponses } from "./types";

type Etape = "motivation" | "technique";

const PREFIXE = "jobsy:epreuve:";

/**
 * Empreinte des questions : un brouillon n'est rendu que pour les mêmes questions.
 * Des questions techniques générées à nouveau ne reçoivent pas les réponses écrites pour d'autres.
 */
function empreinte(questions: QuestionEpreuve[]): string {
  let hash = 5381;
  for (const caractere of questions.map((q) => `${q.id}:${q.label}`).join("|")) {
    hash = ((hash * 33) ^ caractere.charCodeAt(0)) >>> 0;
  }
  return hash.toString(36);
}

const cle = (candidatureId: number, etape: Etape, questions: QuestionEpreuve[]) =>
  `${PREFIXE}${candidatureId}:${etape}:${empreinte(questions)}`;

export function lireBrouillon(candidatureId: number, etape: Etape, questions: QuestionEpreuve[]): Reponses {
  try {
    const brut = window.localStorage.getItem(cle(candidatureId, etape, questions));
    if (!brut) return {};
    const valeur: unknown = JSON.parse(brut);
    if (!valeur || typeof valeur !== "object") return {};
    // Seulement des réponses texte, rangées par numéro de question
    return Object.fromEntries(
      Object.entries(valeur as Record<string, unknown>).filter(([id, texte]) => /^\d+$/.test(id) && typeof texte === "string"),
    ) as Reponses;
  } catch {
    return {};
  }
}

export function ecrireBrouillon(candidatureId: number, etape: Etape, questions: QuestionEpreuve[], reponses: Reponses): void {
  try {
    window.localStorage.setItem(cle(candidatureId, etape, questions), JSON.stringify(reponses));
  } catch {
    // Stockage refusé : l'épreuve continue, les réponses restent seulement à l'écran
  }
}

/** Après l'envoi de la candidature : tous les brouillons de cette candidature disparaissent. */
export function effacerBrouillons(candidatureId: number): void {
  try {
    const debut = `${PREFIXE}${candidatureId}:`;
    const cles: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith(debut)) cles.push(k);
    }
    cles.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // Stockage indisponible : rien à effacer
  }
}

/** Le navigateur accepte-t-il de garder des réponses ? (faux en navigation privée stricte, stockage plein…) */
export function stockageDisponible(): boolean {
  try {
    const test = `${PREFIXE}test`;
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
