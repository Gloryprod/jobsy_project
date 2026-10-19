// Formes des réponses de l'API pour l'offre de mission et son suivi.

export type MissionOffre = {
  id: number;
  title: string;
  company?: string | null;
  location?: string | null;
  /** decimal(10,2) : arrive sous forme de texte, par exemple "45000.00" */
  reward?: number | string | null;
  type_contrat?: string | null;
  duration?: string | null;
};

/**
 * mission_offers, avec application.mission chargée.
 * GET /candidat/mission-offers/{id} (MissionsController::getMissionOffers)
 * GET /candidat/my-confirmed-missions (MissionsController::myconfirmedmissions)
 */
export type OffreDetaillee = {
  id: number;
  application_id: number;
  /**
   * null tant que le candidat n'a pas répondu, puis declined, ou accepted → service_started → in_progress
   * → work_finished → validated → completed (paiement versé). rejected_after_onboarding si l'entreprise arrête.
   */
  status: string | null;
  start_date?: string | null;
  /** « 08:30 » */
  start_time?: string | null;
  /** Lieu du rendez-vous fixé par l'entreprise (différent du lieu affiché sur la mission) */
  place?: string | null;
  contact_person?: string | null;
  onboarding_instructions?: string | null;
  expires_at?: string | null;
  accepted_at?: string | null;
  declined_at?: string | null;
  notified_presence_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  validated_at?: string | null;
  paid_at?: string | null;
  /** locked : récompense bloquée par l'entreprise chez Jobsy ; paid : versée au candidat */
  payment_status?: string | null;
  contract_path?: string | null;
  application: { id: number; status: string; mission: MissionOffre | null } | null;
};
