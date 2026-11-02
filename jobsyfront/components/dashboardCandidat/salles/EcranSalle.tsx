"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { POURCENT, lienCarte, typeDonjon } from "../donjons/regles";
import { CombatQuiz } from "./CombatQuiz";
import { ContenuLecon } from "./ContenuLecon";
import { PlanSalles } from "./PlanSalles";
import type { Capsule, Section } from "./types";

type Props = {
  courseId: string;
  courseTitle: string;
  validationMode: string;
  progression: number;
  sections: Section[];
  /** Toutes les étapes dans l'ordre : le parcours est séquentiel */
  etapes: Capsule[];
  /** Étape proposée au chargement (la première non terminée) */
  etapeInitiale: Capsule | null;
  seuilQuiz: number | null;
  /** Recharge l'espace de formation ; résout quand les données sont à jour */
  onMiseAJour: () => Promise<unknown>;
};

const LIBELLES_TYPE: Record<Capsule["type"], string> = { text: "Leçon à lire", video: "Vidéo", pdf: "Document PDF", qcm: "Combat" };

/**
 * L'écran d'une salle : la leçon en cours, lisible sur fond clair, et le plan des salles à côté.
 * Le quiz du module est un combat du Système. Les étapes s'ouvrent dans l'ordre, comme le vérifie l'API.
 */
export function EcranSalle({ courseId, courseTitle, validationMode, progression, sections, etapes, etapeInitiale, seuilQuiz, onMiseAJour }: Props) {
  const [choisie, setChoisie] = useState<string | null>(etapeInitiale?.id ?? null);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);
  const premiere = useRef(true);

  // L'étape vient toujours des données à jour (et non d'une copie) : son état « terminée » suit l'API
  const parDefaut = etapes.find((c) => !c.is_completed) ?? etapes[0] ?? null;
  const courante = etapes.find((c) => c.id === choisie) ?? parDefaut;
  const index = courante ? etapes.findIndex((c) => c.id === courante.id) : -1;
  const suivante = index >= 0 && index < etapes.length - 1 ? etapes[index + 1] : null;
  const salle = courante ? sections.findIndex((s) => s.capsules.some((c) => c.id === courante.id)) : -1;

  const ouverte = (capsule: Capsule) => {
    const i = etapes.findIndex((c) => c.id === capsule.id);
    return i <= 0 || capsule.is_completed || etapes[i - 1]?.is_completed === true;
  };

  // Le focus va au titre de chaque nouvelle étape, pour le clavier et les lecteurs d'écran
  useEffect(() => {
    if (premiere.current) {
      premiere.current = false;
      return;
    }
    titreRef.current?.focus();
  }, [courante?.id]);

  const aller = (capsule: Capsule) => {
    setErreur(null);
    if (!ouverte(capsule)) {
      const precedente = etapes[etapes.findIndex((c) => c.id === capsule.id) - 1];
      setAnnonce(`Cette étape est fermée. Termine d'abord : ${precedente?.type === "qcm" ? "le combat de la salle précédente" : precedente?.title}.`);
      return;
    }
    setAnnonce(null);
    setChoisie(capsule.id);
  };

  const terminerLecon = async () => {
    if (!courante?.db_id) return;
    setEnvoi(true);
    setErreur(null);
    try {
      await api.post("/candidat/formations/lessons/complete", { lesson_id: courante.db_id, course_id: courseId });
      await onMiseAJour();
      if (suivante) {
        setAnnonce(`Leçon terminée. Étape suivante : ${suivante.type === "qcm" ? "le combat de la salle" : suivante.title}.`);
        setChoisie(suivante.id);
      } else {
        setAnnonce("Leçon terminée.");
      }
    } catch (e) {
      setErreur(messageErreur(e, "Ta progression n'a pas pu être enregistrée. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const type = typeDonjon({ validation_mode: validationMode });
  const pourcentage = Math.min(100, Math.max(0, Math.round(Number(progression) || 0)));

  return (
    <div className="grid gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-2">
        <Link
          href={lienCarte(Number(courseId))}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Carte du donjon
        </Link>
        <p className="text-sm font-bold text-[#000080]">Donjon {type.nom}</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{courseTitle}</h1>
        <div className="grid max-w-md gap-1">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Progression</span>
            <span className="font-semibold tabular-nums">
              {pourcentage}
              {POURCENT}
            </span>
          </div>
          <div role="progressbar" aria-label="Progression dans la formation" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pourcentage} className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-[#000080]" style={{ width: `${pourcentage}%` }} />
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Étape en cours" className="grid gap-4">
          <p role="status" className={annonce ? "rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-[#000080]" : "sr-only"}>
            {annonce}
          </p>

          {!courante ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">Les salles de cette formation sont en préparation.</p>
          ) : courante.type === "qcm" ? (
            <CombatQuiz
              key={courante.id}
              capsule={courante}
              courseId={courseId}
              seuil={seuilQuiz}
              titreRef={titreRef}
              aUneSuite={!!suivante}
              onVictoire={() => void onMiseAJour()}
              onContinuer={async () => {
                await onMiseAJour();
                // Les données viennent d'être rechargées : l'étape suivante est ouverte côté API
                if (suivante) setChoisie(suivante.id);
              }}
              onSuivant={suivante ? () => aller(suivante) : null}
            />
          ) : (
            <article className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="grid gap-1 border-b border-slate-100 pb-3">
                <p className="text-sm text-slate-500">
                  {salle >= 0 ? `Salle ${salle + 1} : ${sections[salle].title}` : null}
                  {" · "}
                  {LIBELLES_TYPE[courante.type]}
                </p>
                <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl leading-tight font-bold text-balance text-slate-900 outline-none">
                  {courante.title}
                </h2>
              </div>

              <ContenuLecon capsule={courante} />

              {erreur && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {erreur}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                {courante.is_completed ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <Check aria-hidden="true" className="size-4" />
                      Leçon terminée
                    </span>
                    {suivante && (
                      <button
                        type="button"
                        onClick={() => aller(suivante)}
                        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
                      >
                        Étape suivante
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={terminerLecon}
                    disabled={envoi}
                    aria-busy={envoi || undefined}
                    className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080] disabled:cursor-wait disabled:opacity-60"
                  >
                    {envoi ? "Enregistrement…" : "J'ai terminé cette leçon"}
                  </button>
                )}
              </div>
            </article>
          )}
        </section>

        <aside>
          <PlanSalles sections={sections} courante={courante?.id ?? null} ouverte={ouverte} onChoisir={aller} />
        </aside>
      </div>
    </div>
  );
}
