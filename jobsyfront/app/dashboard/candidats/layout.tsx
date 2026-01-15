import Header from '@/components/dashboardCandidat/layout/Header';
import Navigation from '@/components/dashboardCandidat/layout/Navigation';
import { UserProvider } from '@/context/UserProvider';
import { Toaster } from 'react-hot-toast';
export default async function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
        <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black text-white">
            <Header />

            <Navigation />

            <main className="md:ml-72">
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 6000,
                  style: { borderRadius: '10px' },
                }}
              />
                {children}
            </main>
        
        </div>
    </UserProvider>
  )
}
