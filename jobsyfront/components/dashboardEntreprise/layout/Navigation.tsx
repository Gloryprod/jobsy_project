'use client';
import { Home, Briefcase, FileClock, LogOut, User, UsersRound } from "lucide-react";
import Link from "next/link";
import { useLogout } from "@/lib/logout";
import Divider from '@mui/material/Divider';

export default function Navigation() {
    const { handleLogout } = useLogout();

    const navItem = [
        { id: "home", name: "Tableau de bord", icon: Home, href: "/dashboard/entreprises" },
        { id: "jobs", name: "Offres / Missions", icon: Briefcase, href: "/dashboard/entreprises/missions/list" },
        { id: "applications", name: "Candidatures", icon: FileClock, href: "/dashboard/entreprises/candidatures" },
    ]

    const navJeunes = [
        { id: "profileJeune", name: "Profils Candidats", icon: UsersRound, href: "/dashboard/entreprises/listCandidateProfile" },
    ]

    const navGeneral= [
        { id: "profile", name: "Profil", icon: User, href: "/dashboard/entreprises/profile" },
    ]

    return (
        <aside className="hidden md:flex fixed left-0 top-22 bottom-0 bg-[#000080]/80 backdrop-blur-lg p-4 border-b rounded-2xl m-4 w-64">
            <div className="px-3 py-4 overflow-y-auto no-scrollbar">
                <div className="flex items justify-left mb-4">
                    <span className="text-[#F0E68C] text-xs">Menu</span>
                </div>
                <nav className="space-y-2 w-full">
                    {navItem.map((item) => (
                        <Link
                            href={item.href}
                            key={item.id}
                            className="flex items-center p-2 text-sm font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-2">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items justify-left mb-4 pt-4">
                    <span className="text-[#F0E68C] text-xs">Candidats</span>
                </div>
                <nav className="space-y-2 w-full ">
                    {navJeunes.map((item) => (
                        <Link
                            href={item.href}
                            key={item.id}
                            className="flex items-center p-2 text-sm font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-2">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="flex items justify-left mb-4 pt-4">
                    <span className="text-[#F0E68C] text-xs">General</span>
                </div>
                <nav className="space-y-2 w-full">
                    {navGeneral.map((item) => (
                        <Link
                            href={item.href}
                            key={item.id}
                            className="flex items-center p-2 text-sm font-normal text-white rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="ml-2">{item.name}</span>
                        </Link>

                        
                    ))}

                    <button onClick={handleLogout}
                        className="flex items-center p-2 text-sm font-normal text-white rounded-lg dark:text-white  cursor-pointer">
                        
                        <LogOut className="w-6 h-6 text-red-400" />
                        <span className="text-white text-sm pl-2">Se déconnecter</span>
                    </button>
                </nav>

            </div>
        </aside>
    )
}