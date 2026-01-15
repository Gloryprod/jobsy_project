import React from 'react';
import { Hexagon, Heart, User } from 'lucide-react';

export default function ProfileSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 mb-8">
      <div className="max-w-5xl mx-auto">
        {/* Carte principale - Personnage Actif */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 lg:gap-12">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#F0E68C] to-yellow-300 p-1.5 shadow-2xl shadow-[#F0E68C]/40">
                  <div className="w-full h-full rounded-full bg-[#000080] flex items-center justify-center overflow-hidden border-4 border-white/20">
                    <User className="w-20 h-20 sm:w-28 sm:h-28 text-white" />
                  </div>
                </div>
                {/* Indicateur en ligne */}
                <div className="absolute bottom-3 right-3 w-9 h-9 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Infos principales */}
              <div className="flex-1 text-center sm:text-left space-y-6">
                <div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000080]">
                    Krypton X7
                  </h2>
                  <p className="text-[#000080]/80 text-xl lg:text-2xl mt-2 font-semibold">
                    Expert en Data
                  </p>
                </div>

                {/* Rang */}
                <div className="flex items-center justify-center sm:justify-start gap-6">
                  <div className="relative">
                    <Hexagon className="w-24 h-24 text-[#000080] fill-[#000080] stroke-white/40 drop-shadow-lg" />
                    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-3xl drop-shadow-2xl">
                      A
                    </span>
                  </div>
                  <div>
                    <p className="text-[#000080]/90 text-sm uppercase tracking-wider">Rang</p>
                    <p className="text-[#000080] text-xl lg:text-2xl font-bold">
                      Master / Ingénieur
                    </p>
                  </div>
                </div>

                {/* Barre XP */}
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#000080] text-lg font-bold">NIVEAU 42</span>
                    <span className="text-[#F0E68C] text-lg font-bold">68/100 (68%)</span>
                  </div>
                  <div className="w-full bg-gray-200/20 rounded-full h-7 overflow-hidden border border-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-[#F0E68C] to-yellow-300 rounded-full shadow-inner shadow-[#F0E68C]/50 flex items-center justify-end pr-4"
                      style={{ width: '68%' }}
                    >
                      <span className="text-[#000080] font-bold text-sm">+68 XP</span>
                    </div>
                  </div>
                </div>

                {/* Barre Santé / Fiabilité */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#000080] text-lg font-bold flex items-center gap-3">
                      <Heart className="w-6 h-6 text-red-400 fill-red-400" />
                      SANTÉ / FIABILITÉ (Risque Burnout)
                    </span>
                    <span className="text-green-400 text-lg font-bold">85/100 (85%)</span>
                  </div>
                  <div className="w-full bg-gray-200/20 rounded-full h-7 overflow-hidden border border-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-inner shadow-green-500/50 flex items-center justify-end pr-4"
                      style={{ width: '85%' }}
                    >
                      <span className="text-white font-bold text-sm">Excellent</span>
                    </div>
                  </div>
                </div>

                {/* Bouton */}
                <div className="pt-4">
                  <button className="px-10 py-4 bg-[#000080]/90 hover:bg-white/30 text-white font-bold text-lg rounded-2xl border-2 border-white/40 backdrop-blur-sm shadow-xl hover:shadow-[#F0E68C]/40 transition-all duration-300 hover:scale-105">
                    ACCÉDER À LA FICHE DÉTAILLÉE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}