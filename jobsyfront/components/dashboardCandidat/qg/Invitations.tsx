import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { CarteRealite, ErreurSection, LienDiscret, PastilleStatut, type TonStatut } from "./CarteRealite";
import { invitationEnAttente, missionInvitationOuverte } from "./quetes";
import type { Proposition } from "./types";

const NOMBRE_AFFICHE = 3;
export const LIEN_INVITATIONS = "/dashboard/candidats/invitations";

const STATUTS: Record<string, { libelle: string; ton: TonStatut }> = {
  pending: { libelle: "En attente de ta réponse", ton: "action" },
  accepted: { libelle: "Acceptée", ton: "succes" },
  declined: { libelle: "Déclinée", ton: "neutre" },
  expired: { libelle: "Expirée", ton: "neutre" },
};

/** Statut affiché d'une invitation : une invitation en attente sur une mission fermée ne peut plus être acceptée. */
export function statutInvitation(proposition: Proposition): { libelle: string; ton: TonStatut } {
  if (proposition.status === "pending" && !missionInvitationOuverte(proposition)) return { libelle: "Mission fermée", ton: "neutre" };
  return STATUTS[proposition.status] ?? { libelle: proposition.status, ton: "neutre" };
}

type Props = {
  propositions: Proposition[] | undefined;
  erreur: boolean;
  reessayer: () => void;
};

/** Propositions envoyées directement par les entreprises (« invitations de guilde »). */
export function Invitations({ propositions, erreur, reessayer }: Props) {
  // Celles qui attendent une réponse d'abord
  const triees = propositions ? [...propositions].sort((a, b) => Number(invitationEnAttente(b)) - Number(invitationEnAttente(a))) : [];

  return (
    <CarteRealite
      titre="Invitations des entreprises"
      lienPied={triees.length > 0 ? <LienDiscret href={LIEN_INVITATIONS}>Voir toutes mes invitations</LienDiscret> : undefined}
    >
      {erreur ? (
        <ErreurSection texte="Les propositions des entreprises n'ont pas pu être chargées." reessayer={reessayer} />
      ) : !propositions ? (
        <p className="text-slate-500">Chargement des propositions…</p>
      ) : triees.length === 0 ? (
        <p className="text-slate-600">
          Aucune proposition pour l&apos;instant. Une entreprise peut t&apos;inviter directement sur une mission quand ton profil lui correspond.
        </p>
      ) : (
        <ul className="grid gap-3">
          {triees.slice(0, NOMBRE_AFFICHE).map((proposition) => {
            const statut = statutInvitation(proposition);
            const montant = formaterFcfa(proposition.mission?.reward);
            const recue = formaterDateCourte(proposition.sent_at);
            return (
              <li key={proposition.id} className="grid gap-1.5 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="min-w-0 font-bold break-words">{proposition.entreprise?.nom_entreprise}</p>
                  <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
                </div>
                <p className="text-sm text-slate-700">
                  {proposition.mission?.title}
                  {montant ? `, ${montant}` : ""}
                </p>
                {recue && <p className="text-xs text-slate-500">Reçue le {recue}</p>}
                {proposition.status === "pending" && missionInvitationOuverte(proposition) && (
                  <LienDiscret href={LIEN_INVITATIONS} className="justify-self-start">
                    Répondre
                  </LienDiscret>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </CarteRealite>
  );
}
