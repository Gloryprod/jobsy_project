'use client';
import Header from '@/components/Home/layout/Header';
import Footer from '@/components/Home/layout/Footer';
import Link from 'next/link';
// import Image from 'next/image';
import { MotionButton } from '@/components/ui/MotionButton';
import { Zap, Clock, Banknote, MapPin, Filter, Search, Calendar } from 'lucide-react';
import api from '@/lib/api';
import useSWR from 'swr';
import { Mission } from '../dashboard/candidats/missions/page';
import { useState, useMemo } from 'react';

// const missions = [
//   { id: 1, title: "Livraison colis à Cotonou", entreprise: "Jumia Bénin", prix: "8 000 FCFA", durée: "2h", lieu: "Cotonou", type: "Livraison" },
//   { id: 2, title: "Enquête de satisfaction clientèle", entreprise: "MTN Bénin", prix: "15 000 FCFA", durée: "3h", lieu: "Cotonou / Porto-Novo", type: "Terrain" },
//   { id: 3, title: "Saisie de données Excel", entreprise: "Cabinet Comptable Fidjrossè", prix: "12 000 FCFA", durée: "4h", lieu: "À domicile", type: "Digital" },
//   { id: 4, title: "Aide vente boutique Ganhi", entreprise: "Boutique Mode & Style", prix: "10 000 FCFA", durée: "5h", lieu: "Cotonou", type: "Commerce" },
//   { id: 5, title: "Distribution flyers Dantokpa", entreprise: "Moov Africa", prix: "9 000 FCFA", durée: "3h", lieu: "Cotonou", type: "Marketing" },
//   { id: 6, title: "Photographie événementielle", entreprise: "Agence Événementiel", prix: "25 000 FCFA", durée: "4h", lieu: "Cotonou", type: "Créatif" },
// ];
const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function MicroMissionsPage() {
  const { data: missions = [], isLoading, error } = useSWR<Mission[]>('/public_missions', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<string>('all');

  const filteredMissions = useMemo(() => {
    return missions.filter(mission => {
      const matchesSearch = 
        mission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mission.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesContract = selectedContract === 'all' || mission.type_contrat === selectedContract;

      return matchesSearch && matchesContract;
    });
  }, [missions, searchTerm, selectedContract]);

  const getContractStyle = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CDD': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Mission Ponctuelle': return 'bg-blue-50 text-[#000080] border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <>
      <Header />

      {/* Hero de la page */}
      <section className="bg-[#FAF9F0] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#000080] mb-6">
            Opportunités<br />
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 max-w-4xl mx-auto">
            Réalises une mission et rends ton profil crédible.
          </p>

          {/* Search Bar RPG Style */}
          <div className="max-w-4xl mx-auto mt-8 relative">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Rechercher une compétence, un métier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-6 bg-white rounded-2xl border-2 border-slate-100 shadow-xl shadow-slate-200/40 focus:outline-none focus:border-[#000080]/20 transition-all text-slate-700 font-bold placeholder:text-slate-300"
            />
          </div>
          
          {/* Filtres de Contrat */}
          <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['all', 'CDI', 'CDD', 'Mission Ponctuelle'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedContract(type)}
                className={`cursor-pointer px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedContract === type 
                  ? 'bg-[#000080] text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-[#000080]'
                }`}
              >
                {type === 'all' ? 'Toutes les missions' : type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des missions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMissions.map((mission) => (
              <div
                key={mission.id}
                className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl hover:border-[#000080]/20 transition-all duration-300 overflow-hidden"
              >
                <div className="h-48 bg-gray-200 border-2 border-dashed rounded-t-3xl relative">
                  {/* Image placeholder – remplace par vraie photo plus tard */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <Zap className="w-16 h-16" />
                  </div>
                </div>

                <div className="p-6">
                  <div className='flex items-start'>
                    <span className={` px-2 py-1 mb-4 rounded-full text-[9px] font-black uppercase border ${getContractStyle(mission.type_contrat)}`}>
                      {mission.type_contrat}
                    </span>
                  </div>
                
                  <h3 className="text-xl font-bold text-[#000080] mb-2">{mission.title}</h3>
                  <p className="text-gray-600 mb-4">{mission.entreprise.nom_entreprise}</p>                  

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(mission.deadline).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {mission.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-black text-[#000080]">{mission.reward}</p>
                    </div>

                    <Link href={`/login`}>
                      <MotionButton variant="primary">
                        Postuler
                      </MotionButton>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/login">
              <MotionButton variant="primary" className="cursor-pointer px-12 py-6 text-xl">
                Voir plus de missions →
              </MotionButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats rapides */}
      <section className="bg-[#000080] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">+680</p>
            <p className="text-lg">Missions disponibles</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">92%</p>
            <p className="text-lg">Payées en 24h</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">2 400+</p>
            <p className="text-lg">Jeunes actifs</p>
          </div>
          <div>
            <p className="text-4xl font-black text-[#F0E68C]">380+</p>
            <p className="text-lg">Entreprises</p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-[#000080] text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Prêt à te lancer avec Jobsy ?
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Link href="/login">
              <MotionButton variant="secondary" className="cursor-pointer text-xl px-12 py-6 border-2 border-white text-white hover:bg-white hover:text-[#000080]">
                Commencer ma première mission
              </MotionButton>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}