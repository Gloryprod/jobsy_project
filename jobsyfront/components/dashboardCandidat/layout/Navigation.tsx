'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, Menu } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { useLogout } from '@/lib/logout';
import { formaterFcfa } from '@/lib/formats';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { BARRE_DU_BAS, GROUPES_CANDIDAT, pageActive } from './pages';

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F0E68C]';

interface NavigationProps {
  reduit: boolean;
  setReduit: (reduit: boolean) => void;
}

/** Barre latérale de l'espace candidat sur ordinateur (lot 8a) : pages groupées, solde, déconnexion. */
export default function Navigation({ reduit, setReduit }: NavigationProps) {
  const { user } = useUser();
  const { handleLogout } = useLogout();
  const active = pageActive(usePathname());
  const solde = formaterFcfa(user?.candidat?.wallet?.balance);

  return (
    <nav aria-label="Espace candidat" className="flex h-full w-full flex-col justify-between p-4 font-lisible">
      <div className={`flex pb-4 ${reduit ? 'justify-center' : 'justify-end'}`}>
        <button
          type="button"
          onClick={() => setReduit(!reduit)}
          aria-expanded={!reduit}
          aria-label={reduit ? 'Agrandir le menu' : 'Réduire le menu'}
          className={`inline-flex size-11 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white ${FOCUS}`}
        >
          {reduit ? <ChevronRight aria-hidden="true" className="h-4 w-4" /> : <ChevronLeft aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>

      <div className="no-scrollbar flex-1 space-y-5 overflow-y-auto pr-1">
        {GROUPES_CANDIDAT.map((groupe, rang) => (
          <div key={groupe.titre ?? rang} className="space-y-1.5">
            {groupe.titre && !reduit && <p className="px-3 text-xs font-bold tracking-wider text-white/60 uppercase">{groupe.titre}</p>}
            <ul className="w-full space-y-1">
              {groupe.pages.map((page) => {
                const estActive = active === page.id;
                return (
                  <li key={page.id}>
                    <Link
                      href={page.href}
                      aria-current={estActive ? 'page' : undefined}
                      title={reduit ? page.nom : undefined}
                      className={`flex min-h-11 items-center rounded-xl text-sm font-semibold ${FOCUS} ${reduit ? 'justify-center p-2.5' : 'gap-3 px-3'} ${
                        estActive ? 'bg-[#F0E68C] text-black' : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <page.icone aria-hidden="true" className="h-4 w-4 shrink-0" />
                      <span className={reduit ? 'sr-only' : 'whitespace-nowrap'}>{page.nom}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-white/10 pt-4">
        {solde && (
          <Link
            href="/dashboard/candidats/loot"
            title={reduit ? `Solde : ${solde}` : undefined}
            className={`block rounded-xl border border-white/10 bg-white/5 text-center hover:bg-white/10 ${FOCUS} ${reduit ? 'p-2' : 'p-3'}`}
          >
            <span className={reduit ? 'sr-only' : 'block text-xs text-white/70'}>Solde du Trésor</span>
            <span className={`block font-black tracking-wide text-[#F0E68C] ${reduit ? 'text-[11px]' : 'text-lg'}`}>{reduit ? solde.replace(' FCFA', '') : solde}</span>
          </Link>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title={reduit ? 'Se déconnecter' : undefined}
          className={`flex min-h-11 w-full cursor-pointer items-center rounded-xl bg-red-500/10 text-sm font-semibold text-red-200 hover:bg-red-500/20 hover:text-white ${FOCUS} ${
            reduit ? 'justify-center p-2.5' : 'gap-3 px-3'
          }`}
        >
          <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className={reduit ? 'sr-only' : 'whitespace-nowrap'}>Se déconnecter</span>
        </button>
      </div>
    </nav>
  );
}

/** Barre du bas sur téléphone : la boucle principale et « Plus », qui ouvre toutes les pages (D41). */
export function BarreDuBas() {
  const [plusOuvert, setPlusOuvert] = useState(false);
  const { user } = useUser();
  const { handleLogout } = useLogout();
  const active = pageActive(usePathname());
  const dansPlus = !!active && !BARRE_DU_BAS.some((p) => p.id === active);
  const nom = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Mon espace';
  const entree = (estActive: boolean) =>
    `flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-xs font-semibold ${FOCUS} ${estActive ? 'text-[#F0E68C]' : 'text-white/80 hover:text-white'}`;

  return (
    <nav aria-label="Navigation principale" className="border-t border-white/10 bg-[#000080] pb-[env(safe-area-inset-bottom)] font-lisible">
      <ul className="flex items-stretch px-1">
        {BARRE_DU_BAS.map((page) => (
          <li key={page.id} className="flex flex-1">
            <Link href={page.href} aria-current={active === page.id ? 'page' : undefined} className={entree(active === page.id)}>
              <page.icone aria-hidden="true" className="h-5 w-5" />
              <span>{page.court ?? page.nom}</span>
            </Link>
          </li>
        ))}
        <li className="flex flex-1">
          <Sheet open={plusOuvert} onOpenChange={setPlusOuvert}>
            <SheetTrigger asChild>
              <button type="button" className={`${entree(dansPlus)} cursor-pointer`}>
                <Menu aria-hidden="true" className="h-5 w-5" />
                <span>Plus</span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-white/10 bg-[#000080] font-lisible text-white">
              <SheetTitle className="px-5 pt-6 text-base font-bold text-[#F0E68C]">{nom}</SheetTitle>
              <nav aria-label="Toutes les pages" className="grid gap-5 overflow-y-auto px-5 pb-6">
                {GROUPES_CANDIDAT.map((groupe, rang) => (
                  <div key={groupe.titre ?? rang} className="grid gap-1">
                    {groupe.titre && <p className="px-2 text-xs font-bold tracking-wider text-white/60 uppercase">{groupe.titre}</p>}
                    <ul className="grid gap-1">
                      {groupe.pages.map((page) => (
                        <li key={page.id}>
                          <SheetClose asChild>
                            <Link
                              href={page.href}
                              aria-current={active === page.id ? 'page' : undefined}
                              className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${FOCUS} ${
                                active === page.id ? 'bg-[#F0E68C] text-black' : 'hover:bg-white/10'
                              }`}
                            >
                              <page.icone aria-hidden="true" className="h-4 w-4 shrink-0" />
                              {page.nom}
                            </Link>
                          </SheetClose>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPlusOuvert(false);
                    handleLogout();
                  }}
                  className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-red-500/15 px-3 text-sm font-semibold text-red-100 hover:bg-red-500/25 ${FOCUS}`}
                >
                  <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Se déconnecter
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
