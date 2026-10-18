import { Lock, LockOpen } from "lucide-react";
import { EmblemeRang } from "@/components/systeme";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { formaterXp } from "@/lib/progression";
import { PastilleStatut, type TonStatut } from "../qg/CarteRealite";
import type { EtatPortail } from "./regles";
import type { MissionPortail } from "./types";

export type StatutAffiche = { libelle: string; ton: TonStatut } | null;

type Props = {
  mission: MissionPortail;
  etat: EtatPortail;
  /** Statut de la candidature si le candidat a déjà postulé */
  statut: StatutAffiche;
  /** Reçoit le bouton cliqué, pour lui rendre le focus à la fermeture du détail */
  onOuvrir: (declencheur: HTMLButtonElement) => void;
};

/**
 * Une mission vue comme un portail : bandeau du Système (rang requis, ouvert ou verrouillé),
 * puis les informations réelles (entreprise, lieu, récompense) sur fond clair.
 */
export function CartePortail({ mission, etat, statut, onOuvrir }: Props) {
  const montant = formaterFcfa(mission.reward);
  const jusquau = formaterDateCourte(mission.deadline);
  const entreprise = mission.entreprise?.nom_entreprise || mission.company;

  return (
    <article className="grid content-start overflow-hidden rounded-2xl border border-slate-200 bg-white font-lisible text-slate-900">
      <div className="flex items-center gap-3 bg-systeme-nuit px-4 py-2.5 text-systeme-texte">
        <EmblemeRang rang={etat.requis.rank} couleur={etat.requis.code_hexa} taille="sm" />
        <p className="font-systeme text-sm font-bold">Portail de rang {etat.requis.rank}</p>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-xs font-bold ${etat.ouvert ? "text-systeme-lueur" : "text-systeme-alerte"}`}>
          {etat.ouvert ? <LockOpen aria-hidden="true" className="size-3.5" /> : <Lock aria-hidden="true" className="size-3.5" />}
          {etat.ouvert ? "Ouvert" : "Verrouillé"}
        </span>
      </div>

      <div className="grid gap-3 p-5">
        <div className="grid gap-1">
          <h3 className="text-lg leading-snug font-bold text-balance break-words">{mission.title}</h3>
          <p className="text-sm text-slate-600">{[entreprise, mission.location].filter(Boolean).join(", ")}</p>
        </div>

        <ul className="flex flex-wrap gap-2 text-xs">
          {[mission.type_contrat, mission.duration, jusquau ? `Ouverte jusqu'au ${jusquau}` : null].filter(Boolean).map((fait) => (
            <li key={fait} className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
              {fait}
            </li>
          ))}
        </ul>

        <div className="grid gap-0.5">
          <p className="text-xs text-slate-500">Récompense</p>
          <p className="text-xl font-bold text-[#000080] tabular-nums">{montant ?? "Montant non précisé"}</p>
          <p className="text-xs font-semibold text-[#6B5F00]">+250 XP à la validation</p>
        </div>

        {statut ? (
          <PastilleStatut ton={statut.ton} className="justify-self-start">
            {statut.libelle}
          </PastilleStatut>
        ) : !etat.ouvert ? (
          <p className="text-sm text-slate-600">
            Rang {etat.requis.rank} requis
            {etat.manque > 0 ? (
              <>
                {" "}: il te manque <strong className="text-[#000080]">{formaterXp(etat.manque)}</strong>.
              </>
            ) : (
              "."
            )}
          </p>
        ) : null}

        <button
          type="button"
          onClick={(e) => onOuvrir(e.currentTarget)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center justify-self-start rounded-lg border border-[#000080] px-4 text-sm font-bold text-[#000080] transition-colors hover:bg-[#000080] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          Voir la mission
        </button>
      </div>
    </article>
  );
}
