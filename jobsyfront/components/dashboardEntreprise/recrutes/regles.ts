// Règles des recrutés côté entreprise (lot 7d). Fonctions pures, sans appel réseau.
import type { TonStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import { statutErreur } from "@/lib/erreurs";
import { messageGuilde } from "../guilde/regles";

/** L'API répond 403 « Action impossible » quand l'étape a déjà changé (double clic, autre onglet) : la page est rechargée. */
export function messageSuivi(erreur: unknown, parDefaut: string): string {
  if (statutErreur(erreur) === 403) return "Cette étape n'est plus possible : la page a été actualisée.";
  return messageGuilde(erreur, parDefaut);
}

type Texte = string | null | undefined;
type Montant = number | string | null | undefined;
type Portefeuille = { balance: Montant; balance_locked: Montant } | null | undefined;

// GET /entreprise/confirmed-applicants/{mission} (MissionController::getConfirmedApplicants) : une ligne par offre de prise de service
export type OffreRecrute = {
  id: number;
  status: string | null;
  start_date?: Texte;
  start_time?: Texte;
  place?: Texte;
  declined_at?: Texte;
  notified_presence_at?: Texte;
  started_at?: Texte;
  finished_at?: Texte;
  contract_path?: Texte;
  payment_status?: Texte;
  is_on_time?: boolean | null;
  rating?: number | null;
  recruiter_review?: Texte;
  application: {
    candidat: { id: number; ville?: Texte; user: { nom?: Texte; prenom?: Texte } | null } | null;
    mission: { id: number; title: string; reward: Montant; entreprise?: { wallet?: Portefeuille } | null } | null;
  } | null;
};

/** WalletService::COMMISSION_RATE */
export const COMMISSION = 0.1;
/** Points d'expérience donnés au candidat à la validation (MissionTrackingController, cas « validated ») */
export const XP_VALIDATION = 250;

const ETAPES_RECRUTE = ["accepted", "service_started", "in_progress", "work_finished", "validated", "completed", "rejected_after_onboarding"];
/** Étapes où l'API accepte de bloquer la récompense (MissionOffers::ESCROW_STATUSES) */
const ETAPES_SEQUESTRE = ["accepted", "service_started", "in_progress", "work_finished"];

/** Un recruté a accepté l'offre. Les offres sans réponse ou refusées se suivent depuis les candidatures. */
export const estRecrute = (o: OffreRecrute) => ETAPES_RECRUTE.includes(o.status ?? "");
/** Offre envoyée, sans réponse du candidat (une offre neuve n'a pas de statut en base) */
export const attendReponse = (o: OffreRecrute) => (!o.status || o.status === "pending") && !o.declined_at;

export function nomRecrute(o: OffreRecrute): string {
  const u = o.application?.candidat?.user;
  return [u?.prenom, u?.nom].filter(Boolean).join(" ") || "Candidat";
}

export function etapeRecrute(status: string | null): { libelle: string; ton: TonStatut } {
  switch (status) {
    case "accepted":
      return { libelle: "Prise de service à venir", ton: "attente" };
    case "service_started":
      return { libelle: "Sur place, à confirmer", ton: "action" };
    case "in_progress":
      return { libelle: "Mission en cours", ton: "attente" };
    case "work_finished":
      return { libelle: "Travail terminé, à valider", ton: "action" };
    case "validated":
    case "completed":
      return { libelle: "Validée et payée", ton: "succes" };
    case "rejected_after_onboarding":
      return { libelle: "Non retenu", ton: "neutre" };
    default:
      return { libelle: "En attente", ton: "attente" };
  }
}

export const montant = (m: Montant) => Number(m ?? 0) || 0;
/** Solde que l'API peut bloquer : le solde moins les fonds déjà bloqués (WalletService::lockFundsForMission) */
export const soldeDisponible = (w: Portefeuille) => Math.max(0, montant(w?.balance) - montant(w?.balance_locked));

export const estGarantie = (o: OffreRecrute) => o.payment_status === "locked" || o.payment_status === "paid";
export const peutGarantir = (o: OffreRecrute) => ETAPES_SEQUESTRE.includes(o.status ?? "") && !estGarantie(o);

/** Ce que l'entreprise doit savoir du paiement, ou null quand il n'y a rien à en dire (candidat non retenu sans séquestre). */
export function etatPaiement(o: OffreRecrute, fcfa: (n: number) => string | null): string | null {
  const brut = montant(o.application?.mission?.reward);
  if (o.payment_status === "paid") return `Payé : ${fcfa(brut)}, dont ${fcfa(Math.round(brut * COMMISSION))} de commission Jobsy.`;
  if (o.payment_status === "locked") return `Récompense de ${fcfa(brut)} bloquée : elle sera versée au candidat quand vous validerez son travail.`;
  if (o.payment_status === "released") return `Récompense de ${fcfa(brut)} rendue à votre solde.`;
  if (peutGarantir(o)) return `Récompense de ${fcfa(brut)} pas encore garantie. Elle doit l'être pour valider le travail et payer le candidat.`;
  return null;
}

export type Evaluation = { note: number | null; avis: string };
export type ErreursEvaluation = Partial<Record<keyof Evaluation, string>>;

/** Règles du cas « validated » : note de 1 à 5, avis de 2 000 caractères au plus. */
export function verifierEvaluation(v: Evaluation): ErreursEvaluation {
  const e: ErreursEvaluation = {};
  if (!v.note || v.note < 1 || v.note > 5) e.note = "Choisissez une note de 1 à 5.";
  if (v.avis.trim().length > 2000) e.avis = "2 000 caractères au maximum.";
  return e;
}

/** Date et heure lisibles d'un horodatage de l'API (« 2026-11-19 10:00:00 » ou ISO). */
export function quand(date: Texte): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return `le ${d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
}
