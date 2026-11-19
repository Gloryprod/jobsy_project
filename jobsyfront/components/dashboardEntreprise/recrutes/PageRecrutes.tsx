"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import { useKKiaPay } from "kkiapay-react";
import api from "@/lib/api";
import { telechargerContrat } from "@/lib/contrats";
import { statutErreur } from "@/lib/erreurs";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { ConfirmationRefus } from "@/components/dashboardCandidat/commun/ConfirmationRefus";
import { ErreurSection, LienDiscret, PastilleStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import type { MissionGuilde } from "../missions/regles";
import { FenetreDemarrage } from "./FenetreDemarrage";
import { FenetreValidation } from "./FenetreValidation";
import {
  attendReponse,
  COMMISSION,
  estGarantie,
  estRecrute,
  etapeRecrute,
  etatPaiement,
  messageSuivi,
  montant,
  nomRecrute,
  peutGarantir,
  quand,
  soldeDisponible,
  type OffreRecrute,
} from "./regles";

type Action = "bloquer" | "kkiapay" | "demarrer" | "ecarter" | "valider" | "contrat";
type Annonce = { texte: string; erreur?: boolean; actualiser?: boolean };

const MISSIONS = "/dashboard/entreprises/missions";
const BOUTON_PLEIN =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 text-sm font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";
const BOUTON_CONTOUR =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#000080] px-3 text-sm font-bold text-[#000080] hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

function CarteRecrute({ o, disponible, onAction }: { o: OffreRecrute; disponible: number; onAction: (action: Action, bouton: HTMLButtonElement) => void }) {
  const nom = nomRecrute(o);
  const etape = etapeRecrute(o.status);
  const brut = montant(o.application?.mission?.reward);
  const paiement = etatPaiement(o, formaterFcfa);
  const sr = <span className="sr-only"> : {nom}</span>;
  const details = [
    o.start_date && o.status === "accepted"
      ? `Prise de service prévue le ${formaterDateCourte(o.start_date)}${o.start_time ? ` à ${o.start_time.slice(0, 5)}` : ""}${o.place ? `, ${o.place}` : ""}. Le candidat signalera sa présence sur place.`
      : null,
    quand(o.notified_presence_at) ? `Présence signalée ${quand(o.notified_presence_at)}.` : null,
    quand(o.started_at) ? `Mission démarrée ${quand(o.started_at)}, candidat arrivé ${o.is_on_time ? "à l'heure" : "en retard"}.` : null,
    o.status === "in_progress" ? "Le candidat déclarera la fin de sa mission : vous pourrez alors valider son travail." : null,
    quand(o.finished_at) ? `Travail déclaré terminé ${quand(o.finished_at)}.` : null,
    o.rating ? `Votre note : ${o.rating}/5.` : null,
  ].filter(Boolean);

  return (
    <article aria-label={nom} className="grid content-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-start gap-3">
        <div className="grid min-w-0 flex-1 gap-0.5">
          <h3 className="text-lg leading-snug font-bold break-words">{nom}</h3>
          {o.application?.candidat?.ville && <p className="text-sm text-slate-600">{o.application.candidat.ville}</p>}
        </div>
        <PastilleStatut ton={etape.ton}>{etape.libelle}</PastilleStatut>
      </div>
      {details.length > 0 && (
        <ul className="grid gap-1 text-sm">
          {details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
      {o.recruiter_review && <p className="text-sm break-words whitespace-pre-line text-slate-700">Votre avis : {o.recruiter_review}</p>}
      {paiement && (
        <div className="grid gap-2 rounded-lg bg-slate-50 p-3 text-sm">
          <p className={peutGarantir(o) ? "font-semibold text-amber-900" : "font-semibold"}>{paiement}</p>
          {peutGarantir(o) &&
            (disponible >= brut ? (
              <button type="button" onClick={(e) => onAction("bloquer", e.currentTarget)} className={`${BOUTON_PLEIN} justify-self-start`}>
                Bloquer {formaterFcfa(brut)} sur votre solde{sr}
              </button>
            ) : (
              <>
                <p className="text-slate-600">Votre solde disponible ({formaterFcfa(disponible)}) ne suffit pas : payez la récompense par KkiaPay.</p>
                <button type="button" onClick={(e) => onAction("kkiapay", e.currentTarget)} className={`${BOUTON_PLEIN} justify-self-start`}>
                  Payer {formaterFcfa(brut)} par KkiaPay{sr}
                </button>
              </>
            ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 empty:hidden">
        {o.status === "service_started" && (
          <>
            <button type="button" onClick={(e) => onAction("demarrer", e.currentTarget)} className={BOUTON_PLEIN}>
              Confirmer la prise de service{sr}
            </button>
            <button type="button" onClick={(e) => onAction("ecarter", e.currentTarget)} className={`${BOUTON_CONTOUR} border-red-700 text-red-800 hover:bg-red-50`}>
              Ne pas retenir{sr}
            </button>
          </>
        )}
        {o.status === "work_finished" &&
          (estGarantie(o) ? (
            <button type="button" onClick={(e) => onAction("valider", e.currentTarget)} className={BOUTON_PLEIN}>
              Valider le travail{sr}
            </button>
          ) : (
            <p className="text-sm text-slate-600">Garantissez d&apos;abord la récompense : vous pourrez ensuite valider le travail et payer le candidat.</p>
          ))}
        {o.contract_path && (
          <button type="button" onClick={(e) => onAction("contrat", e.currentTarget)} className={BOUTON_CONTOUR}>
            Télécharger le contrat{sr}
          </button>
        )}
      </div>
    </article>
  );
}

/** Les recrutés d'une mission (lot 7d) : prise de service, garantie de la récompense, validation et paiement. */
export function PageRecrutes({ missionId }: { missionId: string }) {
  const { openKkiapayWidget } = useKKiaPay();
  const mission = useSWR<MissionGuilde>(`/missions/${missionId}`, (url: string) => api.get(url).then((r) => r.data));
  const offres = useSWR<OffreRecrute[]>(`/entreprise/confirmed-applicants/${missionId}`, (url: string) => api.get(url).then((r) => r.data.data));
  const [demande, setDemande] = useState<{ action: Action; offre: OffreRecrute } | null>(null);
  // Une fenêtre neuve à chaque ouverture
  const [ouverture, setOuverture] = useState(0);
  const [enCours, setEnCours] = useState(false);
  const [erreurConfirmation, setErreurConfirmation] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<Annonce | null>(null);
  const declencheur = useRef<HTMLButtonElement | null>(null);
  const zoneAnnonce = useRef<HTMLDivElement>(null);
  // Après une action, le bouton d'origine a souvent disparu : le focus va à l'annonce
  const apresAction = useRef(false);

  const liste = offres.data ?? [];
  const recrutes = liste.filter(estRecrute);
  const sansReponse = liste.filter(attendReponse).length;
  const portefeuille = liste[0]?.application?.mission?.entreprise?.wallet;
  const disponible = soldeDisponible(portefeuille);
  const m = mission.data;

  const annoncer = (a: Annonce, deplacerFocus = true) => {
    apresAction.current = true;
    setAnnonce(a);
    if (deplacerFocus) requestAnimationFrame(() => zoneAnnonce.current?.focus());
  };
  const terminer = (texte: string) => {
    setDemande(null);
    annoncer({ texte });
    void offres.mutate();
  };
  const actualiser = () => void offres.mutate();

  const agir = async (action: Action, offre: OffreRecrute, bouton: HTMLButtonElement) => {
    declencheur.current = bouton;
    apresAction.current = false;
    if (action === "contrat") {
      try {
        await telechargerContrat(offre.id);
      } catch (err) {
        const code = statutErreur(err);
        annoncer({
          erreur: true,
          texte:
            code === 404
              ? "Le contrat n'est pas encore disponible."
              : code === 403
                ? "Ce contrat ne vous est pas accessible."
                : "Le téléchargement du contrat a échoué. Réessayez dans quelques instants.",
        });
      }
      return;
    }
    if (action === "kkiapay") {
      try {
        const reponse = await api.post("/entreprise/payments/initiate-kkiapay", { offer_id: offre.id });
        const { public_key, intent, sandbox, amount } = reponse.data;
        // Seul l'identifiant de l'intention transite par le widget ; le webhook bloque ensuite la récompense côté serveur
        openKkiapayWidget({ amount, api_key: public_key, sandbox, data: JSON.stringify({ intent }) });
        // Le focus reste à la fenêtre de paiement : l'annonce est lue par la zone de statut
        annoncer(
          {
            actualiser: true,
            texte: `Paiement de ${formaterFcfa(amount)} ouvert dans la fenêtre KkiaPay pour ${nomRecrute(offre)}. La récompense sera garantie dès que KkiaPay aura confirmé le paiement.`,
          },
          false,
        );
      } catch (err) {
        annoncer({ erreur: true, texte: messageSuivi(err, "Le paiement n'a pas pu être lancé. Réessayez dans quelques instants.") });
        actualiser();
      }
      return;
    }
    setErreurConfirmation(null);
    setOuverture((n) => n + 1);
    setDemande({ action, offre });
  };

  const confirmer = async () => {
    if (!demande) return;
    const { action, offre } = demande;
    const nom = nomRecrute(offre);
    setEnCours(true);
    setErreurConfirmation(null);
    try {
      if (action === "bloquer") {
        await api.post("/entreprise/payments/lock_funds", { offerId: offre.id });
        terminer(`La récompense de ${nom} est bloquée.`);
      } else {
        await api.post(`/mission-offers/${offre.id}/update-status`, { status: "rejected_after_onboarding" });
        terminer(`${nom} n'est pas retenu.${estGarantie(offre) ? " La récompense bloquée est revenue sur votre solde." : ""}`);
      }
    } catch (err) {
      setErreurConfirmation(messageSuivi(err, "L'action n'a pas pu aboutir. Réessayez dans quelques instants."));
      actualiser();
    } finally {
      setEnCours(false);
    }
  };

  const fermer = () => setDemande(null);
  const cibleFocus = () => (apresAction.current ? zoneAnnonce.current : declencheur.current);
  const brutDemande = montant(demande?.offre.application?.mission?.reward);
  const nomDemande = demande ? nomRecrute(demande.offre) : "";

  return (
    <div className="mx-auto grid max-w-6xl gap-6 font-lisible text-slate-900">
      <LienDiscret href={`${MISSIONS}/${missionId}/applications`} className="justify-self-start">
        ← Candidatures de la mission
      </LienDiscret>
      <div className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Recrutés{m ? ` : ${m.title}` : ""}</h1>
        <p className="text-slate-600">
          Confirmez la prise de service de chaque recruté, garantissez sa récompense, puis validez son travail pour le payer.
          {portefeuille ? ` Solde disponible : ${formaterFcfa(disponible)}.` : ""}
        </p>
      </div>

      <div ref={zoneAnnonce} tabIndex={-1} role="status" className="focus:outline-none empty:hidden">
        {annonce && (
          <div className={`grid gap-2 rounded-lg border bg-white p-3 text-sm ${annonce.erreur ? "border-red-200 text-red-800" : "border-slate-200 text-emerald-800"}`}>
            <p>{annonce.texte}</p>
            {annonce.actualiser && (
              <button type="button" onClick={actualiser} className={`${BOUTON_CONTOUR} justify-self-start`}>
                Actualiser
              </button>
            )}
          </div>
        )}
      </div>

      <section aria-labelledby="titre-recrutes" className="grid gap-4">
        <h2 id="titre-recrutes" className="font-systeme text-xl font-bold text-[#000080]">
          Recrutés ({recrutes.length})
        </h2>
        {sansReponse > 0 && (
          <p className="text-sm text-slate-600">
            {sansReponse > 1 ? `${sansReponse} offres attendent` : "1 offre attend"} encore la réponse du candidat.{" "}
            <LienDiscret href={`${MISSIONS}/${missionId}/applications`} className="inline min-h-0 underline">
              Voir les candidatures
            </LienDiscret>
          </p>
        )}
        {offres.isLoading ? (
          <p role="status">Chargement des recrutés…</p>
        ) : offres.error ? (
          <ErreurSection texte="Les recrutés n'ont pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={actualiser} />
        ) : recrutes.length === 0 ? (
          <p className="text-slate-600">Aucun recruté pour le moment. Les candidats qui acceptent votre offre de prise de service apparaissent ici.</p>
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2">
            {recrutes.map((o) => (
              <li key={o.id} className="grid">
                <CarteRecrute o={o} disponible={disponible} onAction={(action, bouton) => void agir(action, o, bouton)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {demande && (demande.action === "bloquer" || demande.action === "ecarter") && (
        <ConfirmationRefus
          key={ouverture}
          ouvert
          titre={demande.action === "bloquer" ? "Bloquer la récompense" : `Ne pas retenir ${nomDemande} ?`}
          description={
            demande.action === "bloquer" ? (
              <p>
                {formaterFcfa(brutDemande)} seront bloqués sur votre solde disponible ({formaterFcfa(disponible)}). Ils seront versés à {nomDemande} quand vous
                validerez son travail, moins {COMMISSION * 100} % de commission Jobsy. Si vous ne le retenez pas après sa prise de service, ils reviennent sur
                votre solde.
              </p>
            ) : (
              <p>
                La mission s&apos;arrête pour ce candidat.
                {estGarantie(demande.offre) ? ` Les ${formaterFcfa(brutDemande)} bloqués reviennent sur votre solde.` : ""} Ce choix est définitif.
              </p>
            )
          }
          libelleConfirmer={demande.action === "bloquer" ? `Bloquer ${formaterFcfa(brutDemande)}` : "Ne pas retenir"}
          chargement={enCours}
          erreur={erreurConfirmation}
          onConfirmer={() => void confirmer()}
          onFermer={fermer}
          cibleFocus={cibleFocus}
        />
      )}
      {demande?.action === "demarrer" && (
        <FenetreDemarrage
          key={ouverture}
          offre={demande.offre}
          disponible={disponible}
          ouvert
          onFermer={fermer}
          cibleFocus={cibleFocus}
          onTermine={terminer}
          onActualiser={actualiser}
        />
      )}
      {demande?.action === "valider" && (
        <FenetreValidation key={ouverture} offre={demande.offre} ouvert onFermer={fermer} cibleFocus={cibleFocus} onTermine={terminer} onActualiser={actualiser} />
      )}
    </div>
  );
}
