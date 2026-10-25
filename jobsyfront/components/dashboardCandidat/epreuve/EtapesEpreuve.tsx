import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type EtapeAffichee = { cle: string; libelle: string };

/** Étapes de l'épreuve. « courante » vaut null sur l'accueil : rien n'est encore commencé. */
export function EtapesEpreuve({ etapes, courante }: { etapes: EtapeAffichee[]; courante: string | null }) {
  const indexCourant = courante ? etapes.findIndex((etape) => etape.cle === courante) : -1;

  return (
    <ol aria-label="Étapes de l'épreuve" className="flex flex-wrap items-center gap-2">
      {etapes.map((etape, i) => {
        // La dernière étape (« Candidature envoyée ») est accomplie dès qu'on l'atteint
        const derniereAtteinte = i === indexCourant && i === etapes.length - 1;
        const etat = i < indexCourant || derniereAtteinte ? "faite" : i === indexCourant ? "courante" : "a-venir";
        return (
          <li key={etape.cle} aria-current={i === indexCourant ? "step" : undefined} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border font-systeme text-sm font-bold",
                etat === "faite" && "border-systeme-lueur bg-systeme-lueur text-systeme-nuit",
                etat === "courante" && "border-systeme-or text-systeme-or",
                etat === "a-venir" && "border-systeme-lueur/40 text-systeme-attenue",
              )}
            >
              {etat === "faite" ? <Check aria-hidden="true" className="size-4" /> : i + 1}
            </span>
            <span className={cn("text-sm", etat === "courante" ? "font-bold text-systeme-texte" : "text-systeme-attenue")}>
              {etape.libelle}
              <span className="sr-only">{etat === "faite" ? " (terminée)" : etat === "courante" ? " (étape en cours)" : ""}</span>
            </span>
            {i < etapes.length - 1 && <span aria-hidden="true" className="hidden h-px w-5 bg-systeme-lueur/30 sm:block" />}
          </li>
        );
      })}
    </ol>
  );
}
