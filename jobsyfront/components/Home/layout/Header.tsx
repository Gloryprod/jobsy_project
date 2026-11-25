"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet";
import { LienSysteme } from "@/components/systeme";

const LIENS = [
  { libelle: "Missions", href: "/missions" },
  { libelle: "Formations", href: "/formations" },
  { libelle: "Entreprises", href: "/entreprises" },
  { libelle: "Contact", href: "/contact" },
];

const FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur";

/** En-tête des pages publiques (lot 6b) : les pages qui existent, la connexion et l'inscription. */
export default function Header() {
  const [ouvert, setOuvert] = useState(false);
  const chemin = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-systeme-lueur/20 bg-systeme-nuit/95 font-lisible text-systeme-texte backdrop-blur">
      {/* Lien d'évitement : chaque page publique a une zone principale #contenu */}
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-systeme-lueur focus:px-4 focus:py-2.5 focus:font-bold focus:text-systeme-nuit">
        Aller au contenu
      </a>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className={`font-systeme text-2xl font-black tracking-tight ${FOCUS}`}>
          Jobsy
        </Link>

        <nav aria-label="Navigation principale" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-6">
            {LIENS.map((lien) => (
              <li key={lien.href}>
                <Link href={lien.href} aria-current={chemin === lien.href ? "page" : undefined} className={`font-semibold underline-offset-4 aria-[current=page]:text-systeme-lueur aria-[current=page]:underline hover:text-systeme-lueur hover:underline ${FOCUS}`}>
                  {lien.libelle}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LienSysteme href="/login" variante="contour" className="hidden sm:inline-flex">
            Se connecter
          </LienSysteme>
          <LienSysteme href="/register" className="hidden sm:inline-flex">
            Créer un compte
          </LienSysteme>

          <Sheet open={ouvert} onOpenChange={setOuvert}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Ouvrir le menu"
                className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-lg hover:bg-white/10 lg:hidden ${FOCUS}`}
              >
                <Menu aria-hidden="true" className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs border-systeme-lueur/30 bg-systeme-nuit font-lisible text-systeme-texte">
              <SheetTitle className="px-6 pt-6 font-systeme text-2xl font-black text-systeme-texte">Jobsy</SheetTitle>
              <nav aria-label="Menu" className="grid gap-6 px-6 pb-8">
                <ul className="grid">
                  {LIENS.map((lien) => (
                    <li key={lien.href} className="border-b border-white/10">
                      <SheetClose asChild>
                        <Link href={lien.href} aria-current={chemin === lien.href ? "page" : undefined} className={`block py-3 text-lg font-semibold aria-[current=page]:text-systeme-lueur hover:text-systeme-lueur ${FOCUS}`}>
                          {lien.libelle}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-3">
                  <SheetClose asChild>
                    <LienSysteme href="/register">Créer un compte</LienSysteme>
                  </SheetClose>
                  <SheetClose asChild>
                    <LienSysteme href="/login" variante="contour">
                      Se connecter
                    </LienSysteme>
                  </SheetClose>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
