'use client';

import { useState, useRef } from "react";
import { 
    Archive, ClipboardCheck, LayoutDashboard, Briefcase, User, 
    ChevronDown, Bell, X, Menu, LogOut, UsersRound 
} from "lucide-react";
import { useUser } from "@/context/UserProvider";
import { useLogout } from "@/lib/logout";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import Link from "next/link";
import Drawer from '@mui/material/Drawer';

export default function Header() {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [mobileNotificationMenuOpen, setMobileNotificationMenuOpen] = useState(false);
    const [openDrawer, setOpenDrawer] = useState(false);
    
    const notificationRef = useRef<HTMLDivElement>(null!);
    const profileRef = useRef<HTMLUListElement>(null!);
    const mobileNotificationRef = useRef<HTMLDivElement>(null!);

    const { user } = useUser();
    const { handleLogout } = useLogout();

    // Gestion des clics à l'extérieur pour fermer les menus déroulants
    useOnClickOutside(profileRef, () => setProfileDropdownOpen(false));
    useOnClickOutside(notificationRef, () => setNotificationDropdownOpen(false));
    useOnClickOutside(mobileNotificationRef, () => setMobileNotificationMenuOpen(false));

    const toggleDrawer = (state: boolean) => () => {
        setOpenDrawer(state);
    };

    // Tableaux de données pour la navigation mobile (Drawer)
    const sections = [
        {
            title: "Menu",
            items: [{ id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard/entreprises" }]
        },
        {
            title: "Mes Missions",
            items: [
                { id: "openJobs", name: "Offres Ouvertes", icon: ClipboardCheck, href: "/dashboard/entreprises/missions/list" },
                { id: "closeJobs", name: "Offres Clôturées", icon: Archive, href: "/dashboard/entreprises/missions/closed/list" },
            ]
        },
        {
            title: "Candidats",
            items: [{ id: "profileJeune", name: "Profils Candidats", icon: UsersRound, href: "/dashboard/entreprises/listCandidateProfile" }]
        },
        {
            title: "Général",
            items: [{ id: "profile", name: "Profil", icon: User, href: "/dashboard/entreprises/profile" }]
        }
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#000080]/90 backdrop-blur-xl border-b border-white/10 h-18">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full justify-between">
                
                {/* Logo principal */}
                <Link href="/dashboard/entreprise" className="flex items-center space-x-2.5 group">
                    <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                        <Briefcase className="w-5 h-5 text-white animate-pulse" strokeWidth={2.5} />
                    </div>
                    <span className="text-white text-xl font-black tracking-tight">Jobsy</span>
                </Link>


                {/* --- VERSION DESKTOP --- */}
                <div className="hidden md:flex items-center space-x-4">                     
                    {/* Cloche de Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button 
                            onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} 
                            className="w-10 h-10 flex items-center justify-center rounded-xl text-white cursor-pointer hover:bg-white/10 transition"
                        >
                            <Bell className="w-5 h-5 text-white" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    
                        {notificationDropdownOpen && (
                            <div className="absolute right-0 shadow-2xl bg-white py-4 z-50 rounded-xl w-95 max-h-112.5 overflow-auto mt-2 border border-gray-100">
                                <div className="flex items-center justify-between px-4 mb-3">
                                    <p className="text-xs text-[#000080] font-semibold cursor-pointer hover:underline">Tout effacer</p>
                                    <p className="text-xs text-[#000080] font-semibold cursor-pointer hover:underline">Marquer comme lu</p>
                                </div>
                            
                                <ul className="divide-y divide-gray-100">
                                    <li className="p-4 flex items-start hover:bg-gray-50 cursor-pointer transition">
                                        <img src="https://readymadeui.com/profile_2.webp" className="w-10 h-10 rounded-full shrink-0" alt="Avatar" />
                                        <div className="ml-3">
                                            <h3 className="text-xs text-slate-900 font-bold">Nouveau message de Yin</h3>
                                            <p className="text-xs text-slate-500 leading-relaxed mt-1 line-clamp-2">
                                                Bonjour, j&apos;ai jeté un coup d&apos;œil aux nouveaux profils disponibles...
                                            </p>
                                            <p className="text-[10px] text-[#000080]/60 font-medium mt-1">Il y a 10 minutes</p>
                                        </div>
                                    </li>
                                </ul>
                                <div className="text-center pt-2 border-t border-gray-100">
                                    <p className="text-xs text-[#000080] font-bold cursor-pointer hover:underline inline-block py-1">Voir toutes les notifications</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bloc Profil Administrateur Entreprise */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex cursor-pointer items-center space-x-3 rounded-xl hover:bg-white/10 px-3 py-1.5 transition"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                                    <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#000080]"></div>
                            </div>
                            <div className="text-left">
                                <p className="text-white text-xs font-bold leading-tight">{user?.entreprise?.nom_entreprise || "Mon Entreprise"}</p>
                                <p className="text-[#F0E68C] text-[10px]">Espace Entreprise</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileDropdownOpen && ( 
                            <ul ref={profileRef} className="absolute right-0 shadow-2xl bg-white py-1.5 z-50 w-48 rounded-xl mt-2 border border-gray-100 overflow-hidden">
                                <Link href="/dashboard/entreprises/profile">
                                    <li className="py-2 px-4 flex items-center hover:bg-slate-50 text-slate-700 font-medium text-xs cursor-pointer transition">
                                        <User className="w-4 h-4 mr-2.5 text-slate-400" />
                                        Mon Profil
                                    </li>
                                </Link>
                                <li 
                                    onClick={handleLogout}
                                    className="py-2 px-4 flex items-center hover:bg-red-50 text-red-600 font-medium text-xs cursor-pointer transition border-t border-gray-100"
                                >
                                    <LogOut className="w-4 h-4 mr-2.5 text-red-400" />     
                                    Déconnexion
                                </li>
                            </ul>
                        )}   
                    </div>
                </div> 
                
                {/* --- VERSION MOBILE --- */}
                <div className="md:hidden flex items-center space-x-2">
                    {/* Cloche Notification Mobile */}
                    <div className="relative" ref={mobileNotificationRef}>
                        <button onClick={() => setMobileNotificationMenuOpen(!mobileNotificationMenuOpen)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition cursor-pointer">
                            <Bell className="w-5 h-5 text-white" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>

                        {mobileNotificationMenuOpen && (
                            <div className="absolute right-0 top-11 shadow-2xl bg-white py-4 z-50 rounded-xl w-72.5 border border-gray-100">
                                <div className="flex items-center justify-between px-4 mb-2">
                                    <p className="text-[10px] text-[#000080] font-bold cursor-pointer">Tout effacer</p>
                                    <p className="text-[10px] text-[#000080] font-bold cursor-pointer">Marquer lu</p>
                                </div>
                                <ul className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                    <li className="p-3 flex items-start hover:bg-gray-50 cursor-pointer">
                                        <div className="ml-2">
                                            <p className="text-xs text-slate-900 font-medium">Nouveau message reçu</p>
                                            <p className="text-[11px] text-[#000080] font-medium">Il y a 10 min</p>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Déclencheur du Menu Drawer Latéral Mobile */}
                    <button 
                        onClick={toggleDrawer(true)} 
                        className="p-2 cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 transition"
                    > 
                        <Menu className="w-5 h-5 text-white" />
                    </button>

                    {/* Le Drawer Mui Nav Mobile */}
                    <Drawer open={openDrawer} onClose={toggleDrawer(false)} anchor="right">
                        <div className="w-64 h-full bg-[#000080]/90 text-white p-5 flex flex-col justify-between">
                            <div className="space-y-6">
                                {/* Header interne au tiroir mobile */}
                                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                    <span className="text-base font-black uppercase tracking-wider text-[#F0E68C]">Navigation</span>
                                    <button onClick={toggleDrawer(false)} className="p-1 rounded-lg bg-white/10 text-white">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Parcours dynamique de toutes les sections de l'app */}
                                <div className="space-y-5 overflow-y-auto no-scrollbar">
                                    {sections.map((section, sIndex) => (
                                        <div key={sIndex} className="space-y-2">
                                            <span className="block px-2 text-[10px] font-black uppercase tracking-widest text-white/40">
                                                {section.title}
                                            </span>
                                            <nav className="space-y-1">
                                                {section.items.map((item) => (
                                                    <Link
                                                        href={item.href}
                                                        key={item.id}
                                                        onClick={toggleDrawer(false)}
                                                        className="flex items-center px-3 py-2 text-xs font-bold text-white rounded-xl hover:bg-[#F0E68C] hover:text-black transition cursor-pointer"
                                                    >
                                                        <item.icon className="w-4 h-4 shrink-0 mr-3" />
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ))}
                                            </nav>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section Déconnexion basse */}
                            <div className="pt-4 border-t border-white/10">
                                <button 
                                    onClick={() => { handleLogout(); setOpenDrawer(false); }}
                                    className="flex items-center w-full px-3 py-2.5 text-xs font-bold text-red-300 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 shrink-0 mr-3" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </Drawer>
                </div>

            </div>
        </header>
    );
}