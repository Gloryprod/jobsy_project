'use client';

import React from 'react';
import { Hexagon, Heart, Backpack, Sword, Star, Rocket} from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import useSWR from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';

const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function DashboardHome() {
  const { user, loading  } = useUser();
  const { data, error, isLoading } = useSWR('/candidat/profile-elements', fetcher);

  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || isLoading) {
    return (<div className="flex justify-center items-center h-screen">
                <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#F0E68C"
                ariaLabel="three-dots-loading"
                wrapperStyle={{ margin: '20px' }}
                wrapperClass="custom-loader"
                visible={true}
                />
            </div>);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-red-400 text-xl">Erreur: {error?.message || 'Une erreur est survenue lors du chargement du profil.'}</p>
        </div>
      </div>
    );
  }
 
  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-10">

        {/* ==================== PERSONNAGE ACTIF ==================== */}
        <section className="bg-white/15 backdrop-blur-2xl rounded-3xl overflow-hidden">
          <div className="p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-16">

              {/* Infos principales */}
              <div className="flex flex-col md:flex-row items-center gap-8 w-full">
                <div className="relative shrink-0">
                  <Hexagon className="w-28 h-28 lg:w-32 lg:h-32 stroke-white/40" style={{ fill: data.data.rank.code_hexa }}/>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-black text-4xl lg:text-5xl">
                    {data.data.rank.rank}
                  </span>
                </div>

                <div className="flex-1 w-full space-y-4 text-left md:text-left sm:text-center lg:text-left">
                  <div>
                    <p className="text-[#F0E68C] uppercase tracking-wider text-sm font-bold">Bienvenue, {user?.prenom} !</p>
                    <p className="text-white text-2xl lg:text-3xl font-semibold">{data.data.domaine_competence}</p>
                  </div>

                  {/* Section des Jauges (Points & Énergie) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    
                    {/* Barre XP / Points */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Star size={16} fill="currentColor" />
                          <span className="text-xs font-bold uppercase">Points (XP)</span>
                        </div>
                        <span className="text-xs text-white/70 font-mono">{ data.data.rank.points }</span>
                      </div>
                      <div className="h-3 w-full bg-black/40 rounded-full border border-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-300 transition-all duration-1000"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>

                    {/* Barre Énergie */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center px-1">
                        <div className="flex items-center gap-2 text-blue-400">
                          <Heart size={16} fill="currentColor" />
                          <span className="text-xs font-bold uppercase">Énergie</span>
                        </div>
                        <span className="text-xs text-white/70 font-mono">40%</span>
                      </div>
                      <div className="h-3 w-full bg-black/40 rounded-full border border-white/10 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                          style={{ width: '40%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
             </div>
          </div>
        </section>


        {/* ==================== STATISTIQUES DE CARRIÈRE ==================== */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card: Missions Accomplies */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-105 cursor-default">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Sword className="text-green-400 w-8 h-8" />
              </div>
              <div>
                <p className="text-white/60 text-sm uppercase font-bold tracking-tight">Missions Accomplies</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{data?.data?.missions_done || 12}</span>
                  <span className="text-green-400 text-xs font-bold">+2 cette semaine</span>
                </div>
              </div>
            </div>

            {/* Card: Missions en Cours */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-105 cursor-default">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Rocket className="text-blue-400 w-8 h-8" />
              </div>
              <div>
                <p className="text-white/60 text-sm uppercase font-bold tracking-tight">En cours</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{data?.data?.missions_active || 3}</span>
                  <span className="text-blue-400 text-xs font-bold font-mono italic">Progression active</span>
                </div>
              </div>
            </div>

            {/* Card: Formations */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-5 transition-transform hover:scale-105 cursor-default">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Backpack className="text-purple-400 w-8 h-8" />
              </div>
              <div>
                <p className="text-white/60 text-sm uppercase font-bold tracking-tight">Formations suivies</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{data?.data?.trainings_completed || 7}</span>
                  <span className="text-purple-400 text-xs font-bold">Compétences débloquées</span>
                </div>
              </div>
            </div>

          </section>


          <section className="mt-10">
            {/* Barre d'onglets stylisée */}
            <Box sx={{ borderBottom: 1, borderColor: 'white/10', mb: 3 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                textColor="inherit"
                TabIndicatorProps={{ style: { backgroundColor: '#F0E68C', height: '3px' } }}
                sx={{
                  '& .MuiTab-root': { 
                    color: 'rgba(255,255,255,0.5)', 
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1rem'
                  },
                  '& .Mui-selected': { color: '#F0E68C !important' }
                }}
              >
                <Tab label="Missions en cours" />
                <Tab label="Formations suivies" />
                <Tab label="Recommandations" />
              </Tabs>
            </Box>

            {/* Contenu des onglets */}
            <div className="min-h-[300px]">
              {tabValue === 0 && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-500">
                  {/* Exemple de ligne de mission */}
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-xl flex justify-between items-center hover:bg-white/10 transition-colors">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                          <Rocket size={24} />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">Développeur Frontend Next.js</h4>
                          <p className="text-white/50 text-sm">Entreprise TechX • Lancé il y a 2 jours</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border border-yellow-500/20 uppercase">
                          En attente
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {tabValue === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                  {/* Exemple de carte formation */}
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                          <Backpack size={32} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-bold">Maîtriser TypeScript 2026</h4>
                        <div className="w-full bg-white/10 h-2 rounded-full mt-3">
                          <div className="bg-purple-500 h-full rounded-full" style={{ width: '85%' }}></div>
                        </div>
                        <p className="text-xs text-white/40 mt-2 italic">85% complété - +400 XP à la clé</p>
                    </div>
                  </div>
                </div>
              )}

              {tabValue === 2 && (
                <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/20">
                  <Star className="mx-auto text-[#F0E68C] mb-4" size={40} />
                  <h3 className="text-white font-bold">Nouvelles missions disponibles !</h3>
                  <p className="text-white/50 max-w-sm mx-auto mt-2">Notre IA a détecté 3 nouvelles missions qui correspondent à votre rang {data.data.rank.rank}.</p>
                  <button className="mt-6 px-6 py-2 bg-[#F0E68C] text-black font-bold rounded-lg hover:bg-yellow-200 transition-colors">
                    Découvrir les quêtes
                  </button>
                </div>
              )}
            </div>
        </section>

      </div>
    </div>
  );
}

