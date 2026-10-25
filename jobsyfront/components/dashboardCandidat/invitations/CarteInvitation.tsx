"use client";

import SafeHtml from "@/components/SafeHtml";
import { BoutonSysteme, FenetreSysteme, LignesValeurs } from "@/components/systeme";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { lignesRecompense } from "../commun/lignesRecompense";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import { Alerte } from "../epreuve/Alerte";
import { LienDiscret, PastilleStatut } from "../qg/CarteRealite";
import { statutInvitation } from "../qg/Invitations";
import { statutCandidature } from "../qg/JournalQuetes";
import { missionInvitationOuverte } from "../qg/quetes";
import type { Candidature, Proposition } from "../qg/types";

type PropsEnAttente = {
  proposition: Proposition;
  /** Action en cours sur cette invitation */
  enCours: "accept" | "decline" | null;
  /** Une réponse est en cours d'envoi, sur cette invitation ou une autre : les boutons attendent */
  occupe: boolean;
  erreur: string | null;
  onAccepter: () => void;
  onDecliner: (bouton: HTMLElement) => void;
};

/** Invitation qui attend une réponse : la fenêtre du Système, avec la récompense réelle et le message de l'entreprise. */
export function InvitationEnAttente({ proposition, enCours, occupe, erreur, onAccepter, onDecliner }: PropsEnAttente) {
  const ouverte = missionInvitationOuverte(proposition);
  const recue = formaterDateCourte(proposition.sent_at);
  const entreprise = proposition.entreprise?.nom_entreprise || "Une entreprise";

  return (
    <li>
      <FenetreSysteme
        etiquette="Invitation de guilde"
        titre={proposition.mission?.title}
        niveauTitre={3}
        ton={ouverte ? "info" : "alerte"}
        balayage={false}
        className="gap-4"
      >
        <p className="text-systeme-attenue">
          <strong className="text-systeme-texte">{entreprise}</strong> t&apos;invite directement sur cette mission
          {recue ? `, le ${recue}` : ""}.
        </p>

        <LignesValeurs
          lignes={[
            ...lignesRecompense(proposition.mission?.reward),
            ...(proposition.mission?.location ? [{ libelle: "Lieu", valeur: proposition.mission.location }] : []),
          ]}
        />

        {(proposition.subject || proposition.message) && (
          <div className="grid gap-1.5 rounded-[3px] border border-systeme-lueur/25 bg-systeme-nuit/60 p-3.5">
            <p className="text-sm text-systeme-attenue">Message de l&apos;entreprise</p>
            {proposition.subject && <p className="font-bold break-words text-systeme-texte">{proposition.subject}</p>}
            <SafeHtml
              as="div"
              className={`text-[0.98rem] leading-relaxed break-words text-systeme-texte/90 ${CLASSES_TEXTE_RICHE}`}
              html={proposition.message}
            />
          </div>
        )}

        {!ouverte && (
          <p className="text-systeme-attenue">
            L&apos;entreprise a fermé cette mission : tu ne peux plus accepter l&apos;invitation. Tu peux la décliner pour lui répondre.
          </p>
        )}

        <Alerte message={erreur} />

        <div className="flex flex-wrap gap-2.5">
          {ouverte && (
            <BoutonSysteme onClick={onAccepter} chargement={enCours === "accept"} disabled={occupe}>
              Accepter l&apos;invitation
            </BoutonSysteme>
          )}
          <BoutonSysteme variante="contour" onClick={(e) => onDecliner(e.currentTarget)} disabled={occupe}>
            Décliner
          </BoutonSysteme>
        </div>
      </FenetreSysteme>
    </li>
  );
}

/** Invitation déjà traitée : couche réalité, avec la suite réelle (offre reçue, mission en cours…). */
export function InvitationRepondue({
  proposition,
  candidature,
  maintenant,
}: {
  proposition: Proposition;
  /** Candidature créée à l'acceptation (même mission) : elle porte l'offre de l'entreprise quand elle existe */
  candidature: Candidature | null;
  maintenant: number | null;
}) {
  const statut = statutInvitation(proposition);
  const repondue = formaterDateCourte(proposition.responded_at);
  const montant = formaterFcfa(proposition.mission?.reward);
  const suite =
    proposition.status === "accepted" && candidature?.mission_offers && maintenant !== null ? statutCandidature(candidature, maintenant) : null;

  return (
    <li className="grid gap-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-bold break-words">{proposition.mission?.title}</p>
          <p className="text-sm text-slate-500">{[proposition.entreprise?.nom_entreprise, montant].filter(Boolean).join(", ")}</p>
        </div>
        <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
      </div>
      {repondue && <p className="text-xs text-slate-500">Réponse donnée le {repondue}</p>}
      {proposition.status === "accepted" &&
        (suite ? (
          <div className="flex flex-wrap items-center gap-3">
            <PastilleStatut ton={suite.ton}>{suite.libelle}</PastilleStatut>
            {suite.lien && <LienDiscret href={suite.lien}>{suite.action}</LienDiscret>}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            L&apos;entreprise prépare ton offre de mission. Elle t&apos;arrivera par e-mail et dans tes notifications, avec un délai pour la
            confirmer.
          </p>
        ))}
    </li>
  );
}
