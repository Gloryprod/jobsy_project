// Partage de la récompense d'une mission entre le candidat et Jobsy, avec la même règle que l'API.

/** Commission Jobsy prélevée au paiement final : WalletService::COMMISSION_RATE */
export const TAUX_COMMISSION_JOBSY = 0.1;

/** « 10 % », avec une espace insécable pour que le signe ne passe pas seul à la ligne */
export const COMMISSION_AFFICHEE = `${Math.round(TAUX_COMMISSION_JOBSY * 100)}${String.fromCharCode(0xa0)}%`;

/** XP gagnée à la validation d'une mission : règle de MissionTrackingController */
export const XP_MISSION_VALIDEE = 250;

export type PartageRecompense = { brut: number; commission: number; net: number };

/**
 * Montant brut de la mission, commission et montant net versé au candidat, arrondis au franc comme
 * dans WalletService::lockFundsForMission. null si le montant est absent ou invalide.
 */
export function partageRecompense(reward: number | string | null | undefined): PartageRecompense | null {
  const valeur = Number(reward);
  if (reward === null || reward === undefined || reward === "" || !Number.isFinite(valeur) || valeur <= 0) return null;
  const brut = Math.round(valeur);
  const commission = Math.round(brut * TAUX_COMMISSION_JOBSY);
  return { brut, commission, net: brut - commission };
}
