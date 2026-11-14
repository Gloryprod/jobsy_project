// Règles de l'inventaire (lot 4b), sans React : classement des titres et certificats Jobsy.
import type { Inscription } from "../qg/types";
import type { TitreInventaire } from "../statut/types";

/** Recopiée de BadgeController::toggleEquip, qui ne la renvoie pas (décision D34). */
export const MAX_TITRES_EQUIPES = 5;

const RARETES: Record<string, string> = { commun: "Commun", rare: "Rare", "épique": "Épique", "légendaire": "Légendaire" };
export const libelleRarete = (rarete: string | null | undefined) => (rarete ? (RARETES[rarete] ?? rarete) : null);

export type TitresClasses = { equipes: TitreInventaire[]; debloques: TitreInventaire[]; aDebloquer: TitreInventaire[] };

export function classerTitres(titres: TitreInventaire[]): TitresClasses {
  return {
    equipes: titres.filter((t) => t.unlocked && t.equipped),
    debloques: titres.filter((t) => t.unlocked && !t.equipped),
    aDebloquer: titres.filter((t) => !t.unlocked),
  };
}

/** Formations Jobsy certifiées, avec le hash qui mène à la page de vérification publique. */
export function certificatsJobsy(inscriptions: Inscription[]) {
  return inscriptions.filter((i): i is Inscription & { certificate_hash: string } => i.status === "certified" && !!i.certificate_hash && !!i.course);
}

export function formaterDateCertificat(valeur: string | null | undefined): string | null {
  const date = valeur ? new Date(valeur) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString("fr-FR", { dateStyle: "long" }) : null;
}
