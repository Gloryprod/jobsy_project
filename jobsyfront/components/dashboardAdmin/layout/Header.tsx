'use client'

import { Banknote, Building2, GraduationCap, LayoutDashboard, Search, Users } from "lucide-react";
// import SearchBar from "@/components/SearchBar";
import { useState } from "react";
import { User, ChevronDown, Bell, X, Menu, LogOut} from "lucide-react";
import { useUser } from "@/context/UserProvider";
import { useLogout } from "@/lib/logout";
import { useRef } from "react";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import Link from "next/link";
import Drawer from '@mui/material/Drawer';


export default function Header() {
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const [mobileNotificationMenuOpen, setMobileNotificationMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null!);
    const refUL = useRef<HTMLUListElement>(null!);
    const { user } = useUser();
    const { handleLogout } = useLogout();

    useOnClickOutside(refUL, () => setProfileDropdownOpen(false));
    useOnClickOutside(ref, () => setNotificationDropdownOpen(false));
    useOnClickOutside(refUL, () => setMobileMenuOpen(false));
    useOnClickOutside(ref, () => setMobileNotificationMenuOpen(false));

    const toggleDrawer = (open: boolean) => () => {
        setOpen(open);
    };

    const navItem = [
        { id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: "/dashboard/admin" },
    ]

    const navJeunes = [
        { id: "applicants", name: "Candidats", icon: Users, href: "/dashboard/admin/listCandidateProfile" },
        { id: "withdrawals", name: "Décaissements", icon: Banknote, href: "/dashboard/admin/withdrawRequests" },
    ]

    const navEntreprises = [
        { id: "enterprises", name: "Entreprises", icon: Building2, href: "/dashboard/admin/entreprises/list" },
    ]

    const navFormations = [
        { id: "courses", name: "Formations", icon: GraduationCap, href: "/dashboard/admin/courses/list" },
    ]
    
    const navGeneral= [
        { id: "profile", name: "Profil", icon: User, href: "/dashboard/admin/profile" },
    ]

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#000080]/80 backdrop-blur-xl h-18">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-full justify-between">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <Search className="w-8 h-8 text-[#F0E68C]" strokeWidth={3} />
                    <span className="text-white text-xl font-bold">Jobsy</span>
                </div>

                {/* Desktop : Notifications + Profil avec Dropdown */}
                <div className="hidden md:flex justify-end items-center space-x-3">                    
                    <div className="relative">
                        <button onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)} type="button" id="dropdownToggle" className="w-12 h-12 flex items-center justify-center rounded-full text-white border-none outline-none cursor-pointer hover:bg-white/10">
                            <Bell className="w-5 h-5 text-white" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    
                        {notificationDropdownOpen && (
                            <div id="dropdownMenu" ref={ref} className="absolute block right-0 shadow-lg bg-white py-4 z-1000 min-w-full rounded-lg w-[410px] max-h-[500px] overflow-auto mt-2">
                            <div className="flex items-center justify-between px-4 mb-4">
                                <p className="text-xs text-[#000080] font-medium cursor-pointer">Clear all</p>
                                <p className="text-xs text-[#000080] font-medium cursor-pointer">Mark as read</p>
                            </div>
                        
                            <ul className="divide-y divide-gray-300">
                                <li className="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                                <img src="https://readymadeui.com/profile_2.webp" className="w-12 h-12 rounded-full shrink-0" />
                        
                                <div className="ml-6">
                                    <h3 className="text-sm text-slate-900 font-medium">Your have a new message from Yin</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">Hello there, check this new items in from
                                    the your may interested from
                                    the motion school.</p>
                                    <p className="text-xs text-[#000080] font-medium leading-3 mt-2">10 minutes ago</p>
                                </div>
                                </li>
                        
                            </ul>
                            <p className="text-xs px-4 mt-6 mb-4 inline-block text-[#000080] font-medium cursor-pointer">View all Notifications</p>
                        </div>
                        )}
                    </div>
                    {/* Bloc Profil cliquable */}
                    <div className="relative">
                        <button
                            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            className="flex cursor-pointer items-center space-x-3 rounded-xl hover:bg-white/10 px-4 py-2 transition"
                        >
                            <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                                <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                                <User className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#000080]"></div>
                            </div>
                            <div className="text-left">
                            <p className="text-white font-medium">{user?.nom} {user?.prenom}</p>
                            <p className="text-[#F0E68C] text-xs">Espace Admin</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileDropdownOpen && ( 
                            <ul id="dropdownMenu" ref={refUL} className="absolute block shadow-lg bg-white py-2 z-[1000] min-w-full w-max rounded-lg max-h-96 overflow-auto">
                                <Link href="/dashboard/admin/">
                                    <li
                                        className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-4 h-4 mr-3" viewBox="0 0 512 512">
                                        <path
                                            d="M197.332 170.668h-160C16.746 170.668 0 153.922 0 133.332v-96C0 16.746 16.746 0 37.332 0h160c20.59 0 37.336 16.746 37.336 37.332v96c0 20.59-16.746 37.336-37.336 37.336zM37.332 32A5.336 5.336 0 0 0 32 37.332v96a5.337 5.337 0 0 0 5.332 5.336h160a5.338 5.338 0 0 0 5.336-5.336v-96A5.337 5.337 0 0 0 197.332 32zm160 480h-160C16.746 512 0 495.254 0 474.668v-224c0-20.59 16.746-37.336 37.332-37.336h160c20.59 0 37.336 16.746 37.336 37.336v224c0 20.586-16.746 37.332-37.336 37.332zm-160-266.668A5.337 5.337 0 0 0 32 250.668v224A5.336 5.336 0 0 0 37.332 480h160a5.337 5.337 0 0 0 5.336-5.332v-224a5.338 5.338 0 0 0-5.336-5.336zM474.668 512h-160c-20.59 0-37.336-16.746-37.336-37.332v-96c0-20.59 16.746-37.336 37.336-37.336h160c20.586 0 37.332 16.746 37.332 37.336v96C512 495.254 495.254 512 474.668 512zm-160-138.668a5.338 5.338 0 0 0-5.336 5.336v96a5.337 5.337 0 0 0 5.336 5.332h160a5.336 5.336 0 0 0 5.332-5.332v-96a5.337 5.337 0 0 0-5.332-5.336zm160-74.664h-160c-20.59 0-37.336-16.746-37.336-37.336v-224C277.332 16.746 294.078 0 314.668 0h160C495.254 0 512 16.746 512 37.332v224c0 20.59-16.746 37.336-37.332 37.336zM314.668 32a5.337 5.337 0 0 0-5.336 5.332v224a5.338 5.338 0 0 0 5.336 5.336h160a5.337 5.337 0 0 0 5.332-5.336v-224A5.336 5.336 0 0 0 474.668 32zm0 0"
                                            data-original="#000000"></path>
                                        </svg>
                                        Dashboard
                                    </li>
                                </Link>
                                <li onClick={handleLogout}
                                    className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer">
                                    <LogOut className="w-5 h-5 mr-2 text-red-400" />             
                                    Déconnexion
                                </li>
                            </ul>
                        )}   
                    </div>
                </div> 
                
                {/* Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button onClick={() => setMobileNotificationMenuOpen(!mobileNotificationMenuOpen)} className="relative cursor-pointer p-2 rounded-lg bg-white/5">
                        <Bell className="w-5 h-5 text-white" />
                        <span className="relative top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {mobileNotificationMenuOpen && (
                        <div id="dropdownMenu" ref={ref} className="absolute top-12 right-0 shadow-lg bg-white py-4 z-[1000] rounded-lg  overflow-auto m-4">
                            <div className="flex items-center justify-between px-4 mb-4">
                                <p className="text-xs text-[#000080] font-medium cursor-pointer">Clear all</p>
                                <p className="text-xs text-[#000080] font-medium cursor-pointer">Mark as read</p>
                            </div>
                        
                            <ul className="divide-y divide-gray-300">
                                <li className="dropdown-item p-4 flex items-center hover:bg-gray-50 cursor-pointer">
                                <img src="https://readymadeui.com/profile_2.webp" className="w-12 h-12 rounded-full shrink-0" />
                        
                                <div className="ml-6">
                                    <h3 className="text-sm text-slate-900 font-medium">Your have a new message from Yin</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-2">Hello there, check this new items in from
                                    the your may interested from
                                    the motion school.</p>
                                    <p className="text-xs text-[#000080] font-medium leading-3 mt-2">10 minutes ago</p>
                                </div>
                                </li>
                            </ul>
                            <p className="text-xs px-4 mt-6 mb-4 inline-block text-[#000080] font-medium cursor-pointer">View all Notifications</p>
                        </div>
                    )}

                     <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="relative p-2 cursor-pointer rounded-lg bg-white/5 hover:bg-white/10 ml-4"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-white" />}
                    </button>

                    {mobileMenuOpen && ( 
                        <ul id="dropdownMenu" ref={refUL} className="absolute top-12 right-0 shadow-lg bg-white py-2 rounded-lg  m-4">
                           
                            <Link href="/dashboard/admin/">
                                <li
                                    className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer">
                                   <LayoutDashboard className="w-5 h-5 mr-2 text-[#000080]" />
                                    Dashboard
                                </li>
                            </Link>
                            <li onClick={handleLogout}
                                className="dropdown-item py-2.5 px-5 flex items-center hover:bg-slate-100 text-slate-600 font-medium text-sm cursor-pointer">
                                <LogOut className="w-5 h-5 mr-2 text-red-500" />
                                Déconnexion
                            </li>
                        </ul>
                    )}

                    <button onClick={toggleDrawer(true)} className="relative p-2 cursor-pointer rounded-lg bg-white/5 hover:bg-white/10 ml-4" > <Menu className="w-6 h-6 text-white" /></button>
                        <Drawer open={open} onClose={toggleDrawer(false)}>
                            <div className="px-3 py-4 overflow-y-auto no-scrollbar border rounded-md">
                                <div className="flex items justify-left mb-4">
                                    <span className="text-black text-xs">Menu</span>
                                </div>
                                <nav className="space-y-2">
                                    {navItem.map((item) => (
                                        <Link
                                            href={item.href}
                                            key={item.id}
                                            className="flex items-center p-2 text-sm font-normal text-[#000080] rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="ml-2">{item.name}</span>
                                        </Link>
                                    ))}
                                </nav>

                                <div className="flex items justify-left mb-4 pt-4">
                                    <span className="text-black text-xs">Candidats</span>
                                </div>
                                <nav className="space-y-2 w-full ">
                                    {navJeunes.map((item) => (
                                        <Link
                                            href={item.href}
                                            key={item.id}
                                            className="flex items-center p-2 text-sm font-normal text-[#000080] rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="ml-2">{item.name}</span>
                                        </Link>
                                    ))}
                                </nav>     

                                <div className="flex items justify-left mb-4 pt-4">
                                    <span className="text-black text-xs">Entreprises</span>
                                </div>
                                <nav className="space-y-2 w-full ">
                                    {navEntreprises.map((item) => (
                                        <Link
                                            href={item.href}
                                            key={item.id}
                                            className="flex items-center p-2 text-sm font-normal text-[#000080] rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="ml-2">{item.name}</span>
                                        </Link>
                                    ))}
                                </nav>     

                                <div className="flex items justify-left mb-4 pt-4">
                                    <span className="text-black text-xs">Formations</span>
                                </div>
                                <nav className="space-y-2 w-full ">
                                    {navFormations.map((item) => (
                                        <Link
                                            href={item.href}
                                            key={item.id}
                                            className="flex items-center p-2 text-sm font-normal text-[#000080] rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="ml-2">{item.name}</span>
                                        </Link>
                                    ))}
                                </nav>                            
                       

                                <div className="flex items justify-left mb-4 pt-4">
                                    <span className="text-black text-xs">General</span>
                                </div>
                                <nav className="space-y-2">
                                    {navGeneral.map((item) => (
                                        <Link
                                            href={item.href}
                                            key={item.id}
                                            className="flex items-center p-2 text-sm font-normal text-[#000080] rounded-lg dark:text-white hover:bg-[#F0E68C] hover:text-black dark:hover:bg-gray-700 cursor-pointer"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="ml-2">{item.name}</span>
                                        </Link>

                                    
                                    ))}

                                    <button onClick={handleLogout}
                                        className="flex items-center p-2 text-sm font-normal text-white rounded-lg dark:text-white  cursor-pointer">
                                        
                                        <LogOut className="w-6 h-6 text-red-400" />
                                        <span className="text-red-400 text-sm pl-2">Déconnexion</span>
                                    </button>
                                </nav>

                            </div>
                        </Drawer>
                </div>

            </div>

        </header>
    )
}