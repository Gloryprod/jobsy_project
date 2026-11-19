'use client';

import React, { useState } from 'react';
import Header from '@/components/dashboardCandidat/layout/Header';
import Navigation, { BarreDuBas } from '@/components/dashboardCandidat/layout/Navigation';
import { UserProvider } from '@/context/UserProvider';
import { Toaster } from 'react-hot-toast';

// En-tête, barre latérale (ordinateur) et barre du bas (téléphone) de l'espace candidat, refaits au lot 8a
export default function Layout({ children }: { children: React.ReactNode }) {
    const [reduit, setReduit] = useState(false);

    return (
        <UserProvider>
            <div className="flex h-screen overflow-hidden bg-gray-100">
                {/* Lien d'évitement : au clavier, il mène au contenu sans traverser l'en-tête et la navigation */}
                <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-[#F0E68C] focus:px-4 focus:py-2.5 focus:font-bold focus:text-black">
                    Aller au contenu
                </a>
                <aside
                    className={`hidden md:flex flex-col fixed left-0 top-16 bottom-0 bg-[#000080]/90 text-white border-r border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out motion-reduce:transition-none ${
                        reduit ? "w-20" : "w-60"
                    }`}
                >
                    <Navigation reduit={reduit} setReduit={setReduit} />
                </aside>

                <div
                    className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out motion-reduce:transition-none ${
                        reduit ? "md:pl-20" : "md:pl-60"
                    }`}
                >
                    {/* L'en-tête est fixe et porte lui-même la balise header : ce bloc réserve sa hauteur */}
                    <div className="h-16 shrink-0">
                        <Header />
                    </div>

                    {/* Sur téléphone, la marge du bas laisse la place à la barre de navigation */}
                    <main id="contenu" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-2 pb-24 md:pb-8 no-scrollbar focus:outline-none">
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

                <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <BarreDuBas />
                </div>
            </div>
        </UserProvider>
    );
}
