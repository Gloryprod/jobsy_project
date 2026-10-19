import { Check, X } from "lucide-react";
import { formaterDateCourte } from "@/lib/formats";
import { cn } from "@/lib/utils";
import type { EtapeMission } from "./regles";

function texteEtat(etape: EtapeMission): string {
  switch (etape.etat) {
    case "faite": {
      const le = formaterDateCourte(etape.date);
      return le ? `Fait le ${le}` : "Fait";
    }
    case "courante":
      return etape.acteur === "toi" ? "À toi de jouer" : "Au tour de l'entreprise";
    case "arretee":
      return "Mission arrêtée";
    default:
      return etape.acteur === "toi" ? "À venir" : "À venir, par l'entreprise";
  }
}

const PASTILLES: Record<EtapeMission["etat"], string> = {
  faite: "border-systeme-lueur bg-systeme-lueur text-systeme-nuit",
  courante: "border-systeme-or text-systeme-or shadow-[0_0_10px_rgba(240,230,140,0.45)]",
  a_venir: "border-systeme-attenue/50 text-systeme-attenue",
  arretee: "border-systeme-alerte text-systeme-alerte",
};

/** Les étapes réelles d'une mission confirmée, avec qui doit agir. Sans animation en boucle. */
export function EtapesMission({ etapes }: { etapes: EtapeMission[] }) {
  return (
    <ol className="grid" aria-label="Étapes de la mission">
      {etapes.map((etape, index) => (
        <li key={etape.cle} aria-current={etape.etat === "courante" ? "step" : undefined} className="relative flex gap-3 pb-4 last:pb-0">
          {index < etapes.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-1 left-[13px] w-px bg-systeme-lueur/30" />}
          <span
            aria-hidden="true"
            className={cn("grid size-7 shrink-0 place-items-center rounded-full border-2 font-systeme text-xs font-bold", PASTILLES[etape.etat])}
          >
            {etape.etat === "faite" ? <Check className="size-4" /> : etape.etat === "arretee" ? <X className="size-4" /> : index + 1}
          </span>
          <div className="grid min-w-0 gap-0.5 pt-0.5">
            <p className={cn("leading-snug font-semibold text-balance", etape.etat === "a_venir" ? "text-systeme-attenue" : "text-systeme-texte")}>
              {etape.libelle}
            </p>
            <p
              className={cn(
                "text-sm",
                etape.etat === "courante" ? "font-semibold text-systeme-or" : etape.etat === "arretee" ? "text-systeme-alerte" : "text-systeme-attenue",
              )}
            >
              {texteEtat(etape)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
