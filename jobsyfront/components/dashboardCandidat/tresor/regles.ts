// Règles du Trésor (lot 5), sans React : libellés des opérations et vérification d'un retrait.

/** GET /candidat/wallet (WalletController::getWalletData) */
export type Operation = {
  id: number;
  type: "transfer" | "withdrawal" | "deposit" | "fee" | string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled" | string;
  /** Nom de la mission pour une récompense, sinon le type de l'opération */
  description: string;
  created_at: string;
};

export type Coffre = {
  balance_available: number;
  balance_pending: number;
  total_earned: number;
  transactions: Operation[];
};

type Libelle = { titre: string; statut: string; signe: "+" | "-" | ""; ton: "gain" | "attente" | "neutre" };

/** Ce que l'opération veut dire pour le candidat (circuit de WalletService). */
export function decrireOperation(op: Operation): Libelle {
  if (op.type === "transfer") {
    if (op.status === "completed") return { titre: "Récompense versée", statut: "Versée", signe: "+", ton: "gain" };
    if (op.status === "cancelled") return { titre: "Récompense annulée", statut: "Mission arrêtée, rien n'est versé", signe: "", ton: "neutre" };
    return { titre: "Récompense scellée", statut: "Versée à la validation de la mission", signe: "+", ton: "attente" };
  }
  if (op.type === "withdrawal") {
    if (op.status === "completed") return { titre: "Retrait versé", statut: "Envoyé sur ton Mobile Money", signe: "-", ton: "neutre" };
    if (op.status === "failed") return { titre: "Retrait refusé", statut: "Le montant a été rendu à ton solde", signe: "", ton: "neutre" };
    if (op.status === "processing") return { titre: "Retrait en cours", statut: "Virement en cours", signe: "-", ton: "attente" };
    return { titre: "Retrait demandé", statut: "En attente de traitement par Jobsy", signe: "-", ton: "attente" };
  }
  if (op.type === "deposit") return { titre: "Dépôt", statut: op.status === "completed" ? "Reçu" : "En attente", signe: "+", ton: "gain" };
  return { titre: "Frais", statut: op.status === "completed" ? "Prélevés" : "En attente", signe: "-", ton: "neutre" };
}

/** La mission d'une récompense : l'API met son nom dans la description, sinon le type (« Transfer »). */
export const missionDe = (op: Operation) => (op.type === "transfer" && op.description && op.description.toLowerCase() !== "transfer" ? op.description : null);

/** Recopiées de WalletController::withdrawalRequest (minimum 100 FCFA, numéro de 8 à 15 chiffres). */
export const RETRAIT_MINIMUM = 100;
export const RESEAUX = ["MTN", "MOOV", "CELTIIS"] as const;
export const nettoyerNumero = (numero: string) => numero.replace(/[\s.-]/g, "");

export type ErreursRetrait = Partial<Record<"montant" | "reseau" | "numero", string>>;

export function verifierRetrait(montant: string, reseau: string, numero: string, disponible: number): ErreursRetrait {
  const erreurs: ErreursRetrait = {};
  const valeur = Number(montant);
  if (!montant || !Number.isInteger(valeur)) erreurs.montant = "Indique un montant entier en FCFA.";
  else if (valeur < RETRAIT_MINIMUM) erreurs.montant = `Le retrait minimum est de ${RETRAIT_MINIMUM} FCFA.`;
  else if (valeur > disponible) erreurs.montant = "Ce montant dépasse ton solde disponible.";
  if (!RESEAUX.includes(reseau as (typeof RESEAUX)[number])) erreurs.reseau = "Choisis ton réseau Mobile Money.";
  if (!/^\+?[0-9]{8,15}$/.test(nettoyerNumero(numero))) erreurs.numero = "Indique un numéro valide, par exemple +229 01 97 00 00 00.";
  return erreurs;
}
