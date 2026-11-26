"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { LienSysteme } from "@/components/systeme";
import type { MissionPortail } from "@/components/dashboardCandidat/portails/types";
import { CarteMissionPublique } from "@/components/public/CarteMissionPublique";

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
        {missions.map((mission) => (
          <li key={mission.id} className="grid">
            <CarteMissionPublique mission={mission} />
          </li>
        ))}
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
