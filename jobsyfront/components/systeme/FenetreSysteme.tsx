import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TonSysteme = "info" | "recompense" | "alerte";

type Props = {
  /** Libellé en tête de fenêtre : « Système », « Statut », « Invitation de guilde »… */
  etiquette: string;
  titre?: ReactNode;
  /** Niveau du titre dans la page, selon l'endroit où la fenêtre est posée. */
  niveauTitre?: 2 | 3 | 4;
  ton?: TonSysteme;
  /** Balayage lumineux à l'apparition, coupé quand l'appareil demande moins d'animations. */
  balayage?: boolean;
  className?: string;
  children?: ReactNode;
};

/**
 * Fenêtre du Système : la couche « jeu » posée sur une information réelle.
 * Le style (trait, coins, lueur) est dans globals.css, classe .systeme-fenetre.
 */
export function FenetreSysteme({
  etiquette,
  titre,
  niveauTitre = 2,
  ton = "info",
  balayage = true,
  className,
  children,
}: Props) {
  const Titre = `h${niveauTitre}` as "h2" | "h3" | "h4";

  return (
    <div data-ton={ton} className={cn("systeme-fenetre grid content-start gap-3.5 p-5 font-lisible", className)}>
      {balayage && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 animate-systeme-balayage bg-[linear-gradient(180deg,transparent_0%,rgba(86,216,255,0.16)_48%,transparent_52%)] motion-reduce:hidden"
        />
      )}
      <p className="flex items-center gap-2.5 font-systeme text-sm font-bold tracking-wide text-[var(--systeme-trait)]">
        <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[var(--systeme-trait)] shadow-[0_0_10px_var(--systeme-trait)]" />
        {etiquette}
      </p>
      {titre && <Titre className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte">{titre}</Titre>}
      {children}
    </div>
  );
}
