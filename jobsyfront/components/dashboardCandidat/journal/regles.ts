// Règles du suivi d'une offre de mission, calquées sur l'API (MissionsController::respond, MissionTrackingController).
// Fonctions pures, sans appel réseau.
import { XP_MISSION_VALIDEE } from "@/lib/recompense";
import type { OffreDetaillee } from "./types";

export type EtatOffre = "en_attente" | "acceptee" | "declinee" | "expiree";

/** Où en est la réponse du candidat. L'API refuse l'acceptation une fois expires_at passé. */
export function etatOffre(offre: OffreDetaillee, maintenant: number): EtatOffre {
  if (offre.accepted_at) return "acceptee";
  if (offre.declined_at || offre.status === "declined") return "declinee";
  if (offre.expires_at) {
    const fin = new Date(offre.expires_at).getTime();
    if (!Number.isNaN(fin) && fin <= maintenant) return "expiree";
  }
  return "en_attente";
}

export type Acteur = "toi" | "entreprise";
export type EtatEtape = "faite" | "courante" | "a_venir" | "arretee";

export type EtapeMission = {
  cle: string;
  libelle: string;
  /** Qui fait avancer cette étape */
  acteur: Acteur;
  etat: EtatEtape;
  /** Date réelle de l'étape quand l'API la donne */
  date: string | null;
};

const ETAPES: { cle: string; libelle: string; acteur: Acteur; date: (o: OffreDetaillee) => string | null | undefined }[] = [
  { cle: "acceptee", libelle: "Offre acceptée", acteur: "toi", date: (o) => o.accepted_at },
  { cle: "arrivee", libelle: "Arrivée signalée", acteur: "toi", date: (o) => o.notified_presence_at },
  { cle: "presence", libelle: "Présence confirmée par l'entreprise, contrat généré", acteur: "entreprise", date: (o) => o.started_at },
  { cle: "travail", libelle: "Travail terminé", acteur: "toi", date: (o) => o.finished_at },
  { cle: "validation", libelle: `Mission validée : paiement et +${XP_MISSION_VALIDEE} XP`, acteur: "entreprise", date: (o) => o.validated_at ?? o.paid_at },
];

/** Nombre d'étapes faites pour chaque statut de l'offre */
const ETAPES_FAITES: Record<string, number> = {
  accepted: 1,
  service_started: 2,
  in_progress: 3,
  work_finished: 4,
  validated: 5,
  completed: 5,
};

export const STATUT_ARRETEE = "rejected_after_onboarding";
export const STATUTS_TERMINES = ["validated", "completed", STATUT_ARRETEE];

/**
 * Les cinq étapes réelles d'une mission confirmée. Si l'entreprise arrête la mission après l'arrivée
 * du candidat, le suivi s'arrête à la confirmation de présence.
 */
export function etapesMission(offre: OffreDetaillee): EtapeMission[] {
  // Une offre acceptée a toujours le statut accepted ; par prudence, un statut absent vaut « acceptée »
  const statut = offre.status ?? "accepted";
  const arretee = statut === STATUT_ARRETEE;
  const faites = arretee ? 2 : (ETAPES_FAITES[statut] ?? 1);

  const etapes = ETAPES.map((etape, index): EtapeMission => {
    const etat: EtatEtape = index < faites ? "faite" : index === faites ? (arretee ? "arretee" : "courante") : "a_venir";
    return { cle: etape.cle, libelle: etape.libelle, acteur: etape.acteur, etat, date: etape.date(offre) ?? null };
  });

  if (!arretee) return etapes;
  return etapes.slice(0, faites + 1).map((etape) =>
    etape.etat === "arretee" ? { ...etape, libelle: "L'entreprise n'a pas donné suite après ton arrivée" } : etape,
  );
}

/** Action que le candidat peut faire maintenant (MissionTrackingController l'accepte à ce statut seulement). */
export function actionCandidat(offre: OffreDetaillee): { statut: string; libelle: string; aide: string } | null {
  switch (offre.status ?? "accepted") {
    case "accepted":
      return {
        statut: "service_started",
        libelle: "Signaler mon arrivée",
        aide: "Une fois sur place, le jour du rendez-vous. L'entreprise confirmera ensuite ta présence.",
      };
    case "in_progress":
      return {
        statut: "work_finished",
        libelle: "Déclarer la mission terminée",
        aide: "Quand le travail est fini. L'entreprise le vérifie, puis valide la mission.",
      };
    default:
      return null;
  }
}
