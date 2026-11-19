"use client";

import SafeHtml from "@/components/SafeHtml";
import { EmblemeRang } from "@/components/systeme";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { LienDiscret, LienRealite, PastilleStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { compterMission, DIFFICULTES, listeCompetences, statutMission, URGENCES, type MissionGuilde } from "./regles";

export type ActionMission = "basculer" | "cloturer" | "supprimer";

type Props = {
  mission: MissionGuilde;
  selectionnee: boolean;
  onSelection: (choisie: boolean) => void;
  /** Reçoit le bouton cliqué, pour lui rendre le focus après la confirmation */
  onAction: (action: ActionMission, declencheur: HTMLButtonElement) => void;
  enCours: boolean;
};

const MISSIONS = "/dashboard/entreprises/missions";
const BOUTON =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border px-3 text-sm font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080] disabled:cursor-not-allowed disabled:opacity-50";

/** Une mission publiée, vue comme une carte de quête sobre : statut, rang, récompense, suivi et actions en clair. */
export function CarteMission({ mission, selectionnee, onSelection, onAction, enCours }: Props) {
  const statut = statutMission(mission);
  const { candidatures, recrutes } = compterMission(mission);
  const rang = (mission.min_rank_required || "E").trim().toUpperCase().slice(0, 1);
  const cloturee = !!mission.closed_at;
  const competences = listeCompetences(mission.skills);
  const idTitre = `mission-${mission.id}-titre`;

  return (
    <article aria-labelledby={idTitre} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-start gap-3">
        <EmblemeRang rang={rang} taille="sm" />
        <div className="grid min-w-0 flex-1 gap-1">
          <h2 id={idTitre} className="text-lg leading-snug font-bold break-words">
            {mission.title}
          </h2>
          <p className="text-sm text-slate-600">
            {[mission.location, mission.type_contrat, mission.duration].filter(Boolean).join(", ")}
            {rang === "E" ? ", ouverte à tous les rangs" : `, dès le rang ${rang}`}
          </p>
        </div>
        <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-slate-500">Récompense</dt>
          <dd className="font-bold text-[#000080] tabular-nums">{formaterFcfa(mission.reward) ?? "Non précisée"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Date limite</dt>
          <dd className="font-semibold">{formaterDateCourte(mission.deadline) ?? "Non précisée"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Candidatures</dt>
          <dd className="font-semibold tabular-nums">{candidatures}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Recrutés</dt>
          <dd className="font-semibold tabular-nums">
            {recrutes}
            {mission.applicants ? ` sur ${mission.applicants} poste${mission.applicants > 1 ? "s" : ""}` : ""}
          </dd>
        </div>
      </dl>

      <details className="group rounded-lg border border-slate-200 px-3">
        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-[#000080]">Voir le détail</summary>
        <div className="grid gap-2 pb-3 text-sm">
          <p>
            Urgence : {URGENCES[mission.urgency ?? ""] ?? "Non précisée"}. Difficulté de l&apos;épreuve : {DIFFICULTES[mission.test_severity ?? ""] ?? "Non précisée"}.
            {mission.category ? ` Domaine : ${mission.category}.` : ""}
          </p>
          {competences.length > 0 && <p>Compétences : {competences.join(", ")}.</p>}
          <SafeHtml as="div" html={mission.description} className="grid gap-2 break-words [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5" />
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {cloturee ? (
          <>
            <LienRealite href={`${MISSIONS}/${mission.id}/confirmedApplicants`}>
              Suivi des recrutés<span className="sr-only"> : {mission.title}</span>
            </LienRealite>
            <LienDiscret href={`${MISSIONS}/create?missionId=${mission.id}`} className="px-2">
              Relancer<span className="sr-only"> : {mission.title}</span>
            </LienDiscret>
          </>
        ) : (
          <>
            <LienRealite href={`${MISSIONS}/${mission.id}/applications`}>
              Candidatures ({candidatures})<span className="sr-only"> : {mission.title}</span>
            </LienRealite>
            <LienDiscret href={`${MISSIONS}/${mission.id}/proposals`} className="px-2">
              Invitations<span className="sr-only"> : {mission.title}</span>
            </LienDiscret>
            <LienDiscret href={`${MISSIONS}/${mission.id}`} className="px-2">
              Modifier<span className="sr-only"> : {mission.title}</span>
            </LienDiscret>
            <button
              type="button"
              disabled={enCours}
              onClick={(e) => onAction("basculer", e.currentTarget)}
              className={`${BOUTON} border-slate-300 text-slate-800 hover:bg-slate-50`}
            >
              {mission.active ? "Désactiver" : "Réactiver"}
              <span className="sr-only"> : {mission.title}</span>
            </button>
            <button type="button" disabled={enCours} onClick={(e) => onAction("cloturer", e.currentTarget)} className={`${BOUTON} border-slate-300 text-slate-800 hover:bg-slate-50`}>
              Clôturer<span className="sr-only"> : {mission.title}</span>
            </button>
          </>
        )}
        <button type="button" disabled={enCours} onClick={(e) => onAction("supprimer", e.currentTarget)} className={`${BOUTON} border-red-200 text-red-700 hover:bg-red-50`}>
          Supprimer<span className="sr-only"> : {mission.title}</span>
        </button>
        <label className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={selectionnee} onChange={(e) => onSelection(e.target.checked)} className="size-4 accent-[#000080]" />
          Sélectionner<span className="sr-only"> : {mission.title}</span>
        </label>
      </div>
    </article>
  );
}
