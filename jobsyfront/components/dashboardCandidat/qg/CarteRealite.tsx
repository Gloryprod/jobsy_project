import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Carte de la couche « réalité » : informations réelles, fond clair, lisibles sans connaître le jeu. */
export function CarteRealite({ titre, lienPied, children, className }: { titre: string; lienPied?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("grid content-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 font-lisible text-slate-900", className)}>
      <h2 className="font-systeme text-xl font-bold text-[#000080]">{titre}</h2>
      {children}
      {lienPied && <div className="border-t border-slate-100 pt-3">{lienPied}</div>}
    </section>
  );
}

export function LienRealite({ className, ...reste }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#000080] px-4 text-sm font-bold text-white transition-colors hover:bg-[#000080]/85",
        "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]",
        className,
      )}
      {...reste}
    />
  );
}

export function LienDiscret({ className, ...reste }: ComponentProps<typeof Link>) {
  return <Link className={cn("inline-flex min-h-11 items-center text-sm font-bold text-[#000080] underline-offset-4 hover:underline", className)} {...reste} />;
}

export type TonStatut = "action" | "attente" | "succes" | "echec" | "neutre";

const COULEURS_STATUT: Record<TonStatut, string> = {
  action: "border-blue-200 bg-blue-50 text-[#000080]",
  attente: "border-amber-200 bg-amber-50 text-amber-800",
  succes: "border-emerald-200 bg-emerald-50 text-emerald-800",
  echec: "border-red-200 bg-red-50 text-red-700",
  neutre: "border-slate-200 bg-slate-50 text-slate-600",
};

/** Statut écrit en toutes lettres : la couleur n'est jamais la seule information. */
export function PastilleStatut({ ton, children, className }: { ton: TonStatut; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-bold", COULEURS_STATUT[ton], className)}>
      {children}
    </span>
  );
}

/** Message d'erreur d'une section, avec un bouton pour recharger. */
export function ErreurSection({ texte, reessayer }: { texte: string; reessayer: () => void }) {
  return (
    <div className="grid gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      <p>{texte}</p>
      <button type="button" onClick={reessayer} className="min-h-11 cursor-pointer justify-self-start rounded-lg border border-red-300 bg-white px-3 font-bold hover:bg-red-100">
        Réessayer
      </button>
    </div>
  );
}
