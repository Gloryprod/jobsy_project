'use client';
import React, { useState } from 'react';
import { 
  Home, Sword, BookOpen, Backpack, Wallet, User, Bell, Settings, Menu, X,
  Hexagon, Heart,
} from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import Link from 'next/link';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useUser();

  const navItems = [
    { id: 'home', name: 'Tableau de bord', icon: Home, link: '/dashboard/candidats'  },
    { id: 'missions', name: 'Missions', icon: Sword, link: '/dashboard/candidats/missions' },
    { id: 'formations', name: 'Formations', icon: BookOpen, link: '/dashboard/candidats/formations' },
    { id: 'inventaire', name: 'Inventaire', icon: Backpack, link: '/dashboard/candidats/inventaire' },
    { id: 'wallet', name: 'Mes Gains', icon: Wallet, link: '/dashboard/candidats/loot' },
  ];

  const NavButton = ({ item }: { item: any }) => (
    <button
      onClick={() => {
        setMobileMenuOpen(false);
      }}
      className={`flex flex-col items-center cursor-pointer gap-1 px-3 py-2 rounded-lg transition ${
         'text-[#F0E68C]' 
      }`}
    >
      <div className="relative">
        <item.icon className="w-6 h-6" />
        {item.badge && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
      <span className="text-xs">{item.name}</span>
    </button>
  );

  return (
    <>
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-72 bg-white/10 backdrop-blur-2xl border-r border-white/20 flex-col">
        <div className="flex-1 overflow-y-auto p-6">
          {/* <div className="mb-10 bg-white/10 rounded-2xl p-5 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F0E68C] to-yellow-300 p-0.5">
                <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold">{user?.nom} {user?.prenom}</p>
                <p className="text-[#F0E68C] text-sm">Rang A • Expert Data</p>
              </div>
            </div>
          </div> */}

          {/* Menu principal */}
          <nav className="space-y-2">
            {navItems.map((item) => (
                <Link href={item.link || '#'} key={item.id}>
                    <button
                        key={item.id}
                        className="w-full cursor-pointer flex items-center gap-4 px-6 py-4 rounded-xl transition-all" 
                    >
                        <item.icon className="w-6 h-6" />
                        <span>{item.name}</span>
                    </button>
                </Link>
            ))}
          </nav>
        </div>

        {/* Loot rapide en bas */}
        <div className="p-6 border-t border-white/10">
          <div className="bg-white/10 rounded-2xl p-5 text-center border border-white/10">
            <p className="text-white/70 text-sm">Solde disponible</p>
            <p className="text-[#F0E68C] text-3xl font-bold mt-2">12 500 F</p>
          </div>
        </div>
      </aside>

      {/* Bottom Navigation Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#000080]/95 backdrop-blur-2xl border-t border-white/20 z-50">
        <nav className="flex justify-around items-center h-16">
          {navItems.slice(0, 5).map((item) => (
            <Link href={item.link || '#'} key={item.id}>
              <NavButton key={item.id} item={item} />
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}