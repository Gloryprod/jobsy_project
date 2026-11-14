import { BarreProgression, BoutonSysteme } from "@/components/systeme";
import type { TitreInventaire } from "../statut/types";
import { libelleRarete } from "./regles";

type Props = {
  titres: TitreInventaire[];
  /** Titre dont l'équipement est en cours d'envoi */
  enCours: string | null;
  onBasculer?: (titre: TitreInventaire) => void;
};

/** Une liste de titres : nom, rareté, condition, progression réelle s'il est verrouillé, action s'il est débloqué. */
export function ListeTitres({ titres, enCours, onBasculer }: Props) {
  return (
    <ul className="grid gap-3">
      {titres.map((titre) => {
        const rarete = libelleRarete(titre.rarity);
        const progression = !titre.unlocked && titre.progress && titre.progress.max > 0 ? titre.progress : null;
        return (
          <li key={titre.id} className="grid gap-2 rounded-[3px] border border-systeme-lueur/25 p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <p className={`font-systeme font-bold ${titre.unlocked ? "text-systeme-or" : "text-systeme-texte"}`}>{titre.name}</p>
              {rarete && <span className="text-sm text-systeme-attenue">{rarete}</span>}
            </div>
            {titre.description && <p className="text-sm text-systeme-attenue">{titre.description}</p>}
            {progression && (
              <BarreProgression
                libelle={`Progression : ${titre.name}`}
                valeur={progression.current}
                max={progression.max}
                detail={`${Math.min(progression.current, progression.max)} sur ${progression.max}`}
              />
            )}
            {titre.unlocked && onBasculer && (
              <BoutonSysteme
                id={`titre-${titre.id}-action`}
                variante={titre.equipped ? "contour" : "plein"}
                chargement={enCours === titre.id}
                disabled={enCours !== null && enCours !== titre.id}
                onClick={() => onBasculer(titre)}
                aria-label={`${titre.equipped ? "Retirer" : "Équiper"} : ${titre.name}`}
                className="justify-self-start"
              >
                {titre.equipped ? "Retirer" : "Équiper"}
              </BoutonSysteme>
            )}
          </li>
        );
      })}
    </ul>
  );
}
