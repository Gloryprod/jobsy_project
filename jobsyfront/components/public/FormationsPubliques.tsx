"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { LienSysteme } from "@/components/systeme";
import { normaliser } from "@/components/dashboardCandidat/portails/regles";
import { typeDonjon, type CleType } from "@/components/dashboardCandidat/donjons/regles";
import { texteSeul } from "@/components/dashboardEntreprise/missions/regles";
import { SECTION, TITRE_SECTION } from "./CadrePublic";

// GET /public_courses (PublicCourseController::index)
type FormationPublique = {
  id: number;
  title: string;
  description?: string | null;
  validation_mode: string;
  type_contenu?: string | null;
  delivered_skills?: string[] | null;
  reward_xp?: number | null;
  modules_count?: number | null;
};

/** Ce que chaque type de formation demande, dit aux visiteurs (D25 : les noms de l'administration). */
export const TYPES_PUBLICS: Record<CleType, { texte: string; avecKit?: string }> = {
  standard: { texte: "Leçons et quiz en ligne, puis un examen final." },
  logistique: { texte: "Un kit de matériel vous est livré, puis vous passez l'examen final." },
  expert: { texte: "La formation se termine par un projet pratique.", avecKit: "Un kit de matériel vous est livré, et la formation se termine par un projet pratique." },
};

const lire = (url: string) => api.get(url).then((res) => res.data?.data as FormationPublique[]);
const RESUME = 180;

function resume(html: string | null | undefined): string | null {
  const texte = texteSeul(html);
  if (!texte) return null;
  return texte.length > RESUME ? `${texte.slice(0, RESUME).replace(/\s+\S*$/, "")}…` : texte;
}

/** Le catalogue des formations actives, sans compte. */
export function FormationsPubliques() {
  const { data, error, isLoading, mutate } = useSWR("/public_courses", lire, { revalidateOnFocus: false });
  const [recherche, setRecherche] = useState("");
  const formations = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const visibles = useMemo(() => {
    const cherche = normaliser(recherche);
    return formations.filter((f) => !cherche || normaliser([f.title, ...(f.delivered_skills ?? [])].join(" ")).includes(cherche));
  }, [formations, recherche]);

  return (
    <section aria-labelledby="formations-liste" className={SECTION}>
      <h2 id="formations-liste" className={TITRE_SECTION}>
        Le catalogue
      </h2>
      <div className="grid max-w-md gap-1.5">
        <label htmlFor="recherche-formations" className="font-semibold">
          Rechercher une formation
        </label>
        <input
          id="recherche-formations"
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Accueil, vente, logistique…"
          className="min-h-11 rounded-lg border border-systeme-lueur/40 bg-white px-3 text-slate-900 placeholder:text-slate-500 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
        />
      </div>

      {isLoading ? (
        <p role="status" className="text-systeme-attenue">
          Chargement des formations…
        </p>
      ) : error ? (
        <div role="alert" className="grid justify-items-start gap-3 text-systeme-texte">
          <p>Les formations n&apos;ont pas pu être chargées. Vérifiez votre connexion, puis réessayez.</p>
          <button type="button" onClick={() => mutate()} className="min-h-11 cursor-pointer rounded-lg border border-systeme-lueur px-4 font-bold">
            Réessayer
          </button>
        </div>
      ) : formations.length === 0 ? (
        <p className="text-systeme-attenue">Aucune formation n&apos;est ouverte en ce moment.</p>
      ) : (
        <>
          <p role="status" className="text-systeme-attenue">
            {visibles.length === 0 ? "Aucune formation ne correspond à votre recherche." : `${visibles.length} formation${visibles.length > 1 ? "s" : ""}`}
          </p>
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {visibles.map((f) => {
              const type = typeDonjon(f);
              const explication = type.avecKit ? (TYPES_PUBLICS[type.cle].avecKit ?? TYPES_PUBLICS[type.cle].texte) : TYPES_PUBLICS[type.cle].texte;
              const competences = (f.delivered_skills ?? []).filter(Boolean);
              const texte = resume(f.description);
              const details = [f.modules_count ? `${f.modules_count} module${f.modules_count > 1 ? "s" : ""}` : null, f.reward_xp ? `+${f.reward_xp} XP` : null].filter(Boolean);
              return (
                <li key={f.id} className="grid">
                  <article className="grid h-full content-start gap-3 rounded-2xl border border-systeme-lueur/30 bg-white p-5 text-slate-900">
                    <p className="justify-self-start rounded-full bg-systeme-panneau px-3 py-1 font-systeme text-xs font-bold text-systeme-texte">{type.nom}</p>
                    <h3 className="text-lg leading-snug font-bold break-words">{f.title}</h3>
                    {texte && <p className="text-sm text-slate-700">{texte}</p>}
                    <p className="text-sm text-slate-600">{explication}</p>
                    {competences.length > 0 && <p className="text-sm">Compétences : {competences.join(", ")}.</p>}
                    {details.length > 0 && <p className="text-sm font-semibold text-[#6B5F00]">{details.join(" · ")}</p>}
                  </article>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="flex flex-wrap gap-3">
        <LienSysteme href="/register/candidats">Créer un compte pour commencer</LienSysteme>
        <LienSysteme href="/login" variante="contour">
          Se connecter
        </LienSysteme>
      </div>
    </section>
  );
}
