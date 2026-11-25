import type { ReactNode } from "react";
import Header from "@/components/Home/layout/Header";
import Footer from "@/components/Home/layout/Footer";
import { FenetreSysteme } from "@/components/systeme";

export const SECTION = "mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:px-6";
export const TITRE_SECTION = "font-systeme text-2xl font-bold text-balance sm:text-3xl";

type Props = {
  etiquette: string;
  titre: string;
  /** Texte d'introduction et liens, sous le titre */
  intro: ReactNode;
  children: ReactNode;
};

/**
 * Cadre des pages publiques (lot 8e), dans le style de l'accueil : en-tête, zone principale sur fond de nuit
 * (cible du lien « Aller au contenu »), fenêtre d'introduction avec le titre de la page, pied de page.
 */
export function CadrePublic({ etiquette, titre, intro, children }: Props) {
  return (
    <>
      <Header />
      <main
        id="contenu"
        tabIndex={-1}
        className="min-h-screen bg-systeme-nuit bg-[radial-gradient(ellipse_at_top,rgba(86,216,255,0.12),transparent_55%)] pt-20 font-lisible text-systeme-texte focus:outline-none"
      >
        <section aria-labelledby="page-titre" className="mx-auto grid max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
          <FenetreSysteme etiquette={etiquette} className="gap-4 p-6 sm:p-8">
            <h1 id="page-titre" className="font-systeme text-4xl font-black text-balance sm:text-5xl">
              {titre}
            </h1>
            {intro}
          </FenetreSysteme>
        </section>
        {children}
      </main>
      <Footer />
    </>
  );
}
