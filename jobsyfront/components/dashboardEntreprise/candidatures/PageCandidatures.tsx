"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { EmblemeRang } from "@/components/systeme";
import { CarteRealite, ErreurSection, LienDiscret, PastilleStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { normaliser } from "@/components/dashboardCandidat/portails/regles";
import type { MissionGuilde } from "../missions/regles";
import { FenetreProfil } from "../invitations/FenetreProfil";
import { statutInvitation, type Invitation } from "../invitations/regles";
import { FenetrePriseDeService, type ResultatEnvoi } from "./FenetrePriseDeService";
import { evaluation, nomCandidat, statutCandidature, type CandidatSuggere, type CandidatureRecue } from "./regles";

type Filtre = "toutes" | "pending" | "accepted" | "rejected";
const FILTRES: { valeur: Filtre; libelle: string }[] = [
  { valeur: "toutes", libelle: "Toutes" },
  { valeur: "pending", libelle: "En attente" },
  { valeur: "accepted", libelle: "Retenues" },
  { valeur: "rejected", libelle: "Non retenues" },
];

const MISSIONS = "/dashboard/entreprises/missions";

function CarteCandidature({ c, choisie, onChoix }: { c: CandidatureRecue; choisie: boolean; onChoix: (oui: boolean) => void }) {
  const nom = nomCandidat(c);
  const statut = statutCandidature(c.status);
  const rang = c.candidat?.rank;
  const details = c.assessment?.ai_feedback_details;
  const forts = details?.points_forts ?? [];
  const faibles = details?.points_faibles ?? [];

  return (
    <article aria-label={nom} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-start gap-3">
        {rang ? <EmblemeRang rang={rang.rank} couleur={rang.code_hexa} taille="sm" /> : null}
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 className="text-lg leading-snug font-bold break-words">{nom}</h3>
          <p className="text-sm text-slate-600">
            {[rang?.label ?? (rang ? `Rang ${rang.rank}` : "Rang inconnu"), c.candidat?.domaine_competence, c.candidat?.ville].filter(Boolean).join(", ")}
          </p>
        </div>
        <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
      </div>
      <p className="text-sm">
        <span className="text-slate-500">Épreuve d&apos;entrée : </span>
        <strong>{evaluation(c)}</strong>
        {formaterDateCourte(c.created_at) ? <span className="text-slate-500">. Candidature du {formaterDateCourte(c.created_at)}.</span> : null}
      </p>
      {(c.ai_summary || forts.length > 0 || faibles.length > 0) && (
        <details className="rounded-lg border border-slate-200 px-3">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-[#000080]">Voir l&apos;évaluation</summary>
          <div className="grid gap-2 pb-3 text-sm">
            {c.ai_summary && <p>{c.ai_summary}</p>}
            {forts.length > 0 && (
              <div>
                <p className="font-semibold">Points forts</p>
                <ul className="list-disc pl-5">
                  {forts.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
            {faibles.length > 0 && (
              <div>
                <p className="font-semibold">Points à surveiller</p>
                <ul className="list-disc pl-5">
                  {faibles.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {c.candidat && (
          <LienDiscret href={`/dashboard/entreprises/detailProfilCandidat/${c.candidat.id}`} className="px-1">
            Voir le dossier<span className="sr-only"> de {nom}</span>
          </LienDiscret>
        )}
        {c.status === "pending" && (
          <label className="ml-auto inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={choisie} onChange={(e) => onChoix(e.target.checked)} className="size-4 accent-[#000080]" />
            Retenir<span className="sr-only"> {nom}</span>
          </label>
        )}
      </div>
    </article>
  );
}

function CarteSuggestion({ s, invitation, onProfil }: { s: CandidatSuggere; invitation?: Invitation; onProfil: (bouton: HTMLButtonElement) => void }) {
  const communes = s.skills_breakdown?.matched ?? [];
  const manquantes = s.skills_breakdown?.missing ?? [];
  return (
    <article aria-label={s.full_name} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-start gap-3">
        {s.rank ? <EmblemeRang rang={s.rank.rank} couleur={s.rank.code_hexa} taille="sm" /> : null}
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 className="text-lg leading-snug font-bold break-words">{s.full_name}</h3>
          <p className="text-sm text-slate-600">{[s.rank?.label, s.title].filter(Boolean).join(", ") || "Profil sans domaine renseigné"}</p>
        </div>
        <p className="text-right">
          <span className="block font-systeme text-xl font-bold text-[#000080] tabular-nums">{s.match_score} %</span>
          <span className="text-xs text-slate-500">de correspondance</span>
        </p>
      </div>
      {communes.length > 0 && <p className="text-sm">Compétences attendues qu&apos;il a : {communes.join(", ")}.</p>}
      {manquantes.length > 0 && <p className="text-sm text-slate-600">Compétences manquantes : {manquantes.join(", ")}.</p>}
      {invitation && (
        <p className="flex flex-wrap items-center gap-2 text-sm">
          <PastilleStatut ton={statutInvitation(invitation.status).ton}>Invité</PastilleStatut>
          {statutInvitation(invitation.status).libelle}
          {formaterDateCourte(invitation.sent_at) ? `, invitation du ${formaterDateCourte(invitation.sent_at)}` : ""}.
        </p>
      )}
      <button
        type="button"
        onClick={(e) => onProfil(e.currentTarget)}
        className="inline-flex min-h-11 cursor-pointer items-center justify-self-start rounded-lg border border-[#000080] px-3 text-sm font-bold text-[#000080] hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
      >
        Voir le profil<span className="sr-only"> de {s.full_name}</span>
      </button>
    </article>
  );
}

/** Les candidatures d'une mission (lot 7c-A) : candidatures reçues, prise de service et candidats suggérés. */
export function PageCandidatures({ missionId }: { missionId: string }) {
  const mission = useSWR<MissionGuilde>(`/missions/${missionId}`, (url: string) => api.get(url).then((r) => r.data));
  const candidatures = useSWR<CandidatureRecue[]>(`/missions/${missionId}/applications`, (url: string) => api.get(url).then((r) => r.data.data));
  const suggestions = useSWR<{ candidates: CandidatSuggere[] }>(`/missions/${missionId}/suggested-candidates`, (url: string) => api.get(url).then((r) => r.data));
  const invitations = useSWR<Invitation[]>(`/missions/${missionId}/proposals`, (url: string) => api.get(url).then((r) => r.data.data));
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("toutes");
  const [choix, setChoix] = useState<number[]>([]);
  const [fenetre, setFenetre] = useState(false);
  const [bilan, setBilan] = useState<ResultatEnvoi[] | null>(null);
  const [profil, setProfil] = useState<CandidatSuggere | null>(null);
  const [profilOuvert, setProfilOuvert] = useState(false);
  // Une fenêtre neuve à chaque ouverture : elle reprend l'invitation à jour
  const [ouvertureProfil, setOuvertureProfil] = useState(0);
  const boutonRetenir = useRef<HTMLButtonElement>(null);
  const zoneBilan = useRef<HTMLDivElement>(null);
  const declencheurProfil = useRef<HTMLButtonElement | null>(null);
  // Après un envoi, le focus va au bilan (le bouton « Retenir » est alors désactivé)
  const apresEnvoi = useRef(false);

  const visibles = useMemo(() => {
    const cherche = normaliser(recherche);
    return (candidatures.data ?? []).filter((c) => {
      if (filtre !== "toutes" && c.status !== filtre) return false;
      return !cherche || normaliser(`${nomCandidat(c)} ${c.candidat?.rank?.rank ?? ""} ${c.candidat?.ville ?? ""}`).includes(cherche);
    });
  }, [candidatures.data, recherche, filtre]);
  const liste = candidatures.data ?? [];
  const retenues = liste.filter((c) => choix.includes(c.id));
  const m = mission.data;
  const rangMin = (m?.min_rank_required || "E").toUpperCase().slice(0, 1);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 font-lisible text-slate-900">
      <LienDiscret href={`${MISSIONS}/list`} className="justify-self-start">
        ← Missions ouvertes
      </LienDiscret>
      <div className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Candidatures{m ? ` : ${m.title}` : ""}</h1>
        {m && (
          <p className="text-slate-600">
            {[rangMin === "E" ? "Ouverte à tous les rangs" : `Dès le rang ${rangMin}`, formaterFcfa(m.reward), formaterDateCourte(m.deadline) ? `jusqu'au ${formaterDateCourte(m.deadline)}` : null]
              .filter(Boolean)
              .join(", ")}
            .
          </p>
        )}
      </div>

      <div ref={zoneBilan} tabIndex={-1} role="status" className="focus:outline-none empty:hidden">
        {bilan && (
          <div className="grid gap-1 rounded-lg border border-slate-200 bg-white p-3 text-sm">
            {bilan.map((r) => (
              <p key={r.nom} className={r.envoye ? "text-emerald-800" : "text-red-800"}>
                {r.envoye ? `Offre envoyée à ${r.nom}.` : `${r.nom} : ${r.message}`}
              </p>
            ))}
          </div>
        )}
      </div>

      <section aria-labelledby="titre-candidatures" className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="titre-candidatures" className="font-systeme text-xl font-bold text-[#000080]">
            Candidatures reçues ({liste.length})
          </h2>
          <button
            ref={boutonRetenir}
            type="button"
            disabled={retenues.length === 0}
            onClick={() => setFenetre(true)}
            className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 text-sm font-bold text-white hover:bg-[#000080]/85 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
          >
            Retenir la sélection ({retenues.length})
          </button>
        </div>
        {retenues.length === 0 && liste.some((c) => c.status === "pending") && (
          <p className="text-sm text-slate-600">Cochez « Retenir » sur les candidatures en attente, puis envoyez-leur une offre.</p>
        )}

        {candidatures.isLoading ? (
          <p role="status">Chargement des candidatures…</p>
        ) : candidatures.error ? (
          <ErreurSection texte="Les candidatures n'ont pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => candidatures.mutate()} />
        ) : liste.length === 0 ? (
          <p className="text-slate-600">Aucune candidature pour le moment. Les candidats suggérés ci-dessous peuvent être invités.</p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid min-w-60 flex-1 gap-1">
                <label htmlFor="recherche-candidatures" className="text-sm font-semibold">
                  Rechercher un candidat
                </label>
                <input
                  id="recherche-candidatures"
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
                />
              </div>
              <fieldset className="grid gap-1">
                <legend className="text-sm font-semibold">Afficher</legend>
                <div className="flex flex-wrap gap-2">
                  {FILTRES.map((f) => (
                    <label
                      key={f.valeur}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm has-checked:border-[#000080] has-checked:bg-blue-50 has-checked:font-bold"
                    >
                      <input type="radio" name="filtre-candidatures" checked={filtre === f.valeur} onChange={() => setFiltre(f.valeur)} className="accent-[#000080]" />
                      {f.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            {visibles.length === 0 ? (
              <p className="text-slate-600">Aucune candidature ne correspond à votre recherche.</p>
            ) : (
              <ul className="grid gap-4 lg:grid-cols-2">
                {visibles.map((c) => (
                  <li key={c.id} className="grid">
                    <CarteCandidature c={c} choisie={choix.includes(c.id)} onChoix={(oui) => setChoix((s) => (oui ? [...s, c.id] : s.filter((id) => id !== c.id)))} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <CarteRealite titre="Candidats suggérés" lienPied={<LienDiscret href={`${MISSIONS}/${missionId}/proposals`}>Voir les invitations envoyées</LienDiscret>}>
        <p className="text-sm text-slate-600">
          Des profils qui peuvent postuler à cette mission et qui ont au moins la moitié des compétences attendues. Ils n&apos;ont pas encore postulé.
        </p>
        {suggestions.isLoading ? (
          <p role="status">Recherche des candidats…</p>
        ) : suggestions.error ? (
          <ErreurSection texte="Les suggestions n'ont pas pu se charger." reessayer={() => suggestions.mutate()} />
        ) : !suggestions.data?.candidates?.length ? (
          <p className="text-slate-600">Aucun candidat ne correspond assez pour le moment.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {suggestions.data.candidates.map((s) => (
              <li key={s.id} className="grid">
                <CarteSuggestion
                  s={s}
                  invitation={invitations.data?.find((inv) => inv.candidat.id === s.id)}
                  onProfil={(bouton) => {
                    declencheurProfil.current = bouton;
                    setProfil(s);
                    setOuvertureProfil((n) => n + 1);
                    setProfilOuvert(true);
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </CarteRealite>

      {profil && (
        <FenetreProfil
          key={ouvertureProfil}
          candidat={profil}
          missionId={missionId}
          missionTitre={m?.title}
          invitation={invitations.data?.find((inv) => inv.candidat.id === profil.id)}
          ouvert={profilOuvert}
          onFermer={() => setProfilOuvert(false)}
          cibleFocus={() => declencheurProfil.current}
          onInvite={() => void invitations.mutate()}
        />
      )}

      <FenetrePriseDeService
        cibles={retenues.map((c) => ({ nom: nomCandidat(c), url: `/entreprise/applications/${c.id}/select` }))}
        ouvert={fenetre}
        onFermer={() => {
          apresEnvoi.current = false;
          setFenetre(false);
        }}
        cibleFocus={() => (apresEnvoi.current ? zoneBilan.current : boutonRetenir.current)}
        onTermine={(resultats) => {
          apresEnvoi.current = true;
          setBilan(resultats);
          setChoix([]);
          setFenetre(false);
          void candidatures.mutate();
        }}
      />
    </div>
  );
}
