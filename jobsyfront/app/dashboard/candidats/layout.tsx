'use client';

import React, { useState } from 'react';
import Header from '@/components/dashboardCandidat/layout/Header';
import Navigation from '@/components/dashboardCandidat/layout/Navigation';
import { UserProvider } from '@/context/UserProvider';
import { Toaster } from 'react-hot-toast';

export default function Layout({ children }: { children: React.ReactNode }) {
    // showNav gère l'état déplié (true) ou réduit (false) sur desktop
    const [showNav, setShowNav] = useState(true);

    return (
        <UserProvider>
            <div className="flex h-screen overflow-hidden bg-gray-100">
                
                {/* L'aside reste visible en mode réduit (w-20) au lieu de disparaître */}
                <aside 
                    className={`hidden md:flex flex-col fixed left-0 top-16 bottom-0 bg-[#000080]/90 text-white border-r border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out ${
                        showNav ? "w-60" : "w-20"
                    }`}
                >
                    <Navigation showNav={showNav} setShowNav={setShowNav} isMobile={false} />
                </aside>

                {/* Zone de contenu : Marge adaptative fluide (pl-64 ou pl-20) */}
                <div 
                    className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
                        showNav ? "md:pl-60" : "md:pl-20"
                    }`}
                >
                    {/* Header */}
                    <header className="h-16 flex items-center sticky top-0 z-30">
                        <Header /> 
                    </header>

                    {/* Contenu principal */}
                    <main className={`flex-1 overflow-y-auto p-4 md:p-2 no-scrollbar transition-all ${showNav ? "pb-20 md:pb-8" : "pb-20 md:pb-8"}`}>
                        <div className="w-full mx-auto">
                            <Toaster
                                position="top-right"
                                toastOptions={{
                                    duration: 6000,
                                    style: { borderRadius: '10px' },
                                }}
                            />
                            {children}
                        </div>
                    </main>
                </div>

                {/* Navigation Basse Mobile */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <Navigation showNav={showNav} setShowNav={setShowNav} isMobile={true} />
                </div>

            </div>  
        </UserProvider>                     
    );
}