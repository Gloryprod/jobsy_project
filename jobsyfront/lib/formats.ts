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

/**
 * « lundi 20 octobre 2026 » pour une date sans heure (colonne date : l'API envoie minuit UTC).
 * Lue en UTC pour ne jamais glisser au jour précédent selon le fuseau du téléphone.
 */
export function formaterJour(date: string | null | undefined): string | null {
  if (!date) return null;
  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return null;
  return valeur.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** « 8 h 30 » à partir de « 08:30 » ou « 08:30:00 », ou null si le format est inconnu. */
export function formaterHeure(heure: string | null | undefined): string | null {
  const morceaux = heure?.match(/^(\d{1,2}):(\d{2})/);
  return morceaux ? `${Number(morceaux[1])} h ${morceaux[2]}` : null;
}
