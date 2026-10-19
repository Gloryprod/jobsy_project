// Quêtes du jour : les prochaines actions réelles du candidat, tirées de ses données. Fonction pure, sans appel réseau.
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { XP_MISSION_VALIDEE } from "@/lib/recompense";
import type { Candidature, Inscription, MissionResume, ProfilCandidat, Proposition } from "./types";

export type Quete = {
  id: string;
  titre: string;
  detail: string;
  lien: string;
  action: string;
  /** Récompense réelle : montant de la mission, XP de la formation… */
  recompense?: string;
  /** Date limite réelle venant de l'API ; sans elle, pas de compte à rebours. */
  echeance?: string;
};

export const NOMBRE_MAX_QUETES = 3;

const lienFormation = (inscription: Inscription) => `/dashboard/candidats/formations/${inscription.course?.id ?? inscription.course_id}/workspace`;

function estFutur(date: string | null | undefined, maintenant: number): boolean {
  if (!date) return true;
  const valeur = new Date(date).getTime();
  return Number.isNaN(valeur) || valeur > maintenant;
}

/**
 * missions.deadline est une date sans heure (l'API envoie minuit UTC) : la mission reste ouverte
 * jusqu'à la fin de ce jour-là. Sans date limite, elle est considérée comme ouverte.
 */
export function missionOuverte(mission: MissionResume | null | undefined, maintenant: number): boolean {
  if (!mission?.deadline) return true;
  const debut = new Date(mission.deadline).getTime();
  return Number.isNaN(debut) || maintenant < debut + 24 * 60 * 60 * 1000;
}

/**
 * La mission d'une invitation accepte encore quelqu'un : même règle que l'API (ProposalResponseService).
 * La date limite ne compte pas, c'est une invitation directe de l'entreprise (décision D17).
 */
export function missionInvitationOuverte(proposition: Proposition): boolean {
  return proposition.mission?.active !== false && !proposition.mission?.closed_at;
}

/** L'invitation attend une réponse et peut encore être acceptée. */
export function invitationEnAttente(proposition: Proposition): boolean {
  return proposition.status === "pending" && missionInvitationOuverte(proposition);
}

export function recompenseMission(reward: number | string | null | undefined): string {
  const montant = formaterFcfa(reward);
  return montant ? `${montant} et +${XP_MISSION_VALIDEE} XP à la validation` : `+${XP_MISSION_VALIDEE} XP à la validation`;
}

/** L'offre attend la réponse du candidat : ni acceptée ni déclinée, et délai non dépassé. */
export function offreEnAttente(candidature: Candidature, maintenant: number): boolean {
  const offre = candidature.mission_offers;
  return (
    candidature.status === "accepted" &&
    !!offre &&
    !offre.accepted_at &&
    !offre.declined_at &&
    estFutur(offre.expires_at, maintenant)
  );
}

export function quetesDuJour({
  profil,
  candidatures = [],
  inscriptions = [],
  propositions = [],
  maintenant,
}: {
  profil: ProfilCandidat | null | undefined;
  candidatures?: Candidature[];
  inscriptions?: Inscription[];
  propositions?: Proposition[];
  maintenant: number;
}): Quete[] {
  const quetes: Quete[] = [];

  // 1. Offres à confirmer, la plus urgente d'abord
  candidatures
    .filter((c) => c.mission && offreEnAttente(c, maintenant))
    .sort((a, b) => new Date(a.mission_offers?.expires_at ?? "9999").getTime() - new Date(b.mission_offers?.expires_at ?? "9999").getTime())
    .forEach((c) => {
      quetes.push({
        id: `offre-${c.mission_offers!.id}`,
        titre: `Confirme l'offre : ${c.mission!.title}`,
        detail: c.mission!.company ? `${c.mission!.company} a retenu ta candidature.` : "Ta candidature a été retenue.",
        lien: `/dashboard/candidats/missions/offers/${c.mission_offers!.id}`,
        action: "Voir l'offre",
        recompense: recompenseMission(c.mission!.reward),
        echeance: c.mission_offers!.expires_at ?? undefined,
      });
    });

  // 2. Invitations des entreprises en attente de réponse, la plus ancienne d'abord (pas de délai de réponse en base)
  propositions
    .filter(invitationEnAttente)
    .sort((a, b) => new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime())
    .forEach((p) => {
      quetes.push({
        id: `invitation-${p.id}`,
        titre: `Réponds à l'invitation : ${p.mission.title}`,
        detail: p.entreprise?.nom_entreprise
          ? `${p.entreprise.nom_entreprise} t'invite directement sur cette mission.`
          : "Une entreprise t'invite directement sur cette mission.",
        lien: "/dashboard/candidats/invitations",
        action: "Répondre",
        recompense: recompenseMission(p.mission.reward),
      });
    });

  // 3. Examens finaux prêts
  inscriptions
    .filter((i) => i.status === "evaluation_ready" && i.course)
    .forEach((i) => {
      quetes.push({
        id: `examen-${i.id}`,
        titre: `Passe l'examen final : ${i.course!.title}`,
        detail: "Tu as terminé les modules. L'examen final valide ta certification.",
        lien: lienFormation(i),
        action: "Passer l'examen",
        recompense: i.course!.reward_xp ? `+${i.course!.reward_xp} XP à la certification` : undefined,
      });
    });

  // 4. Candidatures commencées mais pas envoyées, tant que la mission est ouverte
  candidatures
    .filter((c) => c.status === "draft" && c.mission && missionOuverte(c.mission, maintenant))
    .forEach((c) => {
      const jusquau = formaterDateCourte(c.mission!.deadline);
      quetes.push({
        id: `brouillon-${c.id}`,
        titre: `Finalise ta candidature : ${c.mission!.title}`,
        detail: `Ta candidature est commencée mais pas encore envoyée.${jusquau ? ` Mission ouverte jusqu'au ${jusquau}.` : ""}`,
        lien: `/dashboard/candidats/missions/${c.mission!.id}/application`,
        action: "Finaliser",
        recompense: recompenseMission(c.mission!.reward),
      });
    });

  // 5. Formations en cours, la plus avancée d'abord
  inscriptions
    .filter((i) => (i.status === "learning" || i.status === "enrolled") && i.course)
    .sort((a, b) => (b.progress_percentage ?? 0) - (a.progress_percentage ?? 0))
    .forEach((i) => {
      quetes.push({
        id: `formation-${i.id}`,
        titre: `Continue : ${i.course!.title}`,
        detail: `Progression : ${Math.round(i.progress_percentage ?? 0)} %.`,
        lien: lienFormation(i),
        action: "Continuer",
        recompense: i.course!.reward_xp ? `+${i.course!.reward_xp} XP à la certification` : undefined,
      });
    });

  // 6. Profil sans compétences : le CV n'a pas encore été lu
  if (profil && !profil.domaine_competence && (profil.skills?.length ?? 0) === 0) {
    quetes.push({
      id: "profil-cv",
      titre: "Dépose ton CV pour évaluer ton rang",
      detail: "Le Système lit ton CV pour fixer ton rang de départ et tes compétences.",
      lien: "/dashboard/candidats/profile",
      action: "Mettre à jour mon profil",
    });
  }

  // 7. Rien d'autre à faire : aller chercher une mission
  if (quetes.length === 0) {
    quetes.push({
      id: "exploration",
      titre: "Trouve ta prochaine mission",
      detail: "Les missions ouvertes à ton rang t'attendent.",
      lien: "/dashboard/candidats/missions",
      action: "Voir les missions",
    });
  }

  return quetes.slice(0, NOMBRE_MAX_QUETES);
}
