"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme, LienSysteme, MessageSysteme, useMaintenant, type TonSysteme } from "@/components/systeme";
import { ConfirmationRefus } from "../commun/ConfirmationRefus";
import { CarteRealite } from "../qg/CarteRealite";
import { invitationEnAttente } from "../qg/quetes";
import type { Candidature, Proposition } from "../qg/types";
import { InvitationEnAttente, InvitationRepondue } from "./CarteInvitation";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

type Annonce = { ton: TonSysteme; titre: string; texte: ReactNode; lien?: { href: string; libelle: string } };

const DEJA_TRAITEE: Annonce = {
  ton: "info",
  titre: "Invitation déjà traitée",
  texte: "Cette invitation a déjà reçu une réponse, peut-être depuis l'e-mail. La liste ci-dessous est à jour.",
};

const ERREUR_ENVOI = "Ta réponse n'a pas pu être envoyée. Réessaie.";

/**
 * Les invitations envoyées directement par les entreprises (« invitations de guilde ») :
 * accepter ou décliner depuis l'application, avec les mêmes règles que les liens de l'e-mail.
 */
export function InvitationsGuilde() {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;
  const maintenant = useMaintenant();

  // Mêmes clés que le QG : le tableau de bord est à jour dès le retour
  const propositions = useSWR<Proposition[]>(candidatId ? "/candidat/proposals" : null, lireDonnees);
  const candidatures = useSWR<Candidature[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, lireDonnees);

  const [enCours, setEnCours] = useState<{ id: number; action: "accept" | "decline" } | null>(null);
  const [erreurs, setErreurs] = useState<Record<number, string>>({});
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const [aDecliner, setADecliner] = useState<Proposition | null>(null);
  const [erreurRefus, setErreurRefus] = useState<string | null>(null);

  const annonceRef = useRef<HTMLDivElement>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const refusEnvoye = useRef(false);

  // Le bouton cliqué disparaît avec la réponse : le focus va au message qui annonce la suite
  useEffect(() => {
    if (annonce) annonceRef.current?.focus();
  }, [annonce]);

  const changerErreur = (id: number, message: string | null) =>
    setErreurs((avant) => {
      const apres = { ...avant };
      if (message) apres[id] = message;
      else delete apres[id];
      return apres;
    });

  const accepter = async (proposition: Proposition) => {
    const entreprise = proposition.entreprise?.nom_entreprise || "L'entreprise";
    setEnCours({ id: proposition.id, action: "accept" });
    changerErreur(proposition.id, null);
    setAnnonce(null);
    try {
      await api.post(`/candidat/proposals/${proposition.id}/accept`);
      setAnnonce({
        ton: "recompense",
        titre: "Invitation acceptée",
        texte: `${entreprise} prépare maintenant ton offre de mission : date, lieu de rendez-vous et instructions. Elle t'arrivera par e-mail et dans tes notifications, avec un délai pour la confirmer.`,
        lien: { href: "/dashboard/candidats/notifications", libelle: "Voir mes notifications" },
      });
      void candidatures.mutate();
      await propositions.mutate();
    } catch (e) {
      if (statutErreur(e) === 409) {
        setAnnonce({ ...DEJA_TRAITEE });
      } else {
        changerErreur(proposition.id, messageErreur(e, ERREUR_ENVOI));
      }
      // 409 ou 410 : l'invitation a changé ailleurs (e-mail, autre onglet, mission fermée)
      if (statutErreur(e) === 409 || statutErreur(e) === 410) void propositions.mutate();
    } finally {
      setEnCours(null);
    }
  };

  const ouvrirRefus = (proposition: Proposition, bouton: HTMLElement) => {
    declencheur.current = bouton;
    refusEnvoye.current = false;
    setErreurRefus(null);
    setADecliner(proposition);
  };

  const confirmerRefus = async () => {
    if (!aDecliner) return;
    const proposition = aDecliner;
    const entreprise = proposition.entreprise?.nom_entreprise || "L'entreprise";
    setEnCours({ id: proposition.id, action: "decline" });
    setErreurRefus(null);
    changerErreur(proposition.id, null);
    try {
      await api.post(`/candidat/proposals/${proposition.id}/decline`);
      refusEnvoye.current = true;
      setAnnonce({ ton: "info", titre: "Invitation déclinée", texte: `${entreprise} verra ta réponse dans le suivi de ses propositions.` });
      setADecliner(null);
      void propositions.mutate();
    } catch (e) {
      if (statutErreur(e) === 409) {
        refusEnvoye.current = true;
        setAnnonce({ ...DEJA_TRAITEE });
        setADecliner(null);
        void propositions.mutate();
      } else {
        setErreurRefus(messageErreur(e, ERREUR_ENVOI));
      }
    } finally {
      setEnCours(null);
    }
  };

  if (chargementUtilisateur || (candidatId && propositions.isLoading)) return <SqueletteInvitations />;

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
        <h1 className="font-systeme text-3xl leading-tight font-bold text-balance text-[#000080]">Invitations des entreprises</h1>
        <p className="text-slate-600">
          Une entreprise peut t&apos;inviter directement sur une mission quand ton profil lui correspond. Réponds ici ou avec les boutons de
          l&apos;e-mail reçu.
        </p>
      </header>
    </>
  );

  if (propositions.error || !propositions.data) {
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
        {enTete}
        <FenetreSysteme etiquette="Système" titre="Les invitations n'ont pas pu se charger" ton="alerte" balayage={false}>
          <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
          <BoutonSysteme onClick={() => propositions.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        </FenetreSysteme>
      </div>
    );
  }

  // Celles qu'on peut encore accepter d'abord, la plus ancienne en tête ; les missions fermées ensuite
  const enAttente = propositions.data
    .filter((p) => p.status === "pending")
    .sort(
      (a, b) =>
        Number(invitationEnAttente(b)) - Number(invitationEnAttente(a)) ||
        new Date(a.sent_at ?? 0).getTime() - new Date(b.sent_at ?? 0).getTime(),
    );
  const repondues = propositions.data
    .filter((p) => p.status !== "pending")
    .sort((a, b) => new Date(b.responded_at ?? b.sent_at ?? 0).getTime() - new Date(a.responded_at ?? a.sent_at ?? 0).getTime());

  const candidaturePour = (proposition: Proposition) =>
    candidatures.data?.find((c) => c.mission?.id === (proposition.mission?.id ?? proposition.mission_id)) ?? null;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      {enTete}

      {/* Zone d'annonce toujours présente (lecteurs d'écran), sans place dans la page tant qu'elle est vide */}
      <div ref={annonceRef} tabIndex={-1} role="status" className={annonce ? "outline-none" : "sr-only"}>
        {annonce && (
          <MessageSysteme
            etiquette="Système"
            titre={annonce.titre}
            ton={annonce.ton}
            niveauTitre={2}
            actions={
              annonce.lien ? (
                <LienSysteme href={annonce.lien.href} variante="contour">
                  {annonce.lien.libelle}
                </LienSysteme>
              ) : undefined
            }
          >
            <p>{annonce.texte}</p>
          </MessageSysteme>
        )}
      </div>

      {propositions.data.length === 0 ? (
        <FenetreSysteme etiquette="Système" titre="Aucune invitation pour l'instant" balayage={false}>
          <p className="text-systeme-attenue">En attendant une invitation, les missions ouvertes à ton rang t&apos;attendent.</p>
          <LienSysteme href="/dashboard/candidats/missions" className="justify-self-start">
            Voir les missions
          </LienSysteme>
        </FenetreSysteme>
      ) : (
        <>
          <section aria-labelledby="invitations-en-attente" className="grid gap-4">
            <h2 id="invitations-en-attente" className="font-systeme text-xl font-bold text-[#000080]">
              En attente de ta réponse{enAttente.length > 0 ? ` (${enAttente.length})` : ""}
            </h2>
            {enAttente.length === 0 ? (
              <p className="text-slate-600">Aucune invitation n&apos;attend ta réponse.</p>
            ) : (
              <ul className="grid gap-5">
                {enAttente.map((proposition) => (
                  <InvitationEnAttente
                    key={proposition.id}
                    proposition={proposition}
                    enCours={enCours?.id === proposition.id ? enCours.action : null}
                    occupe={enCours !== null}
                    erreur={erreurs[proposition.id] ?? null}
                    onAccepter={() => accepter(proposition)}
                    onDecliner={(bouton) => ouvrirRefus(proposition, bouton)}
                  />
                ))}
              </ul>
            )}
          </section>

          {repondues.length > 0 && (
            <CarteRealite titre="Déjà répondu">
              <ul className="grid gap-3">
                {repondues.map((proposition) => (
                  <InvitationRepondue
                    key={proposition.id}
                    proposition={proposition}
                    candidature={candidaturePour(proposition)}
                    maintenant={maintenant}
                  />
                ))}
              </ul>
            </CarteRealite>
          )}
        </>
      )}

      <ConfirmationRefus
        ouvert={!!aDecliner}
        titre="Décliner cette invitation ?"
        description={
          <>
            <p>
              {aDecliner?.entreprise?.nom_entreprise || "L'entreprise"} verra ta réponse dans le suivi de ses propositions, pour la mission «&nbsp;
              {aDecliner?.mission?.title}&nbsp;».
            </p>
            <p>Une fois déclinée, l&apos;invitation ne peut plus être acceptée.</p>
          </>
        }
        libelleConfirmer="Oui, je décline"
        chargement={enCours?.action === "decline"}
        erreur={erreurRefus}
        onConfirmer={confirmerRefus}
        onFermer={() => setADecliner(null)}
        cibleFocus={() => (refusEnvoye.current ? annonceRef.current : declencheur.current)}
      />
    </div>
  );
}

function SqueletteInvitations() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement des invitations">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-64 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
    </div>
  );
}
