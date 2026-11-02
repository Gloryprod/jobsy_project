// Règles des donjons (formations), calquées sur l'API : CourseCatalogueController, Enrollment::updateProgress,
// et l'aiguillage de l'espace de formation (formations/[id]/workspace). Fonctions pures, sans appel réseau.
import type { TonStatut } from "../qg/CarteRealite";
import { normaliser } from "../portails/regles";
import type { Formation, InscriptionFormation, ModuleCarte } from "./types";

/** Espace insécable avant « % » : le signe ne passe jamais seul à la ligne */
export const POURCENT = `${String.fromCharCode(0xa0)}%`;

export type CleType = "standard" | "logistique" | "expert";

export type TypeDonjon = {
  cle: CleType;
  /** Nom utilisé dans l'administration */
  nom: string;
  /** Ce que la formation demande, en une phrase */
  explication: string;
  /** Un kit de matériel est livré avant la première salle */
  avecKit: boolean;
  boss: "quiz" | "project";
};

/** Type d'une formation, avec le même aiguillage que l'espace de formation (A, B, C Digital ou C Kit). */
export function typeDonjon(formation: Pick<Formation, "validation_mode" | "type_contenu">): TypeDonjon {
  const mode = String(formation.validation_mode ?? "A").toUpperCase();
  if (mode === "B") {
    return { cle: "logistique", nom: "Logistique", explication: "Un kit de matériel t'est livré, puis tu passes l'examen final.", avecKit: true, boss: "quiz" };
  }
  if (mode === "C") {
    const avecKit = formation.type_contenu === "Kit";
    return {
      cle: "expert",
      nom: "Expert",
      explication: avecKit ? "Un kit de matériel t'est livré, et la formation se termine par un projet pratique." : "La formation se termine par un projet pratique.",
      avecKit,
      boss: "project",
    };
  }
  return { cle: "standard", nom: "Standard", explication: "Leçons et quiz en ligne, puis un examen final.", avecKit: false, boss: "quiz" };
}

export const FILTRES_TYPE: { valeur: "tous" | CleType; libelle: string }[] = [
  { valeur: "tous", libelle: "Tous" },
  { valeur: "standard", libelle: "Standard" },
  { valeur: "logistique", libelle: "Logistique" },
  { valeur: "expert", libelle: "Expert" },
];

export type EtatDonjon = {
  cle: "nouveau" | "kit" | "en_cours" | "boss" | "correction" | "certifie" | "echec" | "autre";
  libelle: string;
  ton: TonStatut;
  /** Progression réelle (0 à 100) d'une formation commencée, sinon null */
  progression: number | null;
};

function pourcentage(valeur: number | string | null | undefined): number {
  const n = Number(valeur);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;
}

/** État du donjon pour le candidat, d'après son inscription. */
export function etatDonjon(inscription: InscriptionFormation | null | undefined): EtatDonjon {
  if (!inscription) return { cle: "nouveau", libelle: "Pas encore commencé", ton: "neutre", progression: null };
  const progression = pourcentage(inscription.progress_percentage);
  switch (inscription.status) {
    case "waiting_kit":
      return { cle: "kit", libelle: "Kit en cours de livraison", ton: "attente", progression: null };
    case "enrolled":
    case "learning":
      return { cle: "en_cours", libelle: `En cours, ${progression}${POURCENT}`, ton: "action", progression };
    case "evaluation_ready":
      return { cle: "boss", libelle: "Boss prêt", ton: "action", progression: 100 };
    case "pending_review":
      return { cle: "correction", libelle: "Projet en correction", ton: "attente", progression: 100 };
    case "certified":
      return { cle: "certifie", libelle: "Certifié", ton: "succes", progression: 100 };
    case "failed":
      return { cle: "echec", libelle: "Boss non vaincu", ton: "echec", progression: 100 };
    default:
      return { cle: "autre", libelle: inscription.status, ton: "neutre", progression };
  }
}

/** Donjons que le candidat a commencés et pas encore terminés, du plus urgent au moins urgent. */
export const ORDRE_EN_COURS: EtatDonjon["cle"][] = ["boss", "echec", "en_cours", "kit", "correction"];

export type EtatSalle = "franchie" | "en_cours" | "a_venir" | "a_explorer";

/** Une salle (module) est franchie quand toutes ses leçons sont terminées et son quiz réussi, s'il en a un. */
export function salleFranchie(module: ModuleCarte): boolean {
  return (module.lessons_completed ?? 0) >= module.lessons_count && (module.quiz_questions_count === 0 || module.quiz_passed === true);
}

/**
 * État de chaque salle. Le parcours est séquentiel, comme dans l'espace de formation :
 * la première salle non franchie est en cours, les suivantes sont à venir.
 */
export function etatsSalles(modules: ModuleCarte[], inscription: InscriptionFormation | null | undefined): EtatSalle[] {
  if (!inscription) return modules.map(() => "a_explorer");
  // Tant que le kit n'est pas livré, aucune salle ne s'ouvre
  if (inscription.status === "waiting_kit") return modules.map(() => "a_venir");
  let courante = false;
  return modules.map((module) => {
    if (salleFranchie(module)) return "franchie";
    if (!courante) {
      courante = true;
      return "en_cours";
    }
    return "a_venir";
  });
}

export type EtatBoss = "a_explorer" | "verrouille" | "pret" | "correction" | "vaincu" | "echec";

export function etatBoss(inscription: InscriptionFormation | null | undefined): EtatBoss {
  switch (inscription?.status) {
    case undefined:
      return "a_explorer";
    case "evaluation_ready":
      return "pret";
    case "pending_review":
      return "correction";
    case "certified":
      return "vaincu";
    case "failed":
      return "echec";
    default:
      return "verrouille";
  }
}

export type ActionDonjon = { libelle: string; inscription: boolean };

/** L'action utile selon l'état : s'inscrire, ou aller à l'espace de formation. */
export function actionDonjon(inscription: InscriptionFormation | null | undefined): ActionDonjon {
  const etat = etatDonjon(inscription);
  switch (etat.cle) {
    case "nouveau":
      return { libelle: "Entrer dans le donjon", inscription: true };
    case "kit":
      return { libelle: "Suivre la livraison du kit", inscription: false };
    case "en_cours":
      return { libelle: etat.progression ? "Continuer" : "Commencer la première salle", inscription: false };
    case "boss":
      return { libelle: "Affronter le boss", inscription: false };
    case "correction":
      return { libelle: "Voir où en est la correction", inscription: false };
    case "certifie":
      return { libelle: "Voir mon certificat", inscription: false };
    default:
      return { libelle: "Voir où j'en suis", inscription: false };
  }
}

export const lienEspace = (formationId: number) => `/dashboard/candidats/formations/${formationId}/workspace`;
export const lienCarte = (formationId: number) => `/dashboard/candidats/formations/${formationId}/modules`;

/** « 45 min », « 1 h », « 1 h 30 » ; null pour une durée inconnue ou nulle. */
export function formaterDuree(minutes: number | null | undefined): string | null {
  const total = Math.round(Number(minutes) || 0);
  if (total <= 0) return null;
  const heures = Math.floor(total / 60);
  const reste = total % 60;
  if (heures === 0) return `${reste} min`;
  return reste ? `${heures} h ${String(reste).padStart(2, "0")}` : `${heures} h`;
}

/** Sans accents, et la ponctuation (tiret, apostrophe…) vaut une espace : « savoir vivre » trouve « Savoir-vivre ». */
const pourRecherche = (texte: string | null | undefined) => normaliser(texte).replace(/[^a-z0-9]+/g, " ").trim();

/** Recherche dans le titre, la description et les compétences. */
export function correspondRechercheFormation(formation: Formation, recherche: string): boolean {
  const cherche = pourRecherche(recherche);
  if (!cherche) return true;
  const description = (formation.description ?? "").replace(/<[^>]*>/g, " ");
  return [formation.title, description, ...(formation.delivered_skills ?? [])].some((champ) => pourRecherche(champ).includes(cherche));
}
