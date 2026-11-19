"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { ErreurSection, LienDiscret } from "@/components/dashboardCandidat/qg/CarteRealite";
import MissionForm from "./MissionForm";
import type { MissionGuilde } from "./regles";

type Props = { missionId?: string | null; mode: "creer" | "modifier" | "relancer" };

const TITRES = { creer: "Publier une mission", modifier: "Modifier la mission", relancer: "Relancer une mission" };

/** Page du formulaire de mission : création, modification ou relance d'une mission existante. */
export function PageMission({ missionId, mode }: Props) {
  // GET /missions/{id} renvoie la mission telle quelle, sans enveloppe
  const mission = useSWR<MissionGuilde>(missionId ? `/missions/${missionId}` : null, (url: string) => api.get(url).then((r) => r.data));

  let contenu;
  if (!missionId) contenu = <MissionForm />;
  else if (mission.isLoading) contenu = <p role="status">Chargement de la mission…</p>;
  else if (mission.error || !mission.data)
    contenu = <ErreurSection texte="La mission n'a pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => mission.mutate()} />;
  else contenu = <MissionForm initialData={mission.data} reopen={mode === "relancer"} />;

  return (
    <div className="mx-auto grid max-w-4xl gap-5 font-lisible text-slate-900">
      <LienDiscret href="/dashboard/entreprises/missions/list" className="justify-self-start">
        ← Missions ouvertes
      </LienDiscret>
      <div className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">{TITRES[mode]}</h1>
        {mode === "relancer" && mission.data && <p className="text-slate-600">Une nouvelle mission, reprise de « {mission.data.title} ».</p>}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">{contenu}</div>
    </div>
  );
}
