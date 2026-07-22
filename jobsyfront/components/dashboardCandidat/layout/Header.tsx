// 'use client';

// import React, { useState, useRef } from 'react';
// import { Bell, Menu, X, Wallet, User, LogOut, Search, ChevronDown } from 'lucide-react';
// import { useUser } from '@/context/UserProvider';
// import { useLogout } from '@/lib/logout';
// import Link from 'next/link';
// import useOnClickOutside from '@/hooks/useOnClickOutside';
// import { NotificationBell } from '@/components/dashboardCandidat/notifications/NotificationBell';

// export default function Header() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [openNotifications, setOpenNotifications] = useState(false);
//   const ref = useRef<HTMLDivElement>(null!);
//   const { user } = useUser();
//   const { handleLogout } = useLogout();

//   useOnClickOutside(ref, () => setProfileDropdownOpen(false));
//   useOnClickOutside(ref, () => setMobileMenuOpen(false));

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 bg-[#000080]/90 backdrop-blur-lg border-b border-white/10">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <div className="flex items-center space-x-3">
//               <Search className="w-8 h-8 text-[#F0E68C]" strokeWidth={3} />
//               <span className="text-white text-xl font-bold">Jobsy</span>
//             </div>

//             {/* Desktop : Notifications + Profil avec Dropdown */}
//             <div className="hidden md:flex items-center space-x-6">   
//               {/* Notifications */}
//               <button className="relative cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
//                 <NotificationBell />
//               </button>

//               {/* Bloc Profil cliquable */}
//               <div className="relative">
//                 <button
//                   onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//                   className="flex cursor-pointer items-center space-x-3 rounded-xl hover:bg-white/10 px-4 py-2 transition"
//                 >
//                   <div className="relative">
//                     <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
//                       <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
//                         <User className="w-7 h-7 text-white" />
//                       </div>
//                     </div>
//                     <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#000080]"></div>
//                   </div>
//                   <div className="text-left">
//                     <p className="text-white font-medium">{user?.nom} {user?.prenom}</p>
//                     <p className="text-[#F0E68C] text-xs">Espace Candidat</p>
//                   </div>
//                   <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
//                 </button>

//                 {/* Dropdown Desktop */}
//                 {profileDropdownOpen && (
//                   <div ref={ref} className="absolute right-0 mt-3 w-56 bg-[#000080]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
//                     <div className="py-2" aria-labelledby="dropdownInformationButton" >
//                       <Link href="/dashboard/candidats/profile" className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition">
//                         <User className="w-5 h-5 text-white" />
//                         <span className="text-white">Mon profil</span>
//                       </Link>

//                       <button
//                         onClick={() => {
//                           setProfileDropdownOpen(false);
//                           handleLogout();
//                         }}
//                         className="w-full cursor-pointer flex items-center gap-3 px-5 py-3 hover:bg-red-600/20 transition"
//                       >
//                         <LogOut className="w-5 h-5 text-red-400" />
//                         <span className="text-white font-medium">Déconnexion</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Mobile */}
//             <div className="flex md:hidden items-center space-x-4">
//               <button className="relative cursor-pointer p-2 rounded-lg bg-white/5">
//                 <NotificationBell />
//               </button>

//               {/* <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
//                 <Wallet className="w-4 h-4 text-[#F0E68C]" />
//                 <span className="text-[#F0E68C] font-bold text-sm">12.5k</span>
//               </div> */}

//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="p-2 cursor-pointer rounded-lg bg-white/5"
//               >
//                 {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Menu Mobile */}
//         {mobileMenuOpen && (
//           <div ref={ref} className="md:hidden bg-[#000080]/95 backdrop-blur-lg border-t border-white/10">
//             <div className="px-6 py-6 space-y-6">
//               <div className="flex items-center space-x-4 pb-4 border-b border-white/10">
//                 <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
//                   <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
//                     <User className="w-9 h-9 text-white" />
//                   </div>
//                 </div>
//                 <div>
//                   <p className="text-white font-semibold text-lg">{user?.nom} {user?.prenom}</p>
//                   <p className="text-[#F0E68C]">Espace Candidat</p>
//                 </div>
//               </div>

//               <Link href="/dashboard/candidats/profile" className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition">
//                 <User className="w-5 h-5 text-white" />
//                 <span className="text-white font-bold">Mon profil</span>
//               </Link>

//               <button
//                 onClick={() => {
//                   setMobileMenuOpen(false);
//                   handleLogout();
//                 }}
//                 className="w-full cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-all border border-red-500/30"
//               >
//                 <LogOut className="w-6 h-6 text-red-400" />
//                 <span className="text-white font-semibold text-lg">Se déconnecter</span>
//               </button>
//             </div>
//           </div>
//         )}
//       </header>

//       {/* Compensation hauteur */}
//       <div className="h-16"></div>
//     </>
//   );
// }

'use client';

import React, { useState, useRef } from 'react';
import { Menu, X, User, LogOut, Briefcase, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { useLogout } from '@/lib/logout';
import Link from 'next/link';
import useOnClickOutside from '@/hooks/useOnClickOutside';
import { NotificationBell } from '@/components/dashboardCandidat/notifications/NotificationBell';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null!);
  const mobileMenuRef = useRef<HTMLDivElement>(null!);
  
  const { user } = useUser();
  const { handleLogout } = useLogout();

  // Gestion indépendante des clics extérieurs
  useOnClickOutside(profileRef, () => setProfileDropdownOpen(false));
  useOnClickOutside(mobileMenuRef, () => setMobileMenuOpen(false));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000080]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/dashboard/candidats" className="flex items-center space-x-2.5 group">
                <div className="bg-white/10 p-2 rounded-xl group-hover:bg-white/20 transition-all">
                    <Briefcase className="w-5 h-5 text-white animate-pulse" strokeWidth={2.5} />
                </div>
                <span className="text-white text-xl font-black tracking-tight">Jobsy</span>
            </Link>

            {/* --- VERSION DESKTOP --- */}
            <div className="hidden md:flex items-center space-x-6">   
              {/* Notifications */}
              <button className="relative cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <NotificationBell />
              </button>

              {/* Bloc Profil avec Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex cursor-pointer items-center space-x-3 rounded-xl hover:bg-white/10 px-4 py-2 transition"
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                      <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#000080]"></div>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm leading-tight">{user?.nom} {user?.prenom}</p>
                    <p className="text-[#F0E68C] text-xs">Espace Candidat</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/70 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Desktop */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#000080]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden z-50">
                    <div className="py-1.5">
                      <Link 
                        href="/dashboard/candidats/profile" 
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 text-white text-sm font-medium transition"
                      >
                        <User className="w-4 h-4 text-white/70" />
                        <span>Mon profil</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full cursor-pointer flex items-center gap-3 px-5 py-3 hover:bg-red-600/20 text-red-400 text-sm font-medium transition border-t border-white/5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- VERSION MOBILE --- */}
            <div className="flex md:hidden items-center space-x-3">
              <button className="relative cursor-pointer p-2 rounded-xl bg-white/5">
                <NotificationBell />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 cursor-pointer rounded-xl bg-white/5 text-white hover:bg-white/10 transition"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Déroulant Mobile */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden bg-[#000080]/95 backdrop-blur-lg border-t border-white/10 shadow-xl">
            <div className="px-6 py-6 space-y-5">
              {/* Infos utilisateur mobile */}
              <div className="flex items-center space-x-4 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                  <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                    <User className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-base leading-tight">{user?.nom} {user?.prenom}</p>
                  <p className="text-[#F0E68C] text-xs mt-0.5">Espace Candidat</p>
                </div>
              </div>

              {/* Liens internes mobile */}
              <div className="space-y-1">
                <Link 
                  href="/dashboard/candidats/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white font-medium text-sm transition"
                >
                  <User className="w-4 h-4 text-white/60" />
                  <span>Mon profil</span>
                </Link>
              </div>

              {/* Bouton déconnexion mobile */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full cursor-pointer flex items-center justify-center gap-2.5 px-5 py-3.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-xl transition-all border border-red-500/20 font-medium text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Compensation de la hauteur fixe du Header */}
      <div className="h-16"></div>
    </>
  );
}