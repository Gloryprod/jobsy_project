import { BarreProgression, EmblemeRang, FenetreSysteme, LignesValeurs, type LigneValeur } from "@/components/systeme";
import { formaterXp, progressionVersRangSuivant } from "@/lib/progression";
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
  const progression = progressionVersRangSuivant(profil.score, profil.rank?.rank);
  const { actuel, suivant } = progression;

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
      <div className="flex items-center gap-4">
        <EmblemeRang rang={actuel.rank} couleur={profil.rank?.code_hexa ?? actuel.code_hexa} taille="lg" />
        <div className="grid min-w-0 gap-1">
          <p className="font-systeme text-lg font-bold">Rang {actuel.rank}</p>
          <p className="text-systeme-attenue">{profil.domaine_competence ? `Classe : ${profil.domaine_competence}` : "Classe pas encore évaluée"}</p>
        </div>
      </div>

      {suivant ? (
        <div className="grid gap-2">
          <BarreProgression
            libelle={`Vers le rang ${suivant.rank}`}
            valeur={progression.xp}
            min={actuel.points}
            max={suivant.points}
            detail={`${formaterXp(progression.xp)} sur ${formaterXp(suivant.points)}`}
          />
          <p className="text-sm text-systeme-attenue">
            Il te manque <strong className="text-systeme-or">{formaterXp(progression.manque)}</strong> pour le rang {suivant.rank}.
          </p>
        </div>
      ) : (
        <p className="text-systeme-attenue">
          Tu as atteint le rang le plus haut, avec <strong className="text-systeme-or">{formaterXp(progression.xp)}</strong>.
        </p>
      )}

      {lignes.length > 0 && <LignesValeurs lignes={lignes} />}
    </FenetreSysteme>
  );
}
