import type { LigneValeur } from "@/components/systeme";
import { formaterFcfa } from "@/lib/formats";
import { COMMISSION_AFFICHEE, partageRecompense, XP_MISSION_VALIDEE } from "@/lib/recompense";

/** Récompense d'une mission pour LignesValeurs : montant, ce que le candidat reçoit après la commission Jobsy, et l'XP. */
export function lignesRecompense(reward: number | string | null | undefined): LigneValeur[] {
  const partage = partageRecompense(reward);
  return [
    ...(partage
      ? [
          { libelle: "Récompense de la mission", valeur: formaterFcfa(partage.brut), ton: "or" as const },
          { libelle: `Tu reçois (commission Jobsy de ${COMMISSION_AFFICHEE} déduite)`, valeur: formaterFcfa(partage.net), ton: "or" as const },
        ]
      : [{ libelle: "Récompense de la mission", valeur: "Montant non précisé" }]),
    { libelle: "À la validation", valeur: `+${XP_MISSION_VALIDEE} XP`, ton: "or" as const },
  ];
}
