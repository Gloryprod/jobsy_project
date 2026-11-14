import { BarreProgression, EmblemeRang } from "@/components/systeme";
import { formaterXp, progressionVersRangSuivant } from "@/lib/progression";
import type { ProfilCandidat } from "./types";

/** Rang, classe et progression réelle vers le rang suivant : commun au QG et à la fenêtre de statut. */
export function BlocRang({ profil }: { profil: Pick<ProfilCandidat, "score" | "rank" | "domaine_competence"> }) {
  const progression = progressionVersRangSuivant(profil.score, profil.rank?.rank);
  const { actuel, suivant } = progression;

  return (
    <>
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
    </>
  );
}
