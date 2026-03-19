'use client';

import React, { useState } from 'react';
import { Hexagon, Heart, Backpack, Sword, Star, Rocket, ShieldCheck, Trophy } from 'lucide-react';
import { useUser } from '@/context/UserProvider';
import useSWR from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import { Box, Tabs, Tab } from '@mui/material';
import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
import { getExpirationText } from '@/components/GetExpirationText';
import Link from 'next/link';

const fetcher = (url: string) => api.get(url).then(res => res.data);
const fetcher1 = (url: string) => api.get(url).then(res => res.data.data);

type Mission = {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: string;
  description: string;
  skills: string[]; 
  urgency: 'normal' | 'urgent' | 'premium';
  category: string;
  applicants: number;
  type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  active: boolean;
  test_severity: 'light' | 'standard' | 'expert';
  min_rank_required: string;
}

interface Application{
    id: number;
    candidat_id: number;
    mission: Mission;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: Timestamp;
    completed_at: Timestamp;
    updated_at: Timestamp;
}

export default function DashboardHome() {
  const { user, loading } = useUser();
  const { data, error, isLoading } = useSWR('/candidat/profile-elements', fetcher);
  const [tabValue, setTabValue] = useState(0);
  const candidatId = user?.candidat?.id;

  const { data : applications, error: applicationsError, isLoading: applicationsLoading } = useSWR<Application[]>(`/missions/${candidatId}/myapplications`, fetcher1);


  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading || isLoading || applicationsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
      </div>
    );
  }

  if (error || applicationsError) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-red-100">
        <p className="text-red-500 font-bold">Erreur de chargement des données de quête.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-2 w-full bg-linear-to-r from-[#000080] to-[#4B0082]" />
        
        <div className="p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            {/* Avatar / Rank Hexagon */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#F0E68C] to-[#000080] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative shrink-0 flex items-center justify-center">
                <Hexagon className="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-md" fill={data.data.rank.code_hexa || '#000080'} stroke="white" strokeWidth={1} />
                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-3xl lg:text-4xl drop-shadow-sm">
                  {data.data.rank.rank}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-black text-[#000080] mb-1">
                  {user?.prenom} <span className="text-slate-400 font-medium">| {data.data.domaine_competence}</span>
                </h1>
                <p className="text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2 italic">
                  <ShieldCheck size={18} className="text-[#F0E68C]" /> Aventurier de niveau {data.data.rank.rank}
                </p>
              </div>

              {/* Jauges Style RPG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* XP Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1"><Star size={14} className="fill-[#F0E68C] text-[#F0E68C]" /> Expérience</span>
                    <span>{data.data.rank.points} XP</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
                    <div 
                      className="h-full bg-linear-to-r from-[#F0E68C] to-yellow-500 rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>

                {/* Energy Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1"><Heart size={14} className="fill-red-500 text-red-500" /> Vitalité</span>
                    <span>80%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
                    <div 
                      className="h-full bg-linear-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: '80%' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CARTES DE STATISTIQUES ==================== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Missions Finies', val: data?.data?.missions_done || 12, icon: Sword, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Quêtes en cours', val: data?.data?.missions_active || 3, icon: Rocket, color: 'text-[#000080]', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Sortilèges Appris', val: data?.data?.trainings_completed || 7, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white ${stat.border} border-2 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{stat.label}</p>
                <p className="text-2xl font-black text-slate-800">{stat.val}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ==================== ONGLETS DE CONTENU ==================== */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': { 
                color: '#94a3b8', 
                fontWeight: '800',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.1em'
              },
              '& .Mui-selected': { color: '#000080 !important' },
              '& .MuiTabs-indicator': { backgroundColor: '#000080', height: 3 }
            }}
          >
            <Tab label="Journal de Quêtes" />
            <Tab label="Grimoire (Formations)" />
            <Tab label="Tableau de Recrutement" />
          </Tabs>
        </Box>

        <div className="min-h-[250px]">
          {tabValue === 0 && (
            <div className="space-y-4">
              {applications?.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-[#000080]/30 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#000080]">
                      <Rocket size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{application.mission.title}</h4>
                      <p className="text-xs text-slate-400">{application.mission.company} • {getExpirationText(application.mission.deadline)}</p>
                    </div>
                  </div>
                    {application.status === 'pending' && <span className="bg-[#F0E68C]/20 text-[#8B8000] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#F0E68C]/50">En Attente</span>}
                    {application.status === 'accepted' && <span className="bg-[#10B981]/20 text-[#059669] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#10B981]/50">Acceptée</span>}
                    {application.status === 'rejected' && <span className="bg-[#EF4444]/20 text-[#DC2626] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#EF4444]/50">Rejetée</span>}
                    {application.status === 'draft' && <Link href={`/dashboard/candidats/missions/${application.mission.id}/application`}><button className="cursor-pointer ml-4 px-3 py-1 bg-[#000080] text-white rounded-full text-xs font-bold hover:bg-[#000080]/80 transition">Finaliser</button></Link>}
                </div>
              ))}
            </div>
          )}

          {tabValue === 2 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-[#F0E68C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-[#8B8000]" size={32} />
              </div>
              <h3 className="text-xl font-black text-[#000080]">Nouvelles Destinées !</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                Le conseil a trouvé 3 opportunités dignes de votre rang.
              </p>
              <button className="mt-6 px-8 py-3 bg-[#000080] text-white font-bold rounded-xl shadow-lg hover:shadow-[#000080]/30 transition-all active:scale-95">
                Consulter les quêtes
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}