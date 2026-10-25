"use client";

import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { partageRecompense, XP_MISSION_VALIDEE } from "@/lib/recompense";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme, LienSysteme } from "@/components/systeme";
import { CarteRealite, LienDiscret, PastilleStatut } from "../qg/CarteRealite";
import { CarteMissionConfirmee, LienContrat } from "./CarteMissionConfirmee";
import { STATUT_ARRETEE, STATUTS_TERMINES } from "./regles";
import type { OffreDetaillee } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

/**
 * Le journal de quêtes : les missions confirmées (offre acceptée), en cours puis terminées.
 * Chaque mission en cours suit ses cinq étapes réelles, de l'arrivée au paiement.
 */
export function JournalMissions() {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;
  const offres = useSWR<OffreDetaillee[]>(candidatId ? "/candidat/my-confirmed-missions" : null, lireDonnees);

  if (chargementUtilisateur || (candidatId && offres.isLoading)) return <SqueletteJournal />;

  const enTete = (
    <>
      <Link
        href="/dashboard/candidats"
        className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Retour au tableau de bord
      </Link>
      <header className="grid gap-1">
        <h1 className="font-systeme text-3xl leading-tight font-bold text-balance text-[#000080]">Missions confirmées</h1>
        <p className="text-slate-600">Ton journal de quêtes : chaque offre acceptée, de ton arrivée jusqu&apos;au paiement.</p>
      </header>
    </>
  );

  if (offres.error || !offres.data) {
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
        {enTete}
        <FenetreSysteme etiquette="Système" titre="Le journal n'a pas pu se charger" ton="alerte" balayage={false}>
          <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
          <BoutonSysteme onClick={() => offres.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        </FenetreSysteme>
      </div>
    );
  }

  const enCours = offres.data.filter((o) => !STATUTS_TERMINES.includes(o.status ?? "accepted"));
  const terminees = offres.data.filter((o) => STATUTS_TERMINES.includes(o.status ?? ""));

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      {enTete}

      {offres.data.length === 0 ? (
        <FenetreSysteme etiquette="Système" titre="Aucune mission confirmée pour l'instant" balayage={false}>
          <p className="text-systeme-attenue">
            Quand tu acceptes l&apos;offre d&apos;une entreprise, la mission apparaît ici. Chaque mission validée rapporte sa récompense et +
            {XP_MISSION_VALIDEE} XP.
          </p>
          <LienSysteme href="/dashboard/candidats/missions" className="justify-self-start">
            Voir les missions
          </LienSysteme>
        </FenetreSysteme>
      ) : (
        <>
          <section aria-labelledby="missions-en-cours" className="grid gap-4">
            <h2 id="missions-en-cours" className="font-systeme text-xl font-bold text-[#000080]">
              En cours{enCours.length > 0 ? ` (${enCours.length})` : ""}
            </h2>
            {enCours.length === 0 ? (
              <p className="text-slate-600">Aucune mission en cours.</p>
            ) : (
              <ul className="grid gap-5">
                {enCours.map((offre) => (
                  <CarteMissionConfirmee key={offre.id} offre={offre} onMiseAJour={() => offres.mutate()} />
                ))}
              </ul>
            )}
          </section>

          {terminees.length > 0 && (
            <CarteRealite titre="Missions terminées">
              <ul className="grid gap-3">
                {terminees.map((offre) => (
                  <MissionTerminee key={offre.id} offre={offre} />
                ))}
              </ul>
            </CarteRealite>
          )}
        </>
      )}
    </div>
  );
}

/** Mission terminée : validée et payée, ou arrêtée par l'entreprise. Couche réalité, compacte. */
function MissionTerminee({ offre }: { offre: OffreDetaillee }) {
  const mission = offre.application?.mission ?? null;
  const arretee = offre.status === STATUT_ARRETEE;
  const partage = partageRecompense(mission?.reward);
  const payee = offre.payment_status === "paid" || !!offre.paid_at;
  const le = formaterDateCourte(offre.paid_at ?? offre.validated_at);

  return (
    <li className="grid gap-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold break-words">{mission?.title ?? "Mission"}</p>
          {mission?.company && <p className="text-sm text-slate-500">{mission.company}</p>}
        </div>
        <PastilleStatut ton={arretee ? "echec" : "succes"}>{arretee ? "Arrêtée après l'intégration" : "Validée"}</PastilleStatut>
      </div>
      {arretee ? (
        <p className="text-sm text-slate-600">L&apos;entreprise n&apos;a pas donné suite après ton arrivée.</p>
      ) : (
        <p className="text-sm text-slate-700">
          {payee && partage
            ? `${formaterFcfa(partage.net)} versés dans ton portefeuille${le ? ` le ${le}` : ""} et +${XP_MISSION_VALIDEE} XP.`
            : `+${XP_MISSION_VALIDEE} XP gagnés.`}
        </p>
      )}
      <div className="flex flex-wrap gap-x-5">
        {!arretee && payee && <LienDiscret href="/dashboard/candidats/loot">Voir mon portefeuille</LienDiscret>}
        <LienContrat
          chemin={offre.contract_path}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#000080] underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        />
      </div>
    </li>
  );
}

function SqueletteJournal() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement des missions confirmées">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-96 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
    </div>
  );
}
