"use client";

import { useSyncExternalStore } from "react";

const PAS_MS = 10_000;

// Horloge partagée qui avance toutes les 10 secondes : les composants se mettent à jour sans effet ni état local
function abonnerHorloge(signaler: () => void) {
  const minuterie = setInterval(signaler, PAS_MS);
  return () => clearInterval(minuterie);
}
const instantNavigateur = () => Math.floor(Date.now() / PAS_MS);
// Côté serveur, pas d'heure : le texte n'est calculé que dans le navigateur, dans le bon fuseau
const instantServeur = () => null;

/**
 * « Avant 18 h 00, dans 5 h 12 » : uniquement pour un délai réel venant de l'API (expires_at…).
 */
export function Echeance({ date, className }: { date: string | Date; className?: string }) {
  const instant = useSyncExternalStore(abonnerHorloge, instantNavigateur, instantServeur);
  const cible = new Date(date);
  const texte = instant === null || Number.isNaN(cible.getTime()) ? null : formaterEcheance(cible, new Date(instant * PAS_MS));

  // L'espace est réservé avant le calcul pour que la mise en page ne saute pas
  return <span className={className}>{texte ?? <>&nbsp;</>}</span>;
}

export function formaterEcheance(cible: Date, maintenant: Date): string {
  const ms = cible.getTime() - maintenant.getTime();
  if (ms <= 0) return "Délai dépassé";

  const heure = cible.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ");
  const minutes = Math.floor(ms / 60_000);
  const heures = Math.floor(minutes / 60);
  const jours = Math.floor(heures / 24);

  if (jours >= 1) {
    const jour = cible.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    return `Avant le ${jour} à ${heure}, dans ${jours} jour${jours > 1 ? "s" : ""}`;
  }

  const reste = heures > 0 ? `${heures} h ${String(minutes % 60).padStart(2, "0")}` : `${minutes} min`;
  const memeJour = cible.toDateString() === maintenant.toDateString();
  return `Avant ${memeJour ? "" : "demain "}${heure}, dans ${reste}`;
}
