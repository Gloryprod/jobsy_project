"use client";

import { useRef, useState } from "react";
import { Download } from "lucide-react";
import api, { STORAGE_URL } from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { formaterFcfa } from "@/lib/formats";
import { COMMISSION_AFFICHEE, partageRecompense, XP_MISSION_VALIDEE } from "@/lib/recompense";
import { BoutonSysteme, FenetreSysteme, LignesValeurs } from "@/components/systeme";
import { lignesRecompense } from "../commun/lignesRecompense";
import { Alerte } from "../epreuve/Alerte";
import { DetailsRendezVous } from "./DetailsRendezVous";
import { EtapesMission } from "./EtapesMission";
import { actionCandidat, etapesMission } from "./regles";
import type { OffreDetaillee } from "./types";

const ANNONCES: Record<string, string> = {
  service_started: "Arrivée signalée. L'entreprise va confirmer ta présence.",
  work_finished: "Mission déclarée terminée. L'entreprise vérifie ton travail avant de valider.",
};

/** Lien du contrat, seulement s'il a été généré (à la confirmation de présence). */
export function LienContrat({ chemin, className }: { chemin: string | null | undefined; className?: string }) {
  if (!chemin) return null;
  return (
    <a
      href={`${STORAGE_URL}/${chemin}`}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ??
        "inline-flex min-h-11 items-center gap-2 justify-self-start font-bold text-systeme-lueur underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
      }
    >
      <Download aria-hidden="true" className="size-4" />
      Télécharger mon contrat
      <span className="sr-only"> (s&apos;ouvre dans un nouvel onglet)</span>
    </a>
  );
}

/**
 * Une mission confirmée et en cours, vue comme une quête : les cinq étapes réelles, ce qui reste à faire
 * et par qui, et l'action du candidat quand c'est à lui de jouer.
 */
export function CarteMissionConfirmee({ offre, onMiseAJour }: { offre: OffreDetaillee; onMiseAJour: () => Promise<unknown> }) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const mission = offre.application?.mission ?? null;
  const statut = offre.status ?? "accepted";
  const action = actionCandidat(offre);
  const partage = partageRecompense(mission?.reward);
  const etapes = etapesMission(offre);
  const recompenseScellee = offre.payment_status === "locked";

  const agir = async () => {
    if (!action) return;
    setEnvoi(true);
    setErreur(null);
    setAnnonce(null);
    try {
      await api.post(`/mission-offers/${offre.id}/update-status`, { status: action.statut });
      setAnnonce(ANNONCES[action.statut] ?? null);
      await onMiseAJour();
      titreRef.current?.focus();
    } catch (e) {
      // 403 : la mission a déjà avancé (autre onglet, entreprise) ou l'étape n'est plus possible
      if (statutErreur(e) === 403) {
        setErreur("Cette étape n'est plus possible : la mission a déjà avancé. Le suivi est à jour.");
        void onMiseAJour();
      } else {
        setErreur(messageErreur(e, "La mise à jour n'a pas pu être envoyée. Réessaie."));
      }
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <li>
      <FenetreSysteme etiquette="Quête en cours" balayage={false} className="gap-4">
        <div className="grid gap-1">
          <h3
            ref={titreRef}
            tabIndex={-1}
            className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte outline-none focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-systeme-lueur"
          >
            {mission?.title ?? "Mission"}
          </h3>
          {mission?.company && <p className="text-systeme-attenue">{mission.company}</p>}
        </div>

        {/* Zone d'annonce toujours présente (lecteurs d'écran), invisible tant qu'elle est vide */}
        <p role="status" className={annonce ? "font-semibold text-systeme-lueur" : "sr-only"}>
          {annonce}
        </p>

        <EtapesMission etapes={etapes} />

        {statut === "accepted" && <DetailsRendezVous offre={offre} niveauTitre={4} />}

        {statut === "service_started" && (
          <p className="text-systeme-attenue">L&apos;entreprise doit confirmer ta présence sur place. Ton contrat sera généré à ce moment-là.</p>
        )}

        {(statut === "in_progress" || statut === "work_finished") && <LienContrat chemin={offre.contract_path} />}

        {statut === "work_finished" && (
          <p className="text-systeme-attenue">
            L&apos;entreprise vérifie ton travail.
            {partage ? ` À la validation, tu reçois ${formaterFcfa(partage.net)} et +${XP_MISSION_VALIDEE} XP.` : ` À la validation, tu gagnes +${XP_MISSION_VALIDEE} XP.`}
          </p>
        )}

        {recompenseScellee && partage ? (
          <div className="grid gap-1 rounded-[3px] border border-systeme-or/40 bg-systeme-nuit/60 p-3.5">
            <p className="font-systeme font-bold text-systeme-or">Récompense scellée</p>
            <p className="text-sm text-systeme-attenue">
              L&apos;entreprise a bloqué {formaterFcfa(partage.brut)} chez Jobsy pour cette mission. Tu recevras {formaterFcfa(partage.net)} à la
              validation (commission Jobsy de {COMMISSION_AFFICHEE} déduite).
            </p>
          </div>
        ) : (
          <LignesValeurs lignes={lignesRecompense(mission?.reward)} />
        )}

        <Alerte message={erreur} />

        {action && (
          <div className="grid gap-2">
            <BoutonSysteme onClick={agir} chargement={envoi} className="justify-self-start">
              {action.libelle}
            </BoutonSysteme>
            <p className="text-sm text-systeme-attenue">{action.aide}</p>
          </div>
        )}
      </FenetreSysteme>
    </li>
  );
}
