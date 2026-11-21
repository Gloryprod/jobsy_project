import { EmblemeRang } from "@/components/systeme";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import type { MissionPortail } from "@/components/dashboardCandidat/portails/types";

/** Une mission ouverte vue sans compte (accueil et page Missions) : rang requis, entreprise, lieu, récompense et date limite. */
export function CarteMissionPublique({ mission }: { mission: MissionPortail }) {
  const rang = (mission.min_rank_required || "E").trim().toUpperCase().slice(0, 1);
  const entreprise = mission.entreprise?.nom_entreprise || mission.company;
  const limite = formaterDateCourte(mission.deadline);
  return (
    <article className="grid h-full content-start overflow-hidden rounded-2xl border border-systeme-lueur/30 bg-white text-slate-900">
      <p className="flex items-center gap-3 bg-systeme-panneau px-4 py-2.5 font-systeme text-sm font-bold text-systeme-texte">
        <EmblemeRang rang={rang} taille="sm" />
        {rang === "E" ? "Ouverte à tous les rangs" : `Rang ${rang} requis`}
      </p>
      <div className="grid gap-2 p-5">
        <h3 className="text-lg leading-snug font-bold break-words">{mission.title}</h3>
        <p className="text-sm text-slate-600">{[entreprise, mission.location, mission.type_contrat].filter(Boolean).join(", ")}</p>
        <p className="text-xl font-bold text-[#000080] tabular-nums">{formaterFcfa(mission.reward) ?? "Montant non précisé"}</p>
        {limite && <p className="text-sm text-slate-600">Candidatures jusqu&apos;au {limite}</p>}
        <p className="text-xs font-semibold text-[#6B5F00]">+250 XP à la validation</p>
      </div>
    </article>
  );
}
