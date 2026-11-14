import { FenetreSysteme, LignesValeurs, type LigneValeur } from "@/components/systeme";
import { BlocRang } from "./BlocRang";
import type { ProfilCandidat } from "./types";

type Props = {
  prenom?: string | null;
  profil: ProfilCandidat;
  /** null tant que la liste n'est pas chargée : la ligne n'est alors pas affichée */
  missionsValidees: number | null;
  formationsCertifiees: number | null;
};

/** Fenêtre de statut du QG : rang, progression réelle vers le rang suivant, chiffres d'activité. */
export function FenetreStatut({ prenom, profil, missionsValidees, formationsCertifiees }: Props) {
  // Aucune valeur par défaut : une donnée absente n'est pas affichée
  const lignes: LigneValeur[] = [];
  if (missionsValidees !== null) lignes.push({ libelle: "Missions validées", valeur: missionsValidees });
  if (formationsCertifiees !== null) lignes.push({ libelle: "Formations certifiées", valeur: formationsCertifiees });
  if (typeof profil.streak_count === "number") {
    lignes.push({ libelle: "Série d'activité", valeur: `${profil.streak_count} jour${profil.streak_count > 1 ? "s" : ""}` });
  }
  if (typeof profil.vitality === "number") {
    lignes.push({ libelle: "Vitalité", valeur: `${profil.vitality} / 100`, ton: profil.vitality < 50 ? "alerte" : "normal" });
  }

  return (
    <FenetreSysteme etiquette="Statut" titre={prenom || "Ton personnage"} niveauTitre={2}>
      <BlocRang profil={profil} />

      {lignes.length > 0 && <LignesValeurs lignes={lignes} />}
    </FenetreSysteme>
  );
}
