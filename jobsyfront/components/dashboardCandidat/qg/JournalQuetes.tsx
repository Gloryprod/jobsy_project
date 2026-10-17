import { formaterFcfa } from "@/lib/formats";
import { CarteRealite, ErreurSection, LienDiscret, LienRealite, PastilleStatut, type TonStatut } from "./CarteRealite";
import { missionOuverte, offreEnAttente } from "./quetes";
import type { Candidature } from "./types";

const NOMBRE_AFFICHE = 5;

type Statut = { libelle: string; ton: TonStatut; lien?: string; action?: string };

/** Où en est chaque candidature, en clair, avec l'action utile quand il y en a une. */
export function statutCandidature(candidature: Candidature, maintenant: number): Statut {
  const offre = candidature.mission_offers;
  const mission = candidature.mission;

  switch (candidature.status) {
    case "draft": {
      return mission && missionOuverte(mission, maintenant)
        ? { libelle: "Brouillon", ton: "action", lien: `/dashboard/candidats/missions/${mission.id}/application`, action: "Finaliser" }
        : { libelle: "Brouillon, mission fermée", ton: "neutre" };
    }
    case "pending":
      return { libelle: "En attente de l'entreprise", ton: "attente" };
    case "rejected":
      return { libelle: "Non retenue", ton: "echec" };
    case "accepted": {
      if (!offre) return { libelle: "Retenue", ton: "succes" };
      if (offreEnAttente(candidature, maintenant)) {
        return { libelle: "Offre à confirmer", ton: "action", lien: `/dashboard/candidats/missions/offers/${offre.id}`, action: "Voir l'offre" };
      }
      if (offre.declined_at || offre.status === "declined") return { libelle: "Offre déclinée", ton: "neutre" };
      if (offre.status === "validated" || offre.status === "completed") return { libelle: "Validée", ton: "succes" };
      if (offre.status === "rejected_after_onboarding") return { libelle: "Arrêtée après l'intégration", ton: "echec" };
      if (offre.accepted_at) return { libelle: "En cours", ton: "action", lien: "/dashboard/candidats/missions/en_cours", action: "Suivre" };
      return { libelle: "Offre expirée", ton: "neutre" };
    }
    default:
      return { libelle: candidature.status, ton: "neutre" };
  }
}

type Props = {
  candidatures: Candidature[] | undefined;
  erreur: boolean;
  reessayer: () => void;
  maintenant: number | null;
};

export function JournalQuetes({ candidatures, erreur, reessayer, maintenant }: Props) {
  return (
    <CarteRealite
      titre="Mes candidatures"
      lienPied={candidatures?.length ? <LienDiscret href="/dashboard/candidats/missions/en_cours">Voir mes missions confirmées</LienDiscret> : undefined}
    >
      {erreur ? (
        <ErreurSection texte="Tes candidatures n'ont pas pu être chargées." reessayer={reessayer} />
      ) : !candidatures || maintenant === null ? (
        <p className="text-slate-500">Chargement de tes candidatures…</p>
      ) : candidatures.length === 0 ? (
        <div className="grid gap-3">
          <p className="text-slate-600">Aucune candidature pour l&apos;instant. Chaque mission validée rapporte de l&apos;argent et 250 XP.</p>
          <LienRealite href="/dashboard/candidats/missions" className="justify-self-start">
            Voir les missions
          </LienRealite>
        </div>
      ) : (
        <ul className="grid gap-3">
          {candidatures.slice(0, NOMBRE_AFFICHE).map((candidature) => {
            const statut = statutCandidature(candidature, maintenant);
            const montant = formaterFcfa(candidature.mission?.reward);
            return (
              <li key={candidature.id} className="grid gap-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold break-words">{candidature.mission?.title ?? "Mission supprimée"}</p>
                    <p className="text-sm text-slate-500">{[candidature.mission?.company, montant].filter(Boolean).join(", ")}</p>
                  </div>
                  <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
                </div>
                {statut.lien && (
                  <LienDiscret href={statut.lien} className="justify-self-start">
                    {statut.action}
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
