"use client";

import { useMemo, useRef, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { formaterDateCourte } from "@/lib/formats";
import SafeHtml from "@/components/SafeHtml";
import { ErreurSection, LienDiscret, PastilleStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { normaliser } from "@/components/dashboardCandidat/portails/regles";
import type { MissionGuilde } from "../missions/regles";
import { FenetrePriseDeService, type ResultatEnvoi } from "../candidatures/FenetrePriseDeService";
import { etatOffre, offreEnCours, statutInvitation, type ActionOffre, type Invitation } from "./regles";

type Filtre = "toutes" | "pending" | "accepted" | "declined";
const FILTRES: { valeur: Filtre; libelle: string }[] = [
  { valeur: "toutes", libelle: "Toutes" },
  { valeur: "pending", libelle: "Réponse attendue" },
  { valeur: "accepted", libelle: "Acceptées" },
  { valeur: "declined", libelle: "Déclinées ou expirées" },
];

const MISSIONS = "/dashboard/entreprises/missions";
const LIBELLES_ACTION: Record<ActionOffre, string> = { envoyer: "Envoyer l'offre", modifier: "Modifier l'offre", nouvelle: "Envoyer une nouvelle offre" };

const nomInvite = (inv: Invitation) => inv.candidat.nom_complet.trim() || "Candidat";

function CarteInvitation({ inv, missionId, onOffre }: { inv: Invitation; missionId: string; onOffre: (bouton: HTMLButtonElement) => void }) {
  const nom = nomInvite(inv);
  const statut = statutInvitation(inv.status);
  const offre = etatOffre(inv);
  const o = inv.onboarding;
  const envoi = formaterDateCourte(inv.sent_at);

  return (
    <article aria-label={nom} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 className="text-lg leading-snug font-bold break-words">{nom}</h3>
          <p className="text-sm text-slate-600">{[inv.candidat.titre, envoi ? `invité le ${envoi}` : null].filter(Boolean).join(", ")}</p>
        </div>
        <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
      </div>
      {inv.candidat.email && (
        <p className="text-sm">
          E-mail :{" "}
          <a href={`mailto:${inv.candidat.email}`} className="font-semibold text-[#000080] underline underline-offset-2">
            {inv.candidat.email}
          </a>
        </p>
      )}
      {offre && (
        <div className="grid gap-1 rounded-lg bg-slate-50 p-3 text-sm">
          <p className="font-semibold">{offre.texte}</p>
          {o?.start_date && (
            <p className="text-slate-600">
              Prise de service le {formaterDateCourte(o.start_date)}
              {o.start_time ? ` à ${o.start_time.slice(0, 5)}` : ""}
              {o.place ? `, ${o.place}` : ""}.
            </p>
          )}
        </div>
      )}
      {(inv.subject || inv.message) && (
        <details className="rounded-lg border border-slate-200 px-3">
          <summary className="flex min-h-11 cursor-pointer items-center text-sm font-bold text-[#000080]">Voir le message envoyé</summary>
          <div className="grid gap-1 pb-3 text-sm">
            {inv.subject && <p className="font-semibold break-words">{inv.subject}</p>}
            {inv.message && <SafeHtml as="div" className="break-words whitespace-pre-line" html={inv.message} />}
          </div>
        </details>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        {inv.candidat.id && (
          <LienDiscret href={`/dashboard/entreprises/detailProfilCandidat/${inv.candidat.id}`} className="px-1">
            Voir le dossier<span className="sr-only"> de {nom}</span>
          </LienDiscret>
        )}
        {offre?.action ? (
          <button
            type="button"
            onClick={(e) => onOffre(e.currentTarget)}
            className="ml-auto inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 text-sm font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
          >
            {LIBELLES_ACTION[offre.action]}
            <span className="sr-only"> à {nom}</span>
          </button>
        ) : offre ? (
          <LienDiscret href={`${MISSIONS}/${missionId}/confirmedApplicants`} className="ml-auto px-1">
            Voir les recrutés
          </LienDiscret>
        ) : null}
      </div>
    </article>
  );
}

/** Les invitations envoyées pour une mission (lot 7c-B), et l'offre de prise de service à ceux qui les ont acceptées. */
export function PageInvitations({ missionId }: { missionId: string }) {
  const mission = useSWR<MissionGuilde>(`/missions/${missionId}`, (url: string) => api.get(url).then((r) => r.data));
  const invitations = useSWR<Invitation[]>(`/missions/${missionId}/proposals`, (url: string) => api.get(url).then((r) => r.data.data));
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("toutes");
  const [cible, setCible] = useState<Invitation | null>(null);
  const [fenetre, setFenetre] = useState(false);
  const [bilan, setBilan] = useState<ResultatEnvoi | null>(null);
  // Une fenêtre neuve à chaque ouverture : l'offre préremplie est celle de la liste à jour
  const [ouverture, setOuverture] = useState(0);
  const declencheur = useRef<HTMLButtonElement | null>(null);
  const zoneBilan = useRef<HTMLDivElement>(null);
  // Après un envoi, le bouton d'origine peut avoir changé : le focus va au bilan
  const apresEnvoi = useRef(false);

  const liste = useMemo(() => invitations.data ?? [], [invitations.data]);
  const visibles = useMemo(() => {
    const cherche = normaliser(recherche);
    return liste.filter((inv) => {
      if (filtre === "declined" ? !["declined", "expired"].includes(inv.status) : filtre !== "toutes" && inv.status !== filtre) return false;
      return !cherche || normaliser(nomInvite(inv)).includes(cherche);
    });
  }, [liste, recherche, filtre]);
  const m = mission.data;
  const action = cible ? etatOffre(cible)?.action : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 font-lisible text-slate-900">
      <LienDiscret href={`${MISSIONS}/${missionId}/applications`} className="justify-self-start">
        ← Candidatures de la mission
      </LienDiscret>
      <div className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Invitations{m ? ` : ${m.title}` : ""}</h1>
        <p className="text-slate-600">Les candidats que vous avez invités depuis les suggestions. Quand l&apos;un d&apos;eux accepte, envoyez-lui l&apos;offre de prise de service.</p>
      </div>

      <div ref={zoneBilan} tabIndex={-1} role="status" className="focus:outline-none empty:hidden">
        {bilan && <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-emerald-800">Offre envoyée à {bilan.nom}.</p>}
      </div>

      <section aria-labelledby="titre-invitations" className="grid gap-4">
        <h2 id="titre-invitations" className="font-systeme text-xl font-bold text-[#000080]">
          Invitations envoyées ({liste.length})
        </h2>
        {invitations.isLoading ? (
          <p role="status">Chargement des invitations…</p>
        ) : invitations.error ? (
          <ErreurSection texte="Les invitations n'ont pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => invitations.mutate()} />
        ) : liste.length === 0 ? (
          <p className="text-slate-600">
            Aucune invitation pour le moment. Invitez des candidats depuis les suggestions de la{" "}
            <LienDiscret href={`${MISSIONS}/${missionId}/applications`} className="inline min-h-0 underline">
              page des candidatures
            </LienDiscret>
            .
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-end gap-4">
              <div className="grid min-w-60 flex-1 gap-1">
                <label htmlFor="recherche-invitations" className="text-sm font-semibold">
                  Rechercher un candidat
                </label>
                <input
                  id="recherche-invitations"
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
                      <input type="radio" name="filtre-invitations" checked={filtre === f.valeur} onChange={() => setFiltre(f.valeur)} className="accent-[#000080]" />
                      {f.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
            {visibles.length === 0 ? (
              <p className="text-slate-600">Aucune invitation ne correspond à votre recherche.</p>
            ) : (
              <ul className="grid gap-4 lg:grid-cols-2">
                {visibles.map((inv) => (
                  <li key={inv.id} className="grid">
                    <CarteInvitation
                      inv={inv}
                      missionId={missionId}
                      onOffre={(bouton) => {
                        declencheur.current = bouton;
                        apresEnvoi.current = false;
                        setCible(inv);
                        setOuverture((n) => n + 1);
                        setFenetre(true);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      {cible && (
        <FenetrePriseDeService
          key={ouverture}
          cibles={[{ nom: nomInvite(cible), url: `/proposals/${cible.id}/${cible.application_id}/onboarding` }]}
          initiales={action === "modifier" ? offreEnCours(cible) : undefined}
          ouvert={fenetre}
          onFermer={() => setFenetre(false)}
          cibleFocus={() => (apresEnvoi.current ? zoneBilan.current : declencheur.current)}
          onTermine={(resultats) => {
            apresEnvoi.current = true;
            setBilan(resultats[0] ?? null);
            setFenetre(false);
            void invitations.mutate();
          }}
        />
      )}
    </div>
  );
}
