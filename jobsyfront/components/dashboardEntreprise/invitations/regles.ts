// Règles des invitations côté entreprise (lot 7c-B). Fonctions pures, sans appel réseau.
import type { TonStatut } from "@/components/dashboardCandidat/qg/CarteRealite";
import type { PriseDeService } from "../candidatures/regles";

type Texte = string | null | undefined;

// GET /missions/{id}/proposals (MissionProposalController::indexForMission). L'e-mail n'est donné qu'une fois l'invitation acceptée.
export type Invitation = {
  id: number;
  status: string;
  subject?: Texte;
  message?: Texte;
  sent_at?: Texte;
  candidat: { id: number | null; nom_complet: string; email: Texte; titre: Texte };
  application_id: number | null;
  onboarding: {
    start_date?: Texte;
    start_time?: Texte;
    place?: Texte;
    contact_person?: Texte;
    instructions?: Texte;
    expires_at?: Texte;
    declined_at?: Texte;
    status?: Texte;
  } | null;
};

// GET /candidates/{id}/full-profile (MatchingController::getCandidateProfileForCompany)
export type ProfilComplet = {
  id: number;
  full_name: string;
  title: Texte;
  all_skills?: string[];
  equipped_badges?: { id: number; name?: Texte }[];
  certificatesInfos?: { id: number; title?: Texte; certificate_hash?: Texte }[];
  formations?: { id: number; titre: string; organisme?: Texte }[];
  diplomes?: { id: number; intitule: string; niveau?: Texte; etablissement?: Texte; pays?: Texte; annee_obtention?: Texte }[];
};

export function statutInvitation(status: string): { libelle: string; ton: TonStatut } {
  if (status === "accepted") return { libelle: "Invitation acceptée", ton: "succes" };
  if (status === "declined") return { libelle: "Invitation déclinée", ton: "neutre" };
  if (status === "expired") return { libelle: "Invitation expirée", ton: "neutre" };
  return { libelle: "Réponse attendue", ton: "attente" };
}

export type ActionOffre = "envoyer" | "modifier" | "nouvelle";

/** Où en est l'offre de prise de service d'une invitation, et ce que l'entreprise peut en faire (MissionOffers::isReplaceable). */
export function etatOffre(inv: Invitation): { texte: string; action: ActionOffre | null } | null {
  if (inv.status !== "accepted" || !inv.application_id) return null;
  const o = inv.onboarding;
  if (!o) return { texte: "Le candidat attend votre offre de prise de service.", action: "envoyer" };
  if (o.declined_at || o.status === "declined") return { texte: "Le candidat a refusé l'offre de prise de service.", action: "nouvelle" };
  // Une offre qui vient d'être envoyée n'a pas encore de statut en base (MissionOffers::create sans status)
  if (!o.status || o.status === "pending") return { texte: "Offre envoyée, en attente de la réponse du candidat.", action: "modifier" };
  return { texte: "Le candidat a accepté l'offre : suivez la mission dans vos recrutés.", action: null };
}

/** L'offre en cours, pour la corriger tant que le candidat n'a pas répondu. */
export function offreEnCours(inv: Invitation): PriseDeService {
  const o = inv.onboarding;
  return {
    start_date: o?.start_date ?? "",
    start_time: (o?.start_time ?? "").slice(0, 5),
    place: o?.place ?? "",
    contact_person: o?.contact_person ?? "",
    expires_at: o?.expires_at ?? "",
    onboarding_instructions: o?.instructions ?? "",
  };
}

export type ValeursInvitation = { subject: string; content: string };
export type ErreursInvitation = Partial<Record<keyof ValeursInvitation, string>>;

/** Règles de MissionProposalController::sendProposalEmail. */
export function verifierInvitation(v: ValeursInvitation): ErreursInvitation {
  const e: ErreursInvitation = {};
  const objet = v.subject.trim();
  const message = v.content.trim();
  if (!objet) e.subject = "Ce champ est obligatoire.";
  else if (objet.length > 255) e.subject = "255 caractères au maximum.";
  if (!message) e.content = "Ce champ est obligatoire.";
  else if (message.length < 10) e.content = "Écrivez au moins 10 caractères.";
  return e;
}
