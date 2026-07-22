// 'use client';
// import {LogOut, User, UsersRound, Archive, LayoutDashboard, ClipboardCheck } from "lucide-react";
// import Link from "next/link";
// import { useLogout } from "@/lib/logout";
// import Divider from '@mui/material/Divider';

// export default function Navigation() {
//     const { handleLogout } = useLogout();

//     const navItem = [
//         { id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard/entreprises" },
//     ]

//     const navJobs = [
//         { id: "openJobs", name: "Missions Ouvertes", icon: ClipboardCheck, href: "/dashboard/entreprises/missions/list" },
//         { id: "closeJobs", name: "Missions Clotûrées", icon: Archive, href: "/dashboard/entreprises/missions/closed/list" },    ]

//     const navGeneral= [
//         { id: "profile", name: "Profil", icon: User, href: "/dashboard/entreprises/profile" },
//     ]

//     return (
//         <aside className="hidden md:flex fixed left-0 top-18 bottom-0 bg-[#000080]/80 backdrop-blur-lg p-4 border-b w-60">
//             <div className="px-3 py-4 overflow-y-auto no-scrollbar">
//                 <div className="flex items justify-left mb-4">
//                     <span className="text-white text-sm">Menu</span>
//                 </div>
//                 <nav className="space-y-2 w-full">
//                     {navItem.map((item) => (
//                         <Link
//                             href={item.href}
//                             key={item.id}
//                             className="flex items-center p-2 text-xs font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
//                         >
//                             <item.icon className="w-3 h-3" />
//                             <span className="ml-2">{item.name}</span>
//                         </Link>
//                     ))}
//                 </nav>

//                 <div className="flex items justify-left mb-4 pt-4">
//                     <span className="text-white text-sm">Mes Missions</span>
//                 </div>
//                 <nav className="space-y-2 w-full ">
//                     {navJobs.map((item) => (
//                         <Link
//                             href={item.href}
//                             key={item.id}
//                             className="flex items-center p-2 text-xs font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
//                         >
//                             <item.icon className="w-3 h-3" />
//                             <span className="ml-2">{item.name}</span>
//                         </Link>
//                     ))}
//                 </nav>

//                 <div className="flex items justify-left mb-4 pt-4">
//                     <span className="text-white text-sm">General</span>
//                 </div>
//                 <nav className="space-y-2 w-full">
//                     {navGeneral.map((item) => (
//                         <Link
//                             href={item.href}
//                             key={item.id}
//                             className="flex items-center p-2 text-xs font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
//                         >
//                             <item.icon className="w-3 h-3" />
//                             <span className="ml-2">{item.name}</span>
//                         </Link>

                        
//                     ))}

//                     <button onClick={handleLogout}
//                         className="flex items-center p-2 text-xs font-normal text-white rounded-lg dark:text-white  cursor-pointer">
                        
//                         <LogOut className="w-3 h-3 text-red-400" />
//                         <span className="text-white text-sm pl-2">Se déconnecter</span>
//                     </button>
//                 </nav>

//             </div>
//         </aside>
//     )
// }

'use client';
import { LogOut, User, Archive, LayoutDashboard, ClipboardCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/lib/logout";

interface NavigationProps {
    isCollapsed: boolean;
    setIsCollapsed: (collapsed: boolean) => void;
}

export default function Navigation({ isCollapsed, setIsCollapsed }: NavigationProps) {
    const { handleLogout } = useLogout();
    const pathname = usePathname();

    // Regroupement propre de tes données de navigation
    const sections = [
        {
            title: "Menu",
            items: [{ id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard/entreprises" }]
        },
        {
            title: "Mes Missions",
            items: [
                { id: "openJobs", name: "Missions Ouvertes", icon: ClipboardCheck, href: "/dashboard/entreprises/missions/list" },
                { id: "closeJobs", name: "Missions Clotûrées", icon: Archive, href: "/dashboard/entreprises/missions/closed/list" }
            ]
        },
        {
            title: "Général",
            items: [{ id: "profile", name: "Profil", icon: User, href: "/dashboard/entreprises/profile" }]
        }
    ];

    return (
        <div className="flex flex-col h-full justify-between p-4 w-full">
            
            <div className="flex items-center justify-between pb-4">
                {isCollapsed ? "" : <span className="text-sm pl-2 font-black uppercase tracking-wider text-white/50">Navigation</span>}

                {/* Bouton Toggle */}
                <div className={`flex ${isCollapsed ? "justify-center" : "justify-end"}`}>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 m-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                        title={isCollapsed ? "Agrandir le menu" : "Réduire le menu"}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>
            </div>    

            {/* Liste des menus défilants */}
            <div className="overflow-y-auto no-scrollbar flex-1 pr-1 space-y-6">
                {sections.map((section, sIndex) => (
                    <div key={sIndex} className="space-y-1.5">
                        
                        {/* Titre de Section (Masqué proprement si replié) */}
                        <span 
                            className={`block px-3 text-[10px] font-black uppercase tracking-widest text-white/40 transition-opacity duration-200 min-h-3.75 ${
                                isCollapsed ? "opacity-0 pointer-events-none text-center px-0 text-[8px]" : "opacity-100"
                            }`}
                        >
                            {isCollapsed ? "•••" : section.title}
                        </span>
                        
                        <nav className="space-y-1 w-full">
                            {section.items.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        href={item.href}
                                        key={item.id}
                                        title={isCollapsed ? item.name : ""}
                                        className={`flex items-center text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer ${
                                            isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3"
                                        } ${
                                            isActive
                                                ? "bg-[#F0E68C] text-black shadow-md shadow-black/10 translate-x-0.5"
                                                : "text-white hover:bg-white/10"
                                        }`}
                                    >
                                        <item.icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? "scale-110" : "opacity-80"}`} />
                                        
                                        {/* Animation de disparition du texte */}
                                        <span 
                                            className={`transition-all duration-300 origin-left overflow-hidden whitespace-nowrap ${
                                                isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>

            {/* Bouton Déconnexion ancré en bas */}
            <div className="pt-4 border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    title={isCollapsed ? "Se déconnecter" : ""}
                    className={`flex items-center text-xs font-medium text-red-300 hover:text-red-100 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer w-full ${
                        isCollapsed ? "justify-center p-2.5" : "px-3 py-2.5 gap-3"
                    }`}
                >
                    <LogOut className="w-4 h-4 shrink-0 text-red-400" />
                    <span 
                        className={`transition-all duration-300 origin-left overflow-hidden whitespace-nowrap ${
                            isCollapsed ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                        }`}
                    >
                        Se déconnecter
                    </span>
                </button>
            </div>
        </div>
    );
}