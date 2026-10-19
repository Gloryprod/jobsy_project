"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import useSWR, { mutate as mettreAJourCache } from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { formaterDateCourte, formaterHeure, formaterJour } from "@/lib/formats";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, Echeance, FenetreSysteme, LienSysteme, LignesValeurs, useMaintenant, type TonSysteme } from "@/components/systeme";
import { ConfirmationRefus } from "../commun/ConfirmationRefus";
import { lignesRecompense } from "../commun/lignesRecompense";
import { Alerte } from "../epreuve/Alerte";
import { DetailsRendezVous } from "./DetailsRendezVous";
import { etatOffre, type EtatOffre } from "./regles";
import type { OffreDetaillee } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

export const LIEN_JOURNAL = "/dashboard/candidats/missions/en_cours";

const TITRES: Record<EtatOffre, string> = {
  en_attente: "Ta candidature est retenue",
  acceptee: "Offre acceptée",
  declinee: "Offre déclinée",
  expiree: "Le délai de réponse est dépassé",
};

const TONS: Record<EtatOffre, TonSysteme> = { en_attente: "recompense", acceptee: "recompense", declinee: "info", expiree: "alerte" };

/** Les refus de l'API, dits en clair (ses messages vouvoient le candidat). */
function messageReponse(erreur: unknown): string {
  switch (statutErreur(erreur)) {
    case 409:
      return "Tu as déjà répondu à cette offre. La page est à jour.";
    case 410:
      return "Le délai de réponse est dépassé : cette offre ne peut plus être acceptée.";
    case 403:
      return "Cette offre ne t'est pas adressée.";
    default:
      return messageErreur(erreur, "Ta réponse n'a pas pu être envoyée. Réessaie.");
  }
}

/**
 * L'offre de mission envoyée par l'entreprise après la sélection : accepter avant la fin du délai, ou décliner.
 * La page suit l'état réel de l'offre (en attente, acceptée, déclinée, expirée).
 */
export function OffreMission({ offreId }: { offreId: string }) {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;
  const maintenant = useMaintenant();
  const offre = useSWR<OffreDetaillee>(`/candidat/mission-offers/${offreId}`, lireDonnees);

  const [envoi, setEnvoi] = useState<"accepted" | "declined" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [refusOuvert, setRefusOuvert] = useState(false);
  const [erreurRefus, setErreurRefus] = useState<string | null>(null);

  const titreRef = useRef<HTMLHeadingElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const reponseEnvoyee = useRef(false);

  const repondre = async (statut: "accepted" | "declined") => {
    setEnvoi(statut);
    setErreur(null);
    setErreurRefus(null);
    try {
      await api.post(`/candidat/mission-offers/${offreId}/respond`, { status: statut });
      reponseEnvoyee.current = true;
      setRefusOuvert(false);
      await offre.mutate();
      // Le QG et les portails affichent aussitôt le nouveau statut
      if (candidatId) void mettreAJourCache(`/missions/${candidatId}/myapplications`);
      if (statut === "accepted") titreRef.current?.focus();
    } catch (e) {
      const code = statutErreur(e);
      // 409 ou 410 : l'offre a changé entre-temps, la page se met à jour
      if (code === 409 || code === 410) void offre.mutate();
      if (statut === "declined" && code !== 409) {
        setErreurRefus(messageReponse(e));
      } else {
        reponseEnvoyee.current = code === 409;
        setRefusOuvert(false);
        setErreur(messageReponse(e));
      }
    } finally {
      setEnvoi(null);
    }
  };

  const ouvrirRefus = (bouton: HTMLElement) => {
    declencheur.current = bouton;
    reponseEnvoyee.current = false;
    setErreurRefus(null);
    setRefusOuvert(true);
  };

  if (chargementUtilisateur || offre.isLoading) return <SqueletteOffre />;

  const retour = (
    <Link
      href="/dashboard/candidats"
      className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Retour au tableau de bord
    </Link>
  );

  const o = offre.data;
  if (offre.error || !o) {
    const introuvable = statutErreur(offre.error) === 404;
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
        {retour}
        <FenetreSysteme
          etiquette="Système"
          titre={introuvable ? "Offre introuvable" : "L'offre n'a pas pu se charger"}
          ton="alerte"
          balayage={false}
        >
          <p className="text-systeme-attenue">
            {introuvable
              ? "Cette offre n'existe plus ou ne t'est pas adressée. Si l'entreprise l'a remplacée par une nouvelle offre, tu la trouveras dans tes notifications."
              : "Vérifie ta connexion internet, puis réessaie."}
          </p>
          {introuvable ? (
            <LienSysteme href="/dashboard/candidats/notifications" className="justify-self-start">
              Voir mes notifications
            </LienSysteme>
          ) : (
            <BoutonSysteme onClick={() => offre.mutate()} className="justify-self-start">
              Réessayer
            </BoutonSysteme>
          )}
        </FenetreSysteme>
      </div>
    );
  }

  const mission = o.application?.mission ?? null;
  const entreprise = mission?.company || "L'entreprise";
  // Avant que l'heure du navigateur soit connue, l'offre est présentée comme en attente, sans compte à rebours
  const etat = etatOffre(o, maintenant ?? 0);
  const jour = formaterJour(o.start_date);
  const heure = formaterHeure(o.start_time);

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      {retour}

      <header className="grid gap-1">
        <h1 className="font-systeme text-3xl leading-tight font-bold text-balance text-[#000080]">
          <span className="sr-only">Offre de mission : </span>
          {mission?.title ?? "Mission"}
        </h1>
        <p className="text-slate-600">{[mission?.company, mission?.location].filter(Boolean).join(", ")}</p>
      </header>

      <FenetreSysteme etiquette="Offre de mission" ton={TONS[etat]} className="gap-5">
        <h2
          ref={titreRef}
          tabIndex={-1}
          className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-systeme-lueur"
        >
          {TITRES[etat]}
        </h2>

        {etat === "en_attente" && (
          <div className="grid gap-1.5">
            <p className="text-systeme-attenue">
              {entreprise} te propose cette mission. Confirme ta présence avant la fin du délai : ensuite, l&apos;offre ne pourra plus être
              acceptée.
            </p>
            {o.expires_at && maintenant !== null && <Echeance date={o.expires_at} className="font-semibold text-systeme-alerte" />}
          </div>
        )}

        {etat === "acceptee" && (
          <p className="text-systeme-attenue">
            Tu as accepté cette offre{formaterDateCourte(o.accepted_at) ? ` le ${formaterDateCourte(o.accepted_at)}` : ""}.
            {jour ? ` Rendez-vous le ${jour}${heure ? ` à ${heure}` : ""}.` : ""} Suis la mission étape par étape dans ton journal.
          </p>
        )}

        {etat === "declinee" && (
          <p className="text-systeme-attenue">
            Tu as décliné cette offre{formaterDateCourte(o.declined_at) ? ` le ${formaterDateCourte(o.declined_at)}` : ""}. {entreprise} voit ta
            réponse dans son suivi de la mission.
          </p>
        )}

        {etat === "expiree" && (
          <p className="text-systeme-attenue">
            Cette offre attendait ta réponse{formaterDateCourte(o.expires_at) ? ` avant le ${formaterDateCourte(o.expires_at)}` : ""}. Elle ne peut
            plus être acceptée. Tu peux encore la décliner pour prévenir l&apos;entreprise.
          </p>
        )}

        {(etat === "en_attente" || etat === "acceptee") && (
          <>
            <LignesValeurs lignes={lignesRecompense(mission?.reward)} />
            <DetailsRendezVous offre={o} />
          </>
        )}

        <Alerte message={erreur} />

        <div className="grid gap-2">
          <div className="flex flex-wrap gap-2.5">
            {etat === "en_attente" && (
              <BoutonSysteme onClick={() => repondre("accepted")} chargement={envoi === "accepted"} disabled={envoi !== null}>
                Accepter l&apos;offre
              </BoutonSysteme>
            )}
            {(etat === "en_attente" || etat === "expiree") && (
              <BoutonSysteme variante="contour" onClick={(e) => ouvrirRefus(e.currentTarget)} disabled={envoi !== null}>
                Décliner
              </BoutonSysteme>
            )}
            {etat === "acceptee" && <LienSysteme href={LIEN_JOURNAL}>Suivre la mission</LienSysteme>}
            {(etat === "declinee" || etat === "expiree") && (
              <LienSysteme href="/dashboard/candidats/missions" variante={etat === "expiree" ? "contour" : "plein"}>
                Voir les missions
              </LienSysteme>
            )}
          </div>
          {etat === "en_attente" && <p className="text-sm text-systeme-attenue">En acceptant, tu t&apos;engages à te présenter au rendez-vous.</p>}
        </div>
      </FenetreSysteme>

      <ConfirmationRefus
        ouvert={refusOuvert}
        titre="Décliner cette offre ?"
        description={
          <>
            <p>{entreprise} verra ta réponse dans son suivi de la mission.</p>
            <p>Une fois déclinée, l&apos;offre ne peut plus être acceptée.</p>
          </>
        }
        libelleConfirmer="Oui, je décline"
        chargement={envoi === "declined"}
        erreur={erreurRefus}
        onConfirmer={() => repondre("declined")}
        onFermer={() => setRefusOuvert(false)}
        cibleFocus={() => (reponseEnvoyee.current ? titreRef.current : declencheur.current)}
      />
    </div>
  );
}

function SqueletteOffre() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement de l'offre">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-96 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
    </div>
  );
}
