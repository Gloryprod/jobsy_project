'use client';

import { User, Building2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function RegisterChoicePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      <Image
        src="/register_bg.jpg"
        alt="Background"
        fill
        className="object-cover brightness-[0.55]"
        priority
      />

      <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-3xl 
                      p-6 sm:p-10 shadow-2xl border border-white/20 
                      text-center w-full max-w-sm mx-4">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Inscription
          </h1>
          <Link href="/" className="mt-2 inline-block">
            <div className="flex items-center justify-center gap-2 mt-2">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-white font-normal">
                Retour à l'accueil
              </span>
            </div>
          </Link> 
        </div>

        <p className="text-[#F0E68C] text-base sm:text-lg font-medium mb-10">
          Choisis ton profil
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Link
            href="/register/candidats"
            className="bg-white/15 hover:bg-white/25 border border-white/30 rounded-3xl p-6 
                       transition-all hover:scale-105"
          >
            <User className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 text-[#F0E68C]" />
            <p className="text-lg sm:text-xl font-bold text-white">Candidat</p>
          </Link>

          <Link
            href="/register/entreprises"
            className="bg-white/15 hover:bg-white/25 border border-white/30 rounded-3xl p-6 
                       transition-all hover:scale-105"
          >
            <Building2 className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 text-[#F0E68C]" />
            <p className="text-lg sm:text-xl font-bold text-white">Entreprise</p>
          </Link>
        </div>

      </div>
    </div>
  );
}
