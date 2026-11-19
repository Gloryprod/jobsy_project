"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { EmblemeRang, LienSysteme } from "@/components/systeme";
import { formaterFcfa } from "@/lib/formats";
import type { MissionPortail } from "@/components/dashboardCandidat/portails/types";

const MAX_MISSIONS = 3;

const lire = (url: string) => api.get(url).then((res) => res.data?.data as MissionPortail[]);

/** Les dernières missions ouvertes (GET /public_missions), sans compte. Une API muette ne bloque pas la page. */
export function DernieresMissions() {
  const { data, error, isLoading } = useSWR("/public_missions", lire, { revalidateOnFocus: false });
  const missions = Array.isArray(data) ? data.slice(0, MAX_MISSIONS) : [];

  let contenu;
  if (isLoading) {
    contenu = (
      <p role="status" className="text-systeme-attenue">
        Chargement des missions…
      </p>
    );
  } else if (error) {
    contenu = <p className="text-systeme-attenue">Les missions n&apos;ont pas pu être chargées. Réessayez dans quelques instants.</p>;
  } else if (missions.length === 0) {
    contenu = <p className="text-systeme-attenue">Aucune mission n&apos;est ouverte en ce moment. Les nouvelles missions apparaîtront ici.</p>;
  } else {
    contenu = (
      <ul className="grid gap-4 md:grid-cols-3">
        {missions.map((mission) => {
          const rang = (mission.min_rank_required || "E").trim().toUpperCase().slice(0, 1);
          const entreprise = mission.entreprise?.nom_entreprise || mission.company;
          return (
            <li key={mission.id} className="grid content-start overflow-hidden rounded-2xl border border-systeme-lueur/30 bg-white text-slate-900">
              <p className="flex items-center gap-3 bg-systeme-panneau px-4 py-2.5 font-systeme text-sm font-bold text-systeme-texte">
                <EmblemeRang rang={rang} taille="sm" />
                {rang === "E" ? "Ouverte à tous les rangs" : `Rang ${rang} requis`}
              </p>
              <div className="grid gap-2 p-5">
                <h3 className="text-lg leading-snug font-bold break-words">{mission.title}</h3>
                <p className="text-sm text-slate-600">{[entreprise, mission.location].filter(Boolean).join(", ")}</p>
                <p className="text-xl font-bold text-[#000080] tabular-nums">{formaterFcfa(mission.reward) ?? "Montant non précisé"}</p>
                <p className="text-xs font-semibold text-[#6B5F00]">+250 XP à la validation</p>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div className="grid gap-6">
      {contenu}
      <div className="flex flex-wrap gap-3">
        <LienSysteme href="/register/candidats">Créer un compte pour postuler</LienSysteme>
        <LienSysteme href="/missions" variante="contour">
          Voir toutes les missions
        </LienSysteme>
      </div>
    </div>
  );
}
