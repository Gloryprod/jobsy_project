'use client'
import Header from "@/components/dashboardEntreprise/layout/Header";
import Navigation from "@/components/dashboardEntreprise/layout/Navigation";
import { UserProvider } from "@/context/UserProvider";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient();

export default function layout({ children }: { children: React.ReactNode }) {
    return (
        <QueryClientProvider client={queryClient}>
            <UserProvider>

                <div className="flex h-screen overflow-hidden bg-gray-100">
                    <aside className="hidden md:flex w-64 flex-col">
                        <Navigation />
                    </aside>

                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                        
                        <header className="h-16 flex items-center px-8 sticky top-0 z-10">
                            <Header /> 
                        </header>

                        <main className="flex-1 overflow-y-auto p-8 no-scrollbar">
                            <div className="max-w-5xl mx-auto">
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
    )
}