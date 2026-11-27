'use client';

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Briefcase, ChevronDown, LogOut, Menu, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useUser } from "@/context/UserProvider";
import { useLogout } from "@/lib/logout";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SECTIONS_ENTREPRISE, estActive, type SectionEspace } from "./Navigation";

const FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F0E68C]";
const BOUTON_ICONE = `relative inline-flex size-11 items-center justify-center rounded-xl text-white hover:bg-white/10 cursor-pointer ${FOCUS}`;

/** Lien d'une notification : l'offre acceptée mène aux propositions, le reste au suivi des recrutés. */
function lienNotification(n: AppNotification): string | null {
    if (!n.data.mission_id) return null;
    const page = n.data.type === "proposal_accepted" ? "proposals" : "confirmedApplicants";
    return `/dashboard/entreprises/missions/${n.data.mission_id}/${page}`;
}

function Cloche({ conteneur }: { conteneur: HTMLElement | null }) {
    const { notifications, unreadCount, markAllAsRead } = useNotifications();
    const nom = unreadCount > 0 ? `Notifications : ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Notifications";

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger aria-label={nom} className={BOUTON_ICONE}>
                <Bell aria-hidden="true" className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span aria-hidden="true" className="absolute top-1 right-1 min-w-5 rounded-full bg-red-600 px-1 text-[11px] font-bold leading-5 text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent container={conteneur} align="end" className="w-80 max-h-[70vh] overflow-y-auto font-lisible">
                <DropdownMenuLabel className="text-sm">Notifications</DropdownMenuLabel>
                {unreadCount > 0 && (
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault();
                            markAllAsRead();
                        }}
                        className="min-h-11 font-semibold text-[#000080]"
                    >
                        Tout marquer comme lu
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <p className="px-2 py-4 text-sm text-slate-600">Aucune notification pour le moment.</p>
                ) : (
                    notifications.slice(0, 10).map((n) => {
                        const lien = lienNotification(n);
                        const contenu = (
                            <span className="grid gap-0.5">
                                <span className={`text-sm text-slate-900 ${n.read_at ? "font-medium" : "font-bold"}`}>
                                    {!n.read_at && <span className="sr-only">Non lue : </span>}
                                    {n.data.mission_title || "Notification"}
                                </span>
                                {n.data.message && <span className="text-sm text-slate-600">{n.data.message}</span>}
                                <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}</span>
                            </span>
                        );
                        return lien ? (
                            <DropdownMenuItem key={n.id} asChild className="items-start">
                                <Link href={lien}>{contenu}</Link>
                            </DropdownMenuItem>
                        ) : (
                            <div key={n.id} className="px-2 py-1.5">
                                {contenu}
                            </div>
                        );
                    })
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

interface EnteteEspaceProps {
    sections: SectionEspace[];
    /** Destination du logo */
    accueil: string;
    /** Nom affiché dans le menu du compte et en titre du menu mobile */
    nom: string;
    /** « Espace entreprise », « Administration » */
    espace: string;
    /** Page du profil, si l'espace en a une */
    profil?: string;
    /** Cloche des notifications, si l'espace en reçoit ; elle reçoit l'en-tête comme conteneur de son menu */
    cloche?: (conteneur: HTMLElement | null) => ReactNode;
}

/** En-tête des espaces sobres (lot 7a, partagé avec l'administration au lot 8d) : logo, notifications, compte, menu mobile. */
export function EnteteEspace({ sections, accueil, nom, espace, profil, cloche }: EnteteEspaceProps) {
    const [menuOuvert, setMenuOuvert] = useState(false);
    // Les menus sont rendus dans l'en-tête, qui reste leur repère pour les lecteurs d'écran
    const [entete, setEntete] = useState<HTMLElement | null>(null);
    const pathname = usePathname();
    const { handleLogout } = useLogout();

    return (
        <header ref={setEntete} className="fixed top-0 left-0 right-0 z-50 h-18 border-b border-white/10 bg-[#000080] font-lisible">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <Link href={accueil} className={`flex items-center gap-2.5 rounded-lg ${FOCUS}`}>
                    <span className="rounded-xl bg-white/10 p-2">
                        <Briefcase aria-hidden="true" className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </span>
                    <span className="font-systeme text-xl font-black tracking-tight text-white">Jobsy</span>
                    <span className="sr-only">, tableau de bord</span>
                </Link>

                <div className="flex items-center gap-2">
                    {cloche?.(entete)}

                    {/* Un menu n'est pas une fenêtre : non modal, il laisse la page lisible et se ferme avec Échap ou Tab */}
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger className={`hidden md:flex items-center gap-3 rounded-xl px-3 py-1.5 text-left hover:bg-white/10 cursor-pointer ${FOCUS}`}>
                            <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
                                <User aria-hidden="true" className="w-5 h-5 text-white" />
                            </span>
                            <span className="grid">
                                <span className="text-sm font-bold leading-tight text-white">{nom}</span>
                                <span className="text-xs text-[#F0E68C]">{espace}</span>
                            </span>
                            <ChevronDown aria-hidden="true" className="w-4 h-4 text-white/70" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent container={entete} align="end" className="w-52 font-lisible">
                            {profil && (
                                <>
                                    <DropdownMenuItem asChild className="min-h-11">
                                        <Link href={profil}>
                                            <User aria-hidden="true" className="w-4 h-4" />
                                            Mon profil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                </>
                            )}
                            <DropdownMenuItem onSelect={handleLogout} className="min-h-11 text-red-700 focus:text-red-700">
                                <LogOut aria-hidden="true" className="w-4 h-4 text-red-700" />
                                Se déconnecter
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
                        <SheetTrigger asChild>
                            <button type="button" aria-label="Ouvrir le menu" className={`${BOUTON_ICONE} md:hidden`}>
                                <Menu aria-hidden="true" className="w-5 h-5" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-72 border-white/10 bg-[#000080] font-lisible text-white">
                            <SheetTitle className="px-5 pt-6 text-base font-bold text-[#F0E68C]">{nom}</SheetTitle>
                            <nav aria-label={espace} className="grid gap-5 overflow-y-auto px-5 pb-6">
                                {sections.map((section) => (
                                    <div key={section.title} className="grid gap-1">
                                        <p className="px-2 text-xs font-bold uppercase tracking-wider text-white/60">{section.title}</p>
                                        <ul className="grid gap-1">
                                            {section.items.map((item) => {
                                                const active = estActive(pathname, item);
                                                return (
                                                    <li key={item.id}>
                                                        <SheetClose asChild>
                                                            <Link
                                                                href={item.href}
                                                                aria-current={active ? "page" : undefined}
                                                                className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${FOCUS} ${active ? "bg-[#F0E68C] text-black" : "hover:bg-white/10"}`}
                                                            >
                                                                <item.icon aria-hidden="true" className="w-4 h-4 shrink-0" />
                                                                {item.name}
                                                            </Link>
                                                        </SheetClose>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOuvert(false);
                                        handleLogout();
                                    }}
                                    className={`flex min-h-11 items-center gap-3 rounded-xl bg-red-500/15 px-3 text-sm font-semibold text-red-100 hover:bg-red-500/25 cursor-pointer ${FOCUS}`}
                                >
                                    <LogOut aria-hidden="true" className="w-4 h-4 shrink-0" />
                                    Se déconnecter
                                </button>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}

/** En-tête de l'espace entreprise (lot 7a). */
export default function Header() {
    const { user } = useUser();
    return (
        <EnteteEspace
            sections={SECTIONS_ENTREPRISE}
            accueil="/dashboard/entreprises"
            nom={user?.entreprise?.nom_entreprise || "Mon entreprise"}
            espace="Espace entreprise"
            profil="/dashboard/entreprises/profile"
            cloche={(conteneur) => <Cloche conteneur={conteneur} />}
        />
    );
}
