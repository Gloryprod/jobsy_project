"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LockOpen } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import { MissionMatchBadge } from "@/components/dashboardCandidat/mission/MissionMatchBadge";
import { BoutonSysteme, EmblemeRang, FenetreSysteme, LienSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { formaterXp } from "@/lib/progression";
import { LienDiscret, PastilleStatut } from "../qg/CarteRealite";
import type { StatutAffiche } from "./CartePortail";
import type { EtatPortail } from "./regles";
import type { MissionPortail } from "./types";

type Props = {
  mission: MissionPortail | null;
  etat: EtatPortail | null;
  statut: StatutAffiche;
  /** Action utile d'une candidature existante (finaliser, voir l'offre…) */
  actionCandidature: { lien: string; action: string } | null;
  rangCandidat: string | null;
  /** Bouton qui a ouvert la fenêtre : il récupère le focus à la fermeture (navigation au clavier) */
  declencheur: HTMLElement | null;
  onFermer: () => void;
};

/**
 * Détail d'une mission dans une fenêtre accessible (focus gardé, Échap pour fermer),
 * puis l'épreuve d'entrée avant d'ouvrir la candidature.
 */
export function DetailPortail({ mission, etat, statut, actionCandidature, rangCandidat, declencheur, onFermer }: Props) {
  const router = useRouter();
  const [vue, setVue] = useState<"detail" | "entree">("detail");

  const fermer = (ouvert: boolean) => {
    if (!ouvert) {
      setVue("detail");
      onFermer();
    }
  };

  return (
    <Dialog open={!!mission} onOpenChange={fermer}>
      {mission && etat && (
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            // Sans déclencheur Radix, le focus repartirait en haut de page : on le rend au bouton « Voir la mission »
            if (declencheur?.isConnected) {
              e.preventDefault();
              declencheur.focus();
            }
          }}
          className="max-h-[90dvh] gap-0 overflow-y-auto bg-white p-0 font-lisible text-slate-900 sm:max-w-2xl"
        >
          <div className="flex items-center gap-3 bg-systeme-nuit px-5 py-3 text-systeme-texte">
            <EmblemeRang rang={etat.requis.rank} couleur={etat.requis.code_hexa} taille="sm" />
            <p className="font-systeme text-sm font-bold">Portail de rang {etat.requis.rank}</p>
            <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-bold ${etat.ouvert ? "text-systeme-lueur" : "text-systeme-alerte"}`}>
              {etat.ouvert ? <LockOpen aria-hidden="true" className="size-3.5" /> : <Lock aria-hidden="true" className="size-3.5" />}
              {etat.ouvert ? "Ouvert" : "Verrouillé"}
            </span>
          </div>

          {vue === "detail" ? (
            <div className="grid gap-5 p-5 sm:p-6">
              <div className="grid gap-1.5">
                <DialogTitle className="text-2xl leading-tight font-bold text-balance">{mission.title}</DialogTitle>
                <DialogDescription className="text-slate-600">
                  {[mission.entreprise?.nom_entreprise || mission.company, mission.location].filter(Boolean).join(", ")}
                </DialogDescription>
                <div className="pt-1">
                  <MissionMatchBadge missionId={mission.id} />
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  ["Contrat", mission.type_contrat],
                  ["Durée", mission.duration],
                  ["Ouverte jusqu'au", formaterDateCourte(mission.deadline)],
                  ["Lieu", mission.location],
                ]
                  .filter(([, valeur]) => valeur)
                  .map(([libelle, valeur]) => (
                    <div key={libelle} className="grid gap-0.5 rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs text-slate-500">{libelle}</dt>
                      <dd className="font-semibold break-words">{valeur}</dd>
                    </div>
                  ))}
              </dl>

              <div className="grid gap-2">
                <h3 className="font-bold">La mission</h3>
                <SafeHtml as="div" className="text-slate-700 leading-relaxed" html={mission.description} />
              </div>

              {(mission.skills?.length ?? 0) > 0 && (
                <div className="grid gap-2">
                  <h3 className="font-bold">Compétences utiles</h3>
                  <ul className="flex flex-wrap gap-2 text-sm">
                    {mission.skills!.map((competence) => (
                      <li key={competence} className="rounded-md bg-slate-100 px-2 py-1">
                        {competence}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid gap-0.5 rounded-xl bg-[#000080] p-4 text-white">
                <p className="text-sm text-blue-100">Récompense</p>
                <p className="text-2xl font-bold tabular-nums">{formaterFcfa(mission.reward) ?? "Montant non précisé"}</p>
                <p className="text-sm font-semibold text-systeme-or">+250 XP à la validation</p>
              </div>

              {statut ? (
                <div className="flex flex-wrap items-center gap-3">
                  <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
                  {actionCandidature && <LienDiscret href={actionCandidature.lien}>{actionCandidature.action}</LienDiscret>}
                </div>
              ) : !etat.ouvert ? (
                <FenetreSysteme etiquette="Système" titre="Portail verrouillé" niveauTitre={3} ton="alerte" balayage={false} className="p-4">
                  <p className="text-systeme-attenue">
                    Cette mission demande le rang {etat.requis.rank}. Ton rang : {rangCandidat ?? "E"}.
                    {etat.manque > 0
                      ? ` Il te manque ${formaterXp(etat.manque)} : chaque mission validée et chaque formation certifiée t'en rapportent.`
                      : " Ton rang sera réévalué à ton prochain gain d'XP."}
                  </p>
                  <LienSysteme href="/dashboard/candidats/formations" variante="contour" className="justify-self-start">
                    Voir les formations
                  </LienSysteme>
                </FenetreSysteme>
              ) : null}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                {!statut && etat.ouvert && (
                  <button
                    type="button"
                    onClick={() => setVue("entree")}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-5 font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
                  >
                    Postuler
                  </button>
                )}
                <DialogClose className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-slate-300 px-5 font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]">
                  Fermer
                </DialogClose>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 bg-systeme-nuit p-5 sm:p-6">
              <DialogTitle className="sr-only">Épreuve d&apos;entrée : {mission.title}</DialogTitle>
              <DialogDescription className="sr-only">Présentation de la candidature avant de la commencer.</DialogDescription>
              <FenetreSysteme etiquette="Épreuve d'entrée" titre={mission.title} niveauTitre={3}>
                <p className="text-systeme-attenue">
                  Tu vas répondre à quelques questions sur cette mission. L&apos;IA analyse tes réponses et l&apos;entreprise voit ton résultat. Prévois 5
                  à 10 minutes, au calme.
                </p>
                <div className="flex flex-wrap gap-3">
                  <BoutonSysteme onClick={() => router.push(`/dashboard/candidats/missions/${mission.id}/application`)}>
                    Commencer l&apos;épreuve
                  </BoutonSysteme>
                  <BoutonSysteme variante="contour" onClick={() => setVue("detail")}>
                    Retour au détail
                  </BoutonSysteme>
                </div>
              </FenetreSysteme>
            </div>
          )}
        </DialogContent>
      )}
    </Dialog>
  );
}
