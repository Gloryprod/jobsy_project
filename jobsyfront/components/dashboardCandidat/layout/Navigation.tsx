// 'use client';
// import React, { useState } from 'react';
// import { 
//   Home, Sword, BookOpen, Backpack, Wallet, CheckCheck
// } from 'lucide-react';
// import { useUser } from '@/context/UserProvider';
// import Link from 'next/link';

// export default function Navigation() {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const { user } = useUser();

//   const navItems = [
//     { id: 'home', name: 'Tableau de bord', icon: Home, link: '/dashboard/candidats'  },
//     { id: 'missions', name: 'Missions', icon: Sword, link: '/dashboard/candidats/missions' },
//     { id: 'missions_confirmées', name: 'Offres confirmées', icon: CheckCheck, link: '/dashboard/candidats/missions/en_cours' },
//     { id: 'formations', name: 'Formations', icon: BookOpen, link: '/dashboard/candidats/formations' },
//     { id: 'inventaire', name: 'Inventaire', icon: Backpack, link: '/dashboard/candidats/inventaire' },
//     { id: 'wallet', name: 'Mes Gains', icon: Wallet, link: '/dashboard/candidats/loot' },
//   ];

//   const NavButton = ({ item }: { item: any }) => (
//     <button
//       onClick={() => {
//         setMobileMenuOpen(false);
//       }}
//       className={`flex flex-col items-center cursor-pointer gap-1 px-3 py-2 rounded-lg transition ${
//          'text-white' 
//       }`}
//     >
//       <div className="relative">
//         <item.icon className="w-4 h-4" />
//         {item.badge && (
//           <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
//             {item.badge}
//           </span>
//         )}
//       </div>
//       <span className="text-xs">{item.name}</span>
//     </button>
//   );

//   return (
//     <>
//       <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-[#000080]/90 text-white border border-white/20 flex-col">
//         <div className="flex-1 overflow-y-auto p-6">
//           {/* <div className="mb-10 bg-white/10 rounded-2xl p-5 border border-white/10">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F0E68C] to-yellow-300 p-0.5">
//                 <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
//                   <User className="w-8 h-8 text-white" />
//                 </div>
//               </div>
//               <div>
//                 <p className="text-white font-bold">{user?.nom} {user?.prenom}</p>
//                 <p className="text-[#F0E68C] text-sm">Rang A • Expert Data</p>
//               </div>
//             </div>
//           </div> */}

//           {/* Menu principal */}
//           <nav className="space-y-2">
//             {navItems.map((item) => (
//                 <Link href={item.link || '#'} key={item.id}>
//                     <button
//                         key={item.id}
//                         className="w-full cursor-pointer flex items-center gap-2 px-2 py-3 rounded-xl transition-all" 
//                     >
//                         <item.icon className="w-4 h-4" />
//                         <span>{item.name}</span>
//                     </button>
//                 </Link>
//             ))}
//           </nav>
//         </div>

//         {/* Loot rapide en bas */}
//         <div className="p-6 border-t border-white/10">
//           <div className="bg-white/10 rounded-2xl p-5 text-center border border-white/10">
//             <p className="text-white/70 text-sm">Solde disponible</p>
//             <p className="text-[#F0E68C] text-2xl font-bold mt-2">{user?.candidat?.wallet?.balance|| 0} FCFA</p>
//           </div>
//         </div>
//       </aside>

//       {/* Bottom Navigation Mobile */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#000080]/95 backdrop-blur-2xl border-t border-white/20 z-50">
//         <nav className="flex justify-around items-center h-16">
//           {navItems.slice(0, 5).map((item) => (
//             <Link href={item.link || '#'} key={item.id}>
//               <NavButton key={item.id} item={item} />
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </>
//   );
// }

'use client';

import React from 'react';
import { 
  Home, Sword, BookOpen, Backpack, Wallet, CheckCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationProps {
  showNav: boolean;
  setShowNav: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
}

export default function Navigation({ showNav, setShowNav, isMobile }: NavigationProps) {
  const { user } = useUser();
  const pathname = usePathname();

  const navItems = [
    { id: 'home', name: 'Tableau de bord', icon: Home, link: '/dashboard/candidats' },
    { id: 'missions', name: 'Missions', icon: Sword, link: '/dashboard/candidats/missions' },
    { id: 'missions_confirmées', name: 'Offres confirmées', icon: CheckCheck, link: '/dashboard/candidats/missions/en_cours' },
    { id: 'formations', name: 'Formations', icon: BookOpen, link: '/dashboard/candidats/formations' },
    { id: 'inventaire', name: 'Inventaire', icon: Backpack, link: '/dashboard/candidats/inventaire' },
    { id: 'wallet', name: 'Mes Gains', icon: Wallet, link: '/dashboard/candidats/loot' },
  ];

  // --- RENDU MOBILE (Barre basse) ---
  // Sur mobile, si showNav est false, on ne l'affiche pas du tout
  if (isMobile) {
    if (!showNav) return null;
    return (
      <nav className="flex justify-around items-center h-16 bg-[#000080]/95 backdrop-blur-2xl border-t border-white/10 px-2 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.link;
          return (
            <Link 
              href={item.link} 
              key={item.id}
              className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
                isActive ? 'text-[#F0E68C] scale-105 font-medium' : 'text-white/60'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight truncate max-w-18">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  // --- RENDU DESKTOP (Sidebar latérale) ---
  return (
    <div className="flex flex-col h-full justify-between p-4 w-full overflow-hidden">

      {/* En-tête avec bouton de réduction */}
      <div className={`flex items-center pb-4 ${showNav ? "justify-between pl-2" : "justify-center"}`}>
          {showNav && <span className="text-xs font-black uppercase tracking-wider text-white/50 transition-opacity duration-300">Navigation</span>}

          {/* Bouton Toggle toujours accessible */}
          <button
              onClick={() => setShowNav(!showNav)}
              className="p-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer layout-button"
              title={showNav ? "Réduire le menu" : "Agrandir le menu"}
          >
              {!showNav ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
      </div>    

      {/* Liste des liens */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1">
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.link;
            return (
              <Link 
                href={item.link} 
                key={item.id}
                title={!showNav ? item.name : ""}
                className={`group flex items-center rounded-xl transition-all font-medium text-sm ${
                    !showNav ? "justify-center p-3" : "px-4 py-3 gap-3"
                } ${
                  isActive 
                    ? 'bg-white/10 text-[#F0E68C] shadow-sm border-l-4 border-[#F0E68C]' 
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#F0E68C]' : 'text-white/60 group-hover:text-white'}`} />
                
                <span 
                    className={`transition-all duration-300 origin-left overflow-hidden whitespace-nowrap ${
                        !showNav ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
                    }`}
                >
                    {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bloc Solde / Cagnotte en bas */}
      <div className="pt-4 border-t border-white/10">
        <div className={`rounded-2xl border border-white/5 bg-white/5 p-3 text-center transition-all ${!showNav ? "px-1" : "p-4"}`}>
          {showNav ? (
            <>
              <p className="text-white/60 text-xs font-medium transition-opacity">Solde disponible</p>
              <p className="text-[#F0E68C] text-lg font-black mt-1 tracking-wide truncate">
                {user?.candidat?.wallet?.balance?.toLocaleString() || 0} FCFA
              </p>
            </>
          ) : (
            <p className="text-[#F0E68C] text-xs font-black tracking-tighter truncate">
              {user?.candidat?.wallet?.balance ? `${(user.candidat.wallet.balance / 1000).toFixed(0)}k` : 0}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}