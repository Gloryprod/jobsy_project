import { messageErreur, statutErreur } from "@/lib/erreurs";
import type { TonStatut } from "@/components/dashboardCandidat/qg/CarteRealite";

// Réponse de GET /index (Entreprise\DashboardController::index)
export type CandidatureATraiter = {
  id: number;
  created_at: string;
  candidat: {
    id: number;
    ville: string | null;
    user: { nom: string; prenom: string } | null;
    rank: { rank: string; label: string; code_hexa: string | null } | null;
  } | null;
  mission: { id: number; title: string } | null;
};

export type MissionTerminee = { id: number; title: string; applications_count: number; hired_count?: number };

export type TableauGuilde = {
  stats: {
    open_jobs_count: number;
    deactivated_jobs_count: number;
    closed_jobs_count: number;
    active_offers_count: number;
    wallet_balance: number | string;
    balance_locked: number | string;
  };
  candidatures_a_chaud: CandidatureATraiter[];
  missions_terminees: MissionTerminee[];
};

// GET /transactions-history : les 5 derniers mouvements du portefeuille de l'entreprise (WalletService)
export type Mouvement = { id: number; type: string; status: string; amount: number | string; created_at: string };

/** Bornes de PaymentController::initiateDeposit (entier de 100 à 10 000 000). */
export const RECHARGE_MINIMUM = 100;
export const RECHARGE_MAXIMUM = 10_000_000;

export function verifierRecharge(saisie: string): string | null {
  if (!saisie.trim()) return "Indiquez le montant à recharger.";
  if (!/^\d+$/.test(saisie.trim())) return "Indiquez un nombre entier de FCFA, sans espace ni virgule.";
  const montant = Number(saisie);
  if (montant < RECHARGE_MINIMUM) return `Le montant minimum est de ${RECHARGE_MINIMUM} FCFA.`;
  if (montant > RECHARGE_MAXIMUM) return "Le montant maximum est de 10 000 000 FCFA par recharge.";
  return null;
}

/**
 * Ce qu'est un mouvement, pour l'entreprise. Son portefeuille ne reçoit que des recharges (deposit)
 * et des versements de récompense à la validation d'une mission (transfer, montant négatif).
 */
export function decrireMouvement(m: Pick<Mouvement, "type" | "status">): { libelle: string; statut: string; ton: TonStatut } {
  const libelle = m.type === "deposit" ? "Recharge du compte" : m.type === "transfer" ? "Récompense versée à un candidat" : "Autre mouvement";
  if (m.status === "completed") return { libelle, statut: "Effectué", ton: "succes" };
  if (m.status === "pending" || m.status === "processing") return { libelle, statut: "En cours", ton: "attente" };
  if (m.status === "cancelled") return { libelle, statut: "Annulé", ton: "neutre" };
  return { libelle, statut: "Échoué", ton: "echec" };
}

/** Message d'erreur vouvoyé (les messages communs du front s'adressent au candidat). */
export function messageGuilde(erreur: unknown, parDefaut: string): string {
  if (statutErreur(erreur) === null) return "La connexion a été coupée. Vérifiez votre réseau, puis réessayez.";
  // Les refus de validation de l'API sont en anglais : on garde le message par défaut
  if (statutErreur(erreur) === 422) return parDefaut;
  return messageErreur(erreur, parDefaut);
}
