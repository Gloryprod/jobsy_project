"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Search, X } from "lucide-react";
import api from "@/lib/api";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { LienDiscret, LienRealite, PastilleStatut } from "../qg/CarteRealite";
import { CarteDonjonCatalogue } from "./CarteDonjonCatalogue";
import {
  actionDonjon,
  correspondRechercheFormation,
  etatDonjon,
  FILTRES_TYPE,
  lienCarte,
  lienEspace,
  ORDRE_EN_COURS,
  typeDonjon,
  type CleType,
} from "./regles";
import type { EntreeCatalogue } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

const EXPLICATIONS: Record<"tous" | CleType, string> = {
  tous: "Trois types de donjons : chacun se termine par un boss, examen final ou projet pratique.",
  standard: typeDonjon({ validation_mode: "A" }).explication,
  logistique: typeDonjon({ validation_mode: "B" }).explication,
  expert: "La formation se termine par un projet pratique, avec ou sans kit de matériel selon la formation.",
};

/**
 * Le catalogue des formations vu comme des donjons d'entraînement : ce que chacun demande et rapporte,
 * et où en est le candidat. Les leçons et les quiz restent dans l'espace de formation (lot 3b).
 */
export function CatalogueDonjons() {
  const catalogue = useSWR<EntreeCatalogue[]>("/open/courses", lireDonnees);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<"tous" | CleType>("tous");

  const donnees = useMemo(() => {
    if (!catalogue.data) return null;
    const tous = [...catalogue.data].sort((a, b) => a.course.title.localeCompare(b.course.title, "fr"));
    const enCours = tous
      .filter((e) => ORDRE_EN_COURS.includes(etatDonjon(e.enrollment).cle))
      .sort((a, b) => ORDRE_EN_COURS.indexOf(etatDonjon(a.enrollment).cle) - ORDRE_EN_COURS.indexOf(etatDonjon(b.enrollment).cle));
    return {
      tous,
      enCours,
      certifies: tous.filter((e) => etatDonjon(e.enrollment).cle === "certifie").length,
    };
  }, [catalogue.data]);

  if (catalogue.isLoading) return <SqueletteCatalogue />;

  if (catalogue.error || !donnees) {
    return (
      <div className="p-2 sm:p-4">
        <FenetreSysteme etiquette="Système" titre="Les formations n'ont pas pu se charger" ton="alerte" balayage={false} className="max-w-xl">
          <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
          <BoutonSysteme onClick={() => catalogue.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        </FenetreSysteme>
      </div>
    );
  }

  const affiches = donnees.tous.filter(
    (e) => correspondRechercheFormation(e.course, recherche) && (filtre === "tous" || typeDonjon(e.course).cle === filtre),
  );

  return (
    <div className="grid gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Formations</h1>
        <p className="text-slate-600">Choisis une formation, regarde ce qu&apos;elle demande et ce qu&apos;elle rapporte, puis entre.</p>
      </header>

      <FenetreSysteme etiquette="Système" titre="Donjons d'entraînement" niveauTitre={2} className="max-w-3xl">
        <p className="text-systeme-attenue">
          Chaque formation est un donjon : franchis ses salles, bats le boss final et repars avec de l&apos;XP, un badge et un certificat
          vérifiable. L&apos;XP te rapproche du rang suivant.
        </p>
        <p className="text-systeme-attenue">
          {donnees.tous.length} donjon{donnees.tous.length > 1 ? "s" : ""} au catalogue.{" "}
          {donnees.enCours.length > 0 && (
            <>
              <strong className="text-systeme-texte">{donnees.enCours.length}</strong> en cours.{" "}
            </>
          )}
          {donnees.certifies > 0 && (
            <>
              <strong className="text-systeme-or">{donnees.certifies}</strong> certifié{donnees.certifies > 1 ? "s" : ""}.
            </>
          )}
        </p>
      </FenetreSysteme>

      {donnees.enCours.length > 0 && (
        <section aria-labelledby="donjons-en-cours" className="grid gap-3">
          <h2 id="donjons-en-cours" className="font-systeme text-xl font-bold text-[#000080]">
            Tes donjons en cours
          </h2>
          <ul className="grid gap-3 md:grid-cols-2">
            {donnees.enCours.map((e) => {
              const etat = etatDonjon(e.enrollment);
              const action = actionDonjon(e.enrollment);
              return (
                <li key={e.course.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 font-bold break-words">{e.course.title}</p>
                    <PastilleStatut ton={etat.ton}>{etat.libelle}</PastilleStatut>
                  </div>
                  {etat.cle === "en_cours" && etat.progression !== null && (
                    <div
                      role="progressbar"
                      aria-label={`Progression : ${e.course.title}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={etat.progression}
                      className="h-2 overflow-hidden rounded-full bg-slate-200"
                    >
                      <div className="h-full rounded-full bg-[#000080]" style={{ width: `${etat.progression}%` }} />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <LienRealite href={lienEspace(e.course.id)}>{action.libelle}</LienRealite>
                    <LienDiscret href={lienCarte(e.course.id)}>
                      Carte du donjon<span className="sr-only"> : {e.course.title}</span>
                    </LienDiscret>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="tous-les-donjons" className="grid gap-4">
        <h2 id="tous-les-donjons" className="font-systeme text-xl font-bold text-[#000080]">
          Tous les donjons
        </h2>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="recherche-formations" className="text-sm font-bold">
            Rechercher une formation
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
            <input
              id="recherche-formations"
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Titre, compétence"
              className="min-h-11 w-full rounded-lg border border-slate-300 py-2 pr-11 pl-10 text-base focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/30 focus:outline-none"
            />
            {recherche && (
              <button
                type="button"
                onClick={() => setRecherche("")}
                aria-label="Effacer la recherche"
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTRES_TYPE.map((option) => (
              <button
                key={option.valeur}
                type="button"
                aria-pressed={filtre === option.valeur}
                onClick={() => setFiltre(option.valeur)}
                className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors ${
                  filtre === option.valeur ? "border-[#000080] bg-[#000080] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-[#000080]"
                }`}
              >
                {option.libelle}
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-600">{EXPLICATIONS[filtre]}</p>
        </div>

        <p className="text-sm text-slate-600" aria-live="polite">
          {affiches.length} formation{affiches.length > 1 ? "s" : ""} affichée{affiches.length > 1 ? "s" : ""}
        </p>

        {affiches.length === 0 ? (
          <div className="grid justify-items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6">
            {donnees.tous.length === 0 ? (
              <p className="text-slate-600">Aucune formation ouverte pour l&apos;instant. Les nouvelles formations apparaîtront ici.</p>
            ) : (
              <>
                <p className="text-slate-600">Aucune formation ne correspond à ces critères.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRecherche("");
                    setFiltre("tous");
                  }}
                  className="min-h-11 cursor-pointer rounded-lg border border-[#000080] px-4 font-bold text-[#000080] hover:bg-[#000080] hover:text-white"
                >
                  Effacer les filtres
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {affiches.map((e) => (
              <CarteDonjonCatalogue key={e.course.id} entree={e} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SqueletteCatalogue() {
  return (
    <div className="grid gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement des formations">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
      <div className="h-32 max-w-3xl animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
