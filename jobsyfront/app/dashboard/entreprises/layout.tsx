'use client';
import { useState } from "react";
import Header from "@/components/dashboardEntreprise/layout/Header";
import Navigation from "@/components/dashboardEntreprise/layout/Navigation";
import { UserProvider } from "@/context/UserProvider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <div className="flex h-screen overflow-hidden bg-gray-100">
                    {/* Lien d'évitement : au clavier, il mène au contenu sans traverser l'en-tête et la navigation */}
                    <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-lg focus:bg-[#F0E68C] focus:px-4 focus:py-2.5 focus:font-bold focus:text-black">
                        Aller au contenu
                    </a>
                    
                    {/* L'aside englobant s'adapte en largeur de manière fluide */}
                    <aside 
                        className={`hidden md:flex flex-col fixed left-0 top-18 bottom-0 bg-[#000080]/90 border-r border-white/10 shadow-2xl z-40 transition-all duration-300 ease-in-out ${
                            isCollapsed ? "w-20" : "w-60"
                        }`}
                    >
                        <Navigation isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
                    </aside>

                    {/* Zone de contenu : On ajoute une marge à gauche dynamique pour compenser la position fixed de l'aside */}
                    <div 
                        className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ease-in-out ${
                            isCollapsed ? "md:pl-20" : "md:pl-60"
                        }`}
                    >
                        {/* L'en-tête est fixe et porte lui-même la balise header : ce bloc réserve sa hauteur */}
                        <div className="h-18 shrink-0">
                            <Header />
                        </div>

                        {/* Contenu principal */}
                        <main id="contenu" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar focus:outline-none">
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

                </div>  
            </UserProvider>  
        </QueryClientProvider>                    
    );
}