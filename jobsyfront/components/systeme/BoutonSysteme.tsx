import type { ButtonHTMLAttributes, ComponentProps } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variante = "plein" | "contour";

function classesBouton(variante: Variante, className?: string) {
  return cn(
    // 44 px de haut minimum : cible tactile confortable
    "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[3px] px-4 font-lisible text-[0.95rem] font-bold",
    "transition duration-150 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100",
    "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variante === "plein"
      ? "bg-systeme-lueur text-systeme-nuit hover:brightness-110"
      : "border border-systeme-lueur bg-transparent text-systeme-lueur hover:bg-systeme-lueur/10",
    className,
  );
}

type PropsBouton = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  /** Désactive le bouton et affiche un indicateur pendant une action en cours. */
  chargement?: boolean;
};

export function BoutonSysteme({ variante = "plein", chargement = false, className, children, disabled, type = "button", ...reste }: PropsBouton) {
  return (
    <button type={type} disabled={disabled || chargement} aria-busy={chargement || undefined} className={classesBouton(variante, className)} {...reste}>
      {chargement && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  );
}

/** Même apparence que BoutonSysteme, pour aller vers une autre page. */
export function LienSysteme({ variante = "plein", className, ...reste }: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={classesBouton(variante, className)} {...reste} />;
}
