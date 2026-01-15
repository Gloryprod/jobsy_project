'use client';

import Link from 'next/link';
import { MotionButton } from '@/components/ui/MotionButton';
import { Menu, X, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const desktopNavLinks = [
    { label: "Micro-missions", href: "/missions" },
    { label: "Formations", href: "/formations" },
    { label: "Entreprises", href: "/entreprises" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#000080] font-black text-2xl tracking-tight">
          <Search className="w-8 h-8 text-[#F0E68C]" strokeWidth={3} />
          Jobsy
        </Link>

        {/* === Navigation Desktop === */}
        <nav className="hidden lg:flex items-center gap-8">
          {desktopNavLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#000080] font-medium hover:text-[#F0E68C] transition duration-200"
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center gap-4 ml-8 pl-8 border-l border-gray-200">
            <MotionButton variant="secondary" onClick={() => router.push('/login')}>
              Connexion
            </MotionButton>
            <MotionButton variant="primary" onClick={() => router.push('/register')}>
              Inscription gratuite
            </MotionButton>
          </div>
        </nav>

        {/* === Menu Mobile (Sheet) === */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition">
              <Menu className="w-7 h-7 text-[#000080]" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full max-w-xs bg-white">
            <div className="flex flex-col h-full">

              {/* En-tête du drawer */}
              <div className="flex items-center justify-between pt-6 pb-8 px-6 border-b">
                <div className="flex items-center gap-2">
                  <Search className="w-8 h-8 text-[#F0E68C]" />
                  <span className="text-2xl font-black text-[#000080]">Jobsy</span>
                </div>
                <SheetClose className="p-2 rounded-lg hover:bg-gray-100">
                  <X className="w-6 h-6" />
                </SheetClose>
              </div>

              {/* Liens mobiles */}
              <nav className="flex-1 px-6 py-8 space-y-5">
                {desktopNavLinks.map((link) => (
                  <SheetClose asChild key={link.label}>
                    <Link
                      href={link.href}
                      className="block text-xl font-medium text-[#000080] hover:text-[#F0E68C] transition py-3 border-b border-gray-100 last:border-0"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}

                <div className="pt-8 space-y-4">
                  <Link href="/register">
                    <MotionButton 
                      variant="primary" 
                      className="w-full text-lg py-6 cursor-pointer" 
                      onClick={() => setOpen(false)}
                    >
                      Inscription gratuite
                    </MotionButton>
                  </Link>

                  <Link href="/login">
                    <MotionButton 
                      variant="secondary" 
                      className="w-full text-lg py-6 cursor-pointer" 
                      onClick={() => setOpen(false)}
                    >
                      Connexion
                    </MotionButton>
                  </Link>
                </div>
              </nav>

            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}