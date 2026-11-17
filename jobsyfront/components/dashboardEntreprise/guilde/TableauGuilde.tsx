"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { useUser } from "@/context/UserProvider";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, EmblemeRang, FenetreSysteme, LignesValeurs } from "@/components/systeme";
import { CarteRealite, ErreurSection, LienDiscret, LienRealite, PastilleStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { FenetreRecharge } from "./FenetreRecharge";
import { decrireMouvement, type Mouvement, type TableauGuilde as Donnees } from "./regles";

const lire = (url: string) => api.get(url).then((reponse) => reponse.data.data);
const CANDIDATURES_AFFICHEES = 6;
const MISSIONS = "/dashboard/entreprises/missions";

/** Le tableau de bord de la Guilde (lot 7a) : compteurs, candidatures à traiter, portefeuille et missions à relancer. */
export function TableauGuilde() {
  const { user } = useUser();
  const tableau = useSWR<Donnees>("/index", lire);
  const mouvements = useSWR<Mouvement[]>("/transactions-history", lire);
  const [recharge, setRecharge] = useState(false);
  const [annonce, setAnnonce] = useState<string | null>(null);
  const boutonRecharge = useRef<HTMLButtonElement>(null);

  const d = tableau.data;
  const actualiser = () => Promise.all([tableau.mutate(), mouvements.mutate()]);

  const entete = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Tableau de bord</h1>
        {user?.entreprise?.nom_entreprise && <p className="text-slate-600">{user.entreprise.nom_entreprise}</p>}
      </div>
      <LienRealite href={`${MISSIONS}/create`}>Publier une mission</LienRealite>
    </div>
  );

  if (tableau.isLoading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 font-lisible">
        {entete}
        <p role="status" className="text-slate-600">
          Chargement du tableau de bord…
        </p>
      </div>
    );
  }
  if (tableau.error || !d) {
    return (
      <div className="mx-auto grid max-w-6xl gap-6 font-lisible">
        {entete}
        <ErreurSection texte="Le tableau de bord n'a pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => tableau.mutate()} />
      </div>
    );
  }

  const s = d.stats;
  const compteurs = [
    { libelle: "Missions ouvertes", valeur: s.open_jobs_count, lien: `${MISSIONS}/list` },
    { libelle: "Missions désactivées", valeur: s.deactivated_jobs_count, lien: `${MISSIONS}/list` },
    { libelle: "Recrutements en cours ou terminés", valeur: s.active_offers_count, lien: null },
    { libelle: "Missions clôturées", valeur: s.closed_jobs_count, lien: `${MISSIONS}/closed/list` },
  ];
  const candidatures = d.candidatures_a_chaud;
  const terminees = d.missions_terminees.slice(0, 3);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 font-lisible text-slate-900">
      {entete}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Vos missions en chiffres">
        {compteurs.map((c) => (
          <li key={c.libelle} className="grid content-between gap-2 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">{c.libelle}</p>
            <p className="font-systeme text-3xl font-bold text-[#000080] tabular-nums">{c.valeur ?? 0}</p>
            {c.lien && (
              <LienDiscret href={c.lien} className="min-h-8">
                Voir la liste<span className="sr-only"> : {c.libelle.toLowerCase()}</span>
              </LienDiscret>
            )}
          </li>
        ))}
      </ul>

      <div className="grid gap-6 lg:grid-cols-3">
        <CarteRealite titre={`Candidatures à traiter (${candidatures.length})`} className="lg:col-span-2">
          {candidatures.length === 0 ? (
            <p className="text-slate-600">Aucune candidature en attente. Les nouvelles candidatures apparaîtront ici.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {candidatures.slice(0, CANDIDATURES_AFFICHEES).map((c) => {
                const nom = [c.candidat?.user?.prenom, c.candidat?.user?.nom].filter(Boolean).join(" ") || "Candidat";
                const rang = c.candidat?.rank;
                return (
                  <li key={c.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    {rang ? <EmblemeRang rang={rang.rank} couleur={rang.code_hexa} taille="sm" /> : <span className="sr-only">Rang inconnu</span>}
                    <div className="grid min-w-0 flex-1 gap-0.5">
                      <p className="font-bold break-words">{nom}</p>
                      <p className="text-sm text-slate-600">
                        {c.mission?.title ? `Pour « ${c.mission.title} »` : "Mission inconnue"}
                        {c.candidat?.ville ? `, ${c.candidat.ville}` : ""}
                        {formaterDateCourte(c.created_at) ? `, le ${formaterDateCourte(c.created_at)}` : ""}
                      </p>
                    </div>
                    {c.mission && (
                      <LienRealite href={`${MISSIONS}/${c.mission.id}/applications`} className="min-h-10">
                        Examiner<span className="sr-only"> la candidature de {nom}</span>
                      </LienRealite>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          {candidatures.length > CANDIDATURES_AFFICHEES && (
            <p className="text-sm text-slate-600">
              Et {candidatures.length - CANDIDATURES_AFFICHEES} autre{candidatures.length - CANDIDATURES_AFFICHEES > 1 ? "s" : ""} : retrouvez-les dans{" "}
              <LienDiscret href={`${MISSIONS}/list`} className="min-h-0 underline">
                vos missions ouvertes
              </LienDiscret>
              .
            </p>
          )}
        </CarteRealite>

        <div className="grid content-start gap-6">
          <FenetreSysteme etiquette="Portefeuille" titre="Solde du compte" niveauTitre={2} ton="recompense" balayage={false}>
            <LignesValeurs
              lignes={[
                { libelle: "Disponible", valeur: formaterFcfa(s.wallet_balance) ?? "0 FCFA", ton: "or" },
                { libelle: "Sous séquestre", valeur: formaterFcfa(s.balance_locked) ?? "0 FCFA" },
              ]}
            />
            <p className="text-sm text-systeme-attenue">Le séquestre garde les récompenses des recrutements en cours, jusqu&apos;à la validation des missions.</p>
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme ref={boutonRecharge} onClick={() => setRecharge(true)}>
                Recharger
              </BoutonSysteme>
              {annonce && (
                <BoutonSysteme variante="contour" onClick={() => actualiser()}>
                  Actualiser le solde
                </BoutonSysteme>
              )}
            </div>
            <p role="status" className="text-sm text-systeme-texte empty:hidden">
              {annonce}
            </p>
          </FenetreSysteme>

          <CarteRealite titre="Derniers mouvements">
            {mouvements.isLoading ? (
              <p className="text-slate-600">Chargement des mouvements…</p>
            ) : mouvements.error ? (
              <ErreurSection texte="Les mouvements n'ont pas pu se charger." reessayer={() => mouvements.mutate()} />
            ) : !mouvements.data?.length ? (
              <p className="text-slate-600">Aucun mouvement pour le moment. Rechargez le compte pour financer vos premières missions.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {mouvements.data.map((m) => {
                  const { libelle, statut, ton } = decrireMouvement(m);
                  const montant = Number(m.amount);
                  return (
                    <li key={m.id} className="grid gap-1 py-3 first:pt-0 last:pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">{libelle}</p>
                        <PastilleStatut ton={ton}>{statut}</PastilleStatut>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-slate-600">{formaterDateCourte(m.created_at)}</span>
                        <span className={`font-bold tabular-nums ${montant < 0 ? "text-slate-800" : "text-emerald-700"}`}>
                          {montant < 0 ? "−" : "+"} {formaterFcfa(Math.abs(montant)) ?? "Montant inconnu"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CarteRealite>
        </div>
      </div>

      <CarteRealite titre="Relancer une mission terminée">
        {terminees.length === 0 ? (
          <p className="text-slate-600">Aucune mission terminée pour le moment. Une mission validée pourra être relancée d&apos;ici.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-3">
            {terminees.map((m) => (
              <li key={m.id} className="grid content-between gap-2 rounded-lg border border-slate-200 p-4">
                <div className="grid gap-0.5">
                  <p className="font-bold break-words">{m.title}</p>
                  <p className="text-sm text-slate-600">
                    {m.hired_count !== undefined && `${m.hired_count} recruté${m.hired_count > 1 ? "s" : ""}, `}
                    {m.applications_count} candidature{m.applications_count > 1 ? "s" : ""}
                  </p>
                </div>
                <LienDiscret href={`${MISSIONS}/create?missionId=${m.id}`}>
                  Modifier et relancer<span className="sr-only"> : {m.title}</span>
                </LienDiscret>
              </li>
            ))}
          </ul>
        )}
      </CarteRealite>

      <FenetreRecharge
        ouvert={recharge}
        onFermer={() => setRecharge(false)}
        cibleFocus={() => boutonRecharge.current}
        onPaiementOuvert={(message) => {
          setAnnonce(message);
          setRecharge(false);
        }}
      />
    </div>
  );
}
