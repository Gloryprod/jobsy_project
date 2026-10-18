/** Montant en FCFA, ou null si la valeur n'est pas un nombre (les décimaux arrivent de l'API sous forme de texte). */
export function formaterFcfa(montant: number | string | null | undefined): string | null {
  const valeur = Number(montant);
  if (montant === null || montant === undefined || montant === "" || !Number.isFinite(valeur)) return null;
  return `${Math.round(valeur).toLocaleString("fr-FR")} FCFA`;
}

/** « 12 octobre », ou null si la date est absente ou invalide. */
export function formaterDateCourte(date: string | null | undefined): string | null {
  if (!date) return null;
  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return null;
  return valeur.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
