import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type LigneValeur = {
  libelle: string;
  valeur: ReactNode;
  /** « or » pour une récompense (FCFA, XP), « alerte » pour un délai ou un manque. */
  ton?: "normal" | "or" | "alerte";
};

/** Liste libellé / valeur d'une fenêtre du Système (récompense, rang du portail, délai…). */
export function LignesValeurs({ lignes, className }: { lignes: LigneValeur[]; className?: string }) {
  return (
    <dl className={cn("grid gap-2", className)}>
      {lignes.map((ligne) => (
        <div key={ligne.libelle} className="flex justify-between gap-3 border-b border-dashed border-systeme-lueur/25 pb-1.5">
          <dt className="text-systeme-attenue">{ligne.libelle}</dt>
          <dd
            className={cn(
              "text-right font-systeme font-bold tabular-nums",
              ligne.ton === "or" && "text-systeme-or",
              ligne.ton === "alerte" && "text-systeme-alerte",
            )}
          >
            {ligne.valeur}
          </dd>
        </div>
      ))}
    </dl>
  );
}
