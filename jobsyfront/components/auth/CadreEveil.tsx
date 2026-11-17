import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FenetreSysteme, type TonSysteme } from "@/components/systeme";

type Props = {
  etiquette: string;
  titre: string;
  retour: { href: string; libelle: string };
  ton?: TonSysteme;
  children: ReactNode;
};

/**
 * Cadre commun des pages d'entrée (lot 6a, l'Éveil) : une fenêtre du Système sur fond de nuit.
 * Plus de photo de fond : lourde en 3G, elle rendait aussi le texte difficile à lire.
 */
export function CadreEveil({ etiquette, titre, retour, ton, children }: Props) {
  return (
    <main className="grid min-h-screen place-items-center bg-systeme-nuit bg-[radial-gradient(ellipse_at_top,rgba(86,216,255,0.12),transparent_60%)] px-4 py-10 font-lisible">
      <div className="grid w-full max-w-md gap-4">
        <Link
          href={retour.href}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-systeme-texte hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {retour.libelle}
        </Link>
        <FenetreSysteme etiquette={etiquette} titre={titre} niveauTitre={2} ton={ton} className="gap-4">
          {children}
        </FenetreSysteme>
      </div>
    </main>
  );
}
