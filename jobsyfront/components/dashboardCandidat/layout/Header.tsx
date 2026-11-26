'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Briefcase, ChevronDown, LogOut, User } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { useLogout } from '@/lib/logout';
import { NotificationBell } from '@/components/dashboardCandidat/notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const FOCUS = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F0E68C]';

/** En-tête de l'espace candidat (lot 8a) : logo, cloche et menu du compte. Sur téléphone, le compte est dans « Plus ». */
export default function Header() {
  const { user } = useUser();
  const { handleLogout } = useLogout();
  const nom = [user?.prenom, user?.nom].filter(Boolean).join(' ') || 'Mon espace';
  // Le menu du compte est rendu dans l'en-tête, qui reste son repère pour les lecteurs d'écran
  const [entete, setEntete] = useState<HTMLElement | null>(null);

  return (
    <header ref={setEntete} className="fixed top-0 right-0 left-0 z-50 h-16 border-b border-white/10 bg-[#000080] font-lisible">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/candidats" className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}>
          <span className="rounded-xl bg-white/10 p-2">
            <Briefcase aria-hidden="true" className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-systeme text-xl font-black tracking-tight text-white">Jobsy</span>
          <span className="sr-only">, tableau de bord</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationBell />

          {/* Un menu n'est pas une fenêtre : non modal, il laisse la page lisible et se ferme avec Échap ou Tab */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={`hidden cursor-pointer items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-white/10 md:flex ${FOCUS}`}>
              <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
                <User aria-hidden="true" className="h-5 w-5 text-white" />
              </span>
              <span className="grid">
                <span className="text-sm leading-tight font-bold text-white">{nom}</span>
                <span className="text-xs text-[#F0E68C]">Espace candidat</span>
              </span>
              <ChevronDown aria-hidden="true" className="h-4 w-4 text-white/70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent container={entete} align="end" className="w-52 font-lisible">
              <DropdownMenuItem asChild className="min-h-11">
                <Link href="/dashboard/candidats/profile">
                  <User aria-hidden="true" className="h-4 w-4" />
                  Mon profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="min-h-11 text-red-700 focus:text-red-700">
                <LogOut aria-hidden="true" className="h-4 w-4 text-red-700" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
