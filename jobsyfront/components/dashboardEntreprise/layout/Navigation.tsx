'use client';

import { LogOut, User, Archive, LayoutDashboard, ClipboardCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/lib/logout";

interface NavigationProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

// Partagé avec le menu mobile de l'en-tête : une seule liste des pages de l'espace entreprise
export const SECTIONS_ENTREPRISE = [
    {
        title: "Menu",
        items: [{ id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard/entreprises" }]
    },
    {
        title: "Mes missions",
        items: [
            { id: "openJobs", name: "Missions ouvertes", icon: ClipboardCheck, href: "/dashboard/entreprises/missions/list" },
            { id: "closeJobs", name: "Missions clôturées", icon: Archive, href: "/dashboard/entreprises/missions/closed/list" }
        ]
    },
    {
        title: "Général",
        items: [{ id: "profile", name: "Profil", icon: User, href: "/dashboard/entreprises/profile" }]
    }
];

const FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F0E68C]";

export default function Navigation({ isCollapsed, setIsCollapsed }: NavigationProps) {
    const { handleLogout } = useLogout();
    const pathname = usePathname();

    return (
        <nav aria-label="Espace entreprise" className="flex flex-col h-full justify-between p-4 w-full font-lisible">
            <div className={`flex pb-4 ${isCollapsed ? "justify-center" : "justify-end"}`}>
                <button
                    type="button"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
                    className={`inline-flex size-11 items-center justify-center rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white cursor-pointer ${FOCUS}`}
                >
                    {isCollapsed ? <ChevronRight aria-hidden="true" className="w-4 h-4" /> : <ChevronLeft aria-hidden="true" className="w-4 h-4" />}
                </button>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 pr-1 space-y-6">
                {SECTIONS_ENTREPRISE.map((section) => (
                    <div key={section.title} className="space-y-1.5">
                        {!isCollapsed && (
                            <p className="px-3 text-xs font-bold uppercase tracking-wider text-white/60">{section.title}</p>
                        )}
                        <ul className="space-y-1 w-full">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <li key={item.id}>
                                        <Link
                                            href={item.href}
                                            aria-current={isActive ? "page" : undefined}
                                            title={isCollapsed ? item.name : undefined}
                                            className={`flex min-h-11 items-center text-sm font-semibold rounded-xl ${FOCUS} ${
                                                isCollapsed ? "justify-center p-2.5" : "px-3 gap-3"
                                            } ${isActive ? "bg-[#F0E68C] text-black" : "text-white hover:bg-white/10"}`}
                                        >
                                            <item.icon aria-hidden="true" className="w-4 h-4 shrink-0" />
                                            <span className={isCollapsed ? "sr-only" : "whitespace-nowrap"}>{item.name}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="pt-4 border-t border-white/10">
                <button
                    type="button"
                    onClick={handleLogout}
                    title={isCollapsed ? "Se déconnecter" : undefined}
                    className={`flex min-h-11 items-center text-sm font-semibold text-red-200 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-xl cursor-pointer w-full ${FOCUS} ${
                        isCollapsed ? "justify-center p-2.5" : "px-3 gap-3"
                    }`}
                >
                    <LogOut aria-hidden="true" className="w-4 h-4 shrink-0" />
                    <span className={isCollapsed ? "sr-only" : "whitespace-nowrap"}>Se déconnecter</span>
                </button>
            </div>
        </nav>
    );
}
