"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { LienSysteme } from "@/components/systeme";
import { normaliser } from "@/components/dashboardCandidat/portails/regles";
import type { MissionPortail } from "@/components/dashboardCandidat/portails/types";
import { CarteMissionPublique } from "./CarteMissionPublique";
import { SECTION, TITRE_SECTION } from "./CadrePublic";

const FILTRES = [
  { valeur: "toutes", libelle: "Toutes" },
  { valeur: "Mission Ponctuelle", libelle: "Missions ponctuelles" },
  { valeur: "CDD", libelle: "CDD" },
  { valeur: "CDI", libelle: "CDI" },
];

const lire = (url: string) => api.get(url).then((res) => res.data?.data as MissionPortail[]);
const CHOIX =
  "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-systeme-lueur/40 px-3 text-sm font-semibold text-systeme-texte has-checked:border-systeme-lueur has-checked:bg-systeme-lueur/15 has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-systeme-lueur";

/** Les missions ouvertes (GET /public_missions), avec une recherche et un filtre par contrat. */
export function MissionsPubliques() {
  const { data, error, isLoading, mutate } = useSWR("/public_missions", lire, { revalidateOnFocus: false });
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("toutes");
  const missions = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const visibles = useMemo(() => {
    const cherche = normaliser(recherche);
    return missions.filter((m) => {
      if (filtre !== "toutes" && m.type_contrat !== filtre) return false;
      const texte = normaliser([m.title, m.entreprise?.nom_entreprise, m.company, m.location, ...(m.skills ?? [])].filter(Boolean).join(" "));
      return !cherche || texte.includes(cherche);
    });
  }, [missions, recherche, filtre]);

  return (
    <section aria-labelledby="missions-liste" className={SECTION}>
      <h2 id="missions-liste" className={TITRE_SECTION}>
        Missions ouvertes
      </h2>
      <div className="flex flex-wrap items-end gap-4">
        <div className="grid min-w-60 flex-1 gap-1.5">
          <label htmlFor="recherche-missions" className="font-semibold">
            Rechercher une mission
          </label>
          <input
            id="recherche-missions"
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Métier, compétence, ville…"
            className="min-h-11 rounded-lg border border-systeme-lueur/40 bg-white px-3 text-slate-900 placeholder:text-slate-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
          />
        </div>
        <fieldset className="grid gap-1.5">
          <legend className="mb-1.5 font-semibold">Type de contrat</legend>
          <div className="flex flex-wrap gap-2">
            {FILTRES.map((f) => (
              <label key={f.valeur} className={CHOIX}>
                <input type="radio" name="filtre-contrat" checked={filtre === f.valeur} onChange={() => setFiltre(f.valeur)} className="size-4 accent-systeme-lueur" />
                {f.libelle}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {isLoading ? (
        <p role="status" className="text-systeme-attenue">
          Chargement des missions…
        </p>
      ) : error ? (
        <div role="alert" className="grid justify-items-start gap-3 text-systeme-texte">
          <p>Les missions n&apos;ont pas pu être chargées. Vérifiez votre connexion, puis réessayez.</p>
          <button type="button" onClick={() => mutate()} className="min-h-11 cursor-pointer rounded-lg border border-systeme-lueur px-4 font-bold">
            Réessayer
          </button>
        </div>
      ) : missions.length === 0 ? (
        <p className="text-systeme-attenue">Aucune mission n&apos;est ouverte en ce moment. Les nouvelles missions apparaîtront ici.</p>
      ) : (
        <>
          <p role="status" className="text-systeme-attenue">
            {visibles.length === 0
              ? "Aucune mission ne correspond à votre recherche."
              : `${visibles.length} mission${visibles.length > 1 ? "s" : ""} sur les ${missions.length} dernières publiées.`}
          </p>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibles.map((mission) => (
              <li key={mission.id} className="grid">
                <CarteMissionPublique mission={mission} />
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <LienSysteme href="/register/candidats">Créer un compte pour postuler</LienSysteme>
        <LienSysteme href="/login" variante="contour">
          Se connecter
        </LienSysteme>
      </div>
    </section>
  );
}
