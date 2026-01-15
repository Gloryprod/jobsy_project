'use client';

import React, { useState } from 'react';
import { Sword, MapPin, Clock, Wallet, Filter, Search, Star, Zap, Building2, Calendar } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: string;
  description: string;
  skills: string[];
  urgency: 'normal' | 'urgent' | 'premium';
  applicants: number;
}

export default function MissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  const missions: Mission[] = [
    {
      id: '1',
      title: 'Analyse de données marché pour boutique Cotonou',
      company: 'Boutique Mode Locale',
      location: 'Cotonou (sur site)',
      reward: 5000,
      duration: '4 heures',
      deadline: 'Dans 2 jours',
      description: 'Collecte et analyse simple des ventes mensuelles sur Excel. Formation rapide fournie si besoin.',
      skills: ['Excel', 'Attention aux détails'],
      urgency: 'urgent',
      applicants: 8,
    },
    {
      id: '2',
      title: 'Création de visuels pour réseaux sociaux',
      company: 'Startup FoodTech',
      location: 'Porto-Novo ou à distance',
      reward: 8000,
      duration: '6 heures',
      deadline: 'Dans 5 jours',
      description: 'Réaliser 10 posts Instagram + stories pour lancement nouveau produit.',
      skills: ['Canva', 'Créativité', 'Réseaux sociaux'],
      urgency: 'premium',
      applicants: 3,
    },
    {
      id: '3',
      title: 'Livraison express colis centre-ville',
      company: 'Service Logistique Rapide',
      location: 'Cotonou centre',
      reward: 3000,
      duration: '2 heures',
      deadline: 'Aujourd’hui',
      description: 'Livrer 5 colis dans un rayon de 3 km. Moto ou vélo bienvenu.',
      skills: ['Ponctualité', 'Connaissance routes'],
      urgency: 'urgent',
      applicants: 12,
    },
    // Ajoute plus via API
  ];

  const filteredMissions = missions.filter(mission => {
    if (selectedFilter === 'urgent') return mission.urgency === 'urgent';
    if (selectedFilter === 'premium') return mission.urgency === 'premium';
    if (selectedFilter === 'remote') return mission.location.includes('distance');
    return true;
  }).filter(mission => 
    mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mission.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getUrgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'premium': return 'bg-[#F0E68C]/20 text-[#F0E68C] border-[#F0E68C]/50';
      default: return 'bg-white/10 text-white/70';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#000080] to-black pt-20 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Header page */}
        <header className="text-center space-y-6">
          <h1 className="text-4xl lg:text-5xl font-bold text-white flex items-center justify-center gap-4">
            <Sword className="w-12 h-12 text-[#F0E68C]" />
            Missions Disponibles
          </h1>
          <p className="text-white/70 text-lg max-w-3xl mx-auto">
            Trouve des micro-missions rémunérées près de chez toi. Flexible, rapide et payé en 48h max.
          </p>

          {/* Barre de recherche + Filtres rapides */}
          <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/50" />
              <input
                type="text"
                placeholder="Rechercher par titre, entreprise, compétence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-[#F0E68C]/50"
              />
            </div>

            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <button onClick={() => setSelectedFilter('all')} className={`px-6 py-4 rounded-xl ${selectedFilter === 'all' ? 'bg-[#F0E68C]/30 text-[#F0E68C]' : 'bg-white/10 text-white/70'} hover:bg-[#F0E68C]/20 transition`}>
                Toutes
              </button>
              <button onClick={() => setSelectedFilter('urgent')} className={`px-6 py-4 rounded-xl flex items-center gap-2 ${selectedFilter === 'urgent' ? 'bg-red-500/30 text-red-300' : 'bg-white/10 text-white/70'} hover:bg-red-500/20 transition`}>
                <Zap className="w-5 h-5" /> Urgentes
              </button>
              <button onClick={() => setSelectedFilter('premium')} className={`px-6 py-4 rounded-xl flex items-center gap-2 ${selectedFilter === 'premium' ? 'bg-[#F0E68C]/30 text-[#F0E68C]' : 'bg-white/10 text-white/70'} hover:bg-[#F0E68C]/20 transition`}>
                <Star className="w-5 h-5" /> Premium
              </button>
              <button onClick={() => setSelectedFilter('remote')} className={`px-6 py-4 rounded-xl ${selectedFilter === 'remote' ? 'bg-[#F0E68C]/30 text-[#F0E68C]' : 'bg-white/10 text-white/70'} hover:bg-[#F0E68C]/20 transition`}>
                À distance
              </button>
            </div>
          </div>
        </header>

        {/* Compteur missions */}
        <p className="text-center text-white/80 text-xl">
          {filteredMissions.length} quête{filteredMissions.length > 1 ? 's' : ''} disponible{filteredMissions.length > 1 ? 's' : ''}
        </p>

        {/* Grille missions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMissions.map(mission => (
            <div
              key={mission.id}
              className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 hover:border-[#F0E68C]/40 transition-all cursor-pointer group"
              onClick={() => setSelectedMission(mission)}
            >
              <div className="p-6 space-y-5">
                {/* Tag urgence */}
                {(mission.urgency === 'urgent' || mission.urgency === 'premium') && (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getUrgencyStyle(mission.urgency)}`}>
                    {mission.urgency === 'urgent' && <Zap className="w-4 h-4" />}
                    {mission.urgency === 'premium' && <Star className="w-4 h-4" />}
                    {mission.urgency === 'urgent' ? 'URGENT' : 'PREMIUM'}
                  </div>
                )}

                <h3 className="text-2xl font-bold text-white group-hover:text-[#F0E68C] transition">
                  {mission.title}
                </h3>

                <div className="flex items-center gap-3 text-white/70">
                  <Building2 className="w-5 h-5" />
                  <span>{mission.company}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/70">
                    <MapPin className="w-5 h-5" />
                    <span>{mission.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/70">
                    <Clock className="w-5 h-5" />
                    <span>{mission.duration}</span>
                  </div>
                  <div className="flex items-center gap-3 text-orange-300">
                    <Calendar className="w-5 h-5" />
                    <span>{mission.deadline}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {mission.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Récompense */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-8 h-8 text-[#F0E68C]" />
                    <span className="text-3xl font-black text-[#F0E68C]">{mission.reward.toLocaleString()} F</span>
                  </div>
                  <span className="text-white/60 text-sm">{mission.applicants} candidat(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal détail mission */}
        {selectedMission && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedMission(null)}>
            <div className="bg-white/20 backdrop-blur-2xl rounded-3xl max-w-2xl w-full border border-white/30 p-8" onClick={e => e.stopPropagation()}>
              <h2 className="text-3xl font-bold text-white mb-6">{selectedMission.title}</h2>

              <div className="space-y-6 text-white">
                <p className="text-lg text-white/90">{selectedMission.description}</p>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/60">Entreprise</p>
                    <p className="text-xl font-semibold">{selectedMission.company}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Localisation</p>
                    <p className="text-xl font-semibold">{selectedMission.location}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Durée estimée</p>
                    <p className="text-xl font-semibold">{selectedMission.duration}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Deadline</p>
                    <p className="text-xl font-semibold text-orange-300">{selectedMission.deadline}</p>
                  </div>
                </div>

                <div>
                  <p className="text-white/60 mb-3">Compétences requises</p>
                  <div className="flex flex-wrap gap-3">
                    {selectedMission.skills.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-[#F0E68C]/20 rounded-xl text-[#F0E68C] font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/20">
                  <div className="flex items-center gap-4">
                    <Wallet className="w-10 h-10 text-[#F0E68C]" />
                    <span className="text-4xl font-black text-[#F0E68C]">{selectedMission.reward.toLocaleString()} F CFA</span>
                  </div>

                  <button className="px-10 py-5 bg-[#F0E68C] hover:bg-[#F0E68C]/80 text-[#000080] font-bold text-xl rounded-2xl shadow-xl hover:shadow-[#F0E68C]/50 transition hover:scale-105">
                    POSTULER MAINTENANT
                  </button>
                </div>
              </div>

              <button onClick={() => setSelectedMission(null)} className="mt-6 text-white/60 hover:text-white">
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}