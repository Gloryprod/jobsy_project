'use client';

import React, { useState, useRef } from 'react';
import { Bell, Menu, X, Wallet, User, LogOut, Search, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import { useLogout } from '@/lib/logout';
import Link from 'next/link';
import useOnClickOutside from '@/hooks/useOnClickOutside';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);
  const { user } = useUser();
  const { handleLogout } = useLogout();

  useOnClickOutside(ref, () => setProfileDropdownOpen(false));
  useOnClickOutside(ref, () => setMobileMenuOpen(false));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#000080]/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Search className="w-8 h-8 text-[#F0E68C]" strokeWidth={3} />
              <span className="text-white text-xl font-bold">Jobsy</span>
            </div>

            {/* Desktop : Notifications + Profil avec Dropdown */}
            <div className="hidden md:flex items-center space-x-6">   
              {/* Notifications */}
              <button className="relative cursor-pointer p-3 rounded-xl bg-white/5 hover:bg-white/10 transition">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              </button>

              {/* Bloc Profil cliquable */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex cursor-pointer items-center space-x-3 rounded-xl hover:bg-white/10 px-4 py-2 transition"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                      <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-[#000080]"></div>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">{user?.nom} {user?.prenom}</p>
                    <p className="text-[#F0E68C] text-xs">Espace Candidat</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-white/70 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Desktop */}
                {profileDropdownOpen && (
                  <div ref={ref} className="absolute right-0 mt-3 w-56 bg-[#000080]/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                    <div className="py-2" aria-labelledby="dropdownInformationButton" >
                      <Link href="/dashboard/candidats/profile" className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition">
                        <User className="w-5 h-5 text-white" />
                        <span className="text-white">Mon profil</span>
                      </Link>

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full cursor-pointer flex items-center gap-3 px-5 py-3 hover:bg-red-600/20 transition"
                      >
                        <LogOut className="w-5 h-5 text-red-400" />
                        <span className="text-white font-medium">Déconnexion</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center space-x-4">
              <button className="relative cursor-pointer p-2 rounded-lg bg-white/5">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
                <Wallet className="w-4 h-4 text-[#F0E68C]" />
                <span className="text-[#F0E68C] font-bold text-sm">12.5k</span>
              </div> */}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 cursor-pointer rounded-lg bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div ref={ref} className="md:hidden bg-[#000080]/95 backdrop-blur-lg border-t border-white/10">
            <div className="px-6 py-6 space-y-6">
              <div className="flex items-center space-x-4 pb-4 border-b border-white/10">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0E68C] to-yellow-400 p-0.5">
                  <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center">
                    <User className="w-9 h-9 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{user?.nom} {user?.prenom}</p>
                  <p className="text-[#F0E68C]">Espace Candidat</p>
                </div>
              </div>

              <Link href="/dashboard/candidats/profile" className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition">
                <User className="w-5 h-5 text-white" />
                <span className="text-white font-bold">Mon profil</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full cursor-pointer flex items-center justify-center gap-3 px-6 py-4 bg-red-600/20 hover:bg-red-600/30 rounded-xl transition-all border border-red-500/30"
              >
                <LogOut className="w-6 h-6 text-red-400" />
                <span className="text-white font-semibold text-lg">Se déconnecter</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Compensation hauteur */}
      <div className="h-16"></div>
    </>
  );
}