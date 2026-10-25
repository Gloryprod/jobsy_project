"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme, useMaintenant } from "@/components/systeme";
import { FenetreStatut } from "./FenetreStatut";
import { QuetesDuJour } from "./QuetesDuJour";
import { JournalQuetes } from "./JournalQuetes";
import { Donjons } from "./Donjons";
import { Invitations } from "./Invitations";
import { quetesDuJour } from "./quetes";
import type { Candidature, Inscription, ProfilCandidat, Proposition } from "./types";

// Toutes ces routes répondent { data: ... }
const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

const STATUTS_MISSION_VALIDEE = ["validated", "completed"];

/**
 * Le QG du candidat (tableau de bord) : statut et quêtes du jour dans la couche Système,
 * suivi des candidatures, formations et propositions dans la couche réalité.
 */
export function QGCandidat() {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;
  const maintenant = useMaintenant();

  const profil = useSWR<ProfilCandidat>("/candidat/profile-elements", lireDonnees);
  const candidatures = useSWR<Candidature[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, lireDonnees);
  const inscriptions = useSWR<Inscription[]>(candidatId ? "/courses/my-learnings" : null, lireDonnees);
  const propositions = useSWR<Proposition[]>(candidatId ? "/candidat/proposals" : null, lireDonnees);

  if (chargementUtilisateur || profil.isLoading) return <SqueletteQG />;

  if (profil.error || !profil.data) {
    return (
      <div className="p-2 sm:p-4">
        <FenetreSysteme etiquette="Système" titre="Le QG n'a pas pu se charger" ton="alerte" balayage={false} className="max-w-xl">
          <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
          <BoutonSysteme onClick={() => profil.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        </FenetreSysteme>
      </div>
    );
  }

  // Les quêtes attendent les trois listes dont elles dépendent (ou leur erreur)
  const listesPretes =
    (candidatures.data || candidatures.error) && (inscriptions.data || inscriptions.error) && (propositions.data || propositions.error);
  const quetes =
    maintenant !== null && listesPretes
      ? quetesDuJour({
          profil: profil.data,
          candidatures: candidatures.data,
          inscriptions: inscriptions.data,
          propositions: propositions.data,
          maintenant,
        })
      : null;

  const missionsValidees = candidatures.data
    ? candidatures.data.filter((c) => STATUTS_MISSION_VALIDEE.includes(c.mission_offers?.status ?? "")).length
    : null;
  const formationsCertifiees = inscriptions.data ? inscriptions.data.filter((i) => i.status === "certified").length : null;

  return (
    <div className="grid gap-6 p-2 font-lisible sm:p-4">
      <h1 className="sr-only">Tableau de bord</h1>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <FenetreStatut
          prenom={user?.prenom}
          profil={profil.data}
          missionsValidees={missionsValidees}
          formationsCertifiees={formationsCertifiees}
        />
        <QuetesDuJour quetes={quetes} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <JournalQuetes
          candidatures={candidatures.data}
          erreur={!!candidatures.error}
          reessayer={() => candidatures.mutate()}
          maintenant={maintenant}
        />
        <Donjons inscriptions={inscriptions.data} erreur={!!inscriptions.error} reessayer={() => inscriptions.mutate()} />
        <Invitations propositions={propositions.data} erreur={!!propositions.error} reessayer={() => propositions.mutate()} />
      </div>
    </div>
  );
}

/** Squelette du chargement : il reprend la mise en page pour qu'elle ne saute pas à l'arrivée des données. */
function SqueletteQG() {
  return (
    <div className="grid gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement du tableau de bord">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="h-72 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
        <div className="h-72 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
