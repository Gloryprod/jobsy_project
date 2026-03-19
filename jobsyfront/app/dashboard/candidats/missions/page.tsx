
'use client';

import React, { useState, useMemo } from 'react';
import { Sword, MapPin, Clock, Wallet, Search, Star, Zap, Building2, Calendar, Briefcase, X, Target, Filter, ArrowRight, Info, BrainCircuit } from 'lucide-react';
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import Link from "next/link";
import { useUser } from '@/context/UserProvider';


export type Mission = {
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
  category: 'tout' | 'diplomes' | 'non_diplomes';
  applicants: number;
  type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  active: boolean;
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function MissionsPage() {
  const { data: missions = [], isLoading, error } = useSWR<Mission[]>('/liste_missions', fetcher);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContract, setSelectedContract] = useState<string>('all');
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [appliedMission, setAppliedMission] = useState<Mission | null>(null);
  const { user, loading: authLoading } = useUser();
  
  const candidatRank = user?.candidat?.rank.rank;

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

  const missionPonctuelles = missions.filter(mission => mission.type_contrat === 'Mission Ponctuelle');

  const getContractStyle = (type: string) => {
    switch (type) {
      case 'CDI': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'CDD': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Mission Ponctuelle': return 'bg-blue-50 text-[#000080] border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <ThreeDots height="80" width="80" color="#000080" visible={true} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#000080]">
      <p className="text-white">Erreur de chargement des offres. Veuillez réessayer plus tard.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="bg-white border-b border-slate-100 pt-16 pb-12 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0E68C]/20 rounded-full">
            <Target size={16} className="text-[#8B8000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B8000]">Guilde des Opportunités</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
            <span className="text-[#000080]">Offres / Missions</span>
          </h1>
          
          <p className="text-slate-500 text-lg w-full mx-auto font-medium">
            Trouvez votre prochaine aventure. Des centaines de quêtes n&apos;attendent que votre expertise.
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
              className="w-full pl-16 pr-6 py-6 bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/40 focus:outline-none focus:border-[#000080]/20 transition-all text-slate-700 font-bold placeholder:text-slate-300"
            />
          </div>

          {/* Filtres de Contrat */}
          {candidatRank == "E" || candidatRank == "D" ? '' : <div className="flex flex-wrap gap-2 justify-center mt-6">
            {['all', 'CDI', 'CDD', 'Mission Ponctuelle'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedContract(type)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  selectedContract === type 
                  ? 'bg-[#000080] text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-white text-slate-400 border border-slate-200 hover:border-[#000080]'
                }`}
              >
                {type === 'all' ? 'Toutes les quêtes' : type}
              </button>
            ))}
          </div>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 space-y-8">
        {/* Compteur discret */}
        <div className="flex items-center gap-2 text-slate-400">
          <Filter size={14} />
          <p className="text-xs font-black uppercase tracking-widest">
            {candidatRank == "E" || candidatRank == "D" ? missionPonctuelles.length : filteredMissions.length} Missions disponibles
          </p>
        </div>

        {/* ==================== GRILLE DES MISSIONS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidatRank == "E" || candidatRank == "D" ? 
          missionPonctuelles.map((mission) => (
            <div
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
            >
              {/* Indicateur d'urgence subtil */}
              {mission.urgency === 'urgent' && (
                <div className="absolute top-0 right-10 px-4 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-b-xl">
                  Urgent
                </div>
              )}

              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${getContractStyle(mission.type_contrat)}`}>
                    {mission.type_contrat}
                  </span>
                  {mission.urgency === 'premium' && <Star className="w-5 h-5 text-[#F0E68C] fill-[#F0E68C]" />}
                </div>

                <h3 className="text-xl font-black text-slate-800 group-hover:text-[#000080] transition-colors leading-tight">
                  {mission.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Building2 size={16} className="text-[#000080]" /> {mission.company}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <MapPin size={16} className="text-[#000080]" /> {mission.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {mission.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[9px] font-black uppercase tracking-tighter px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer de la carte */}
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Prime</p>
                  <p className="text-2xl font-black text-[#000080] tracking-tight">{mission.reward.toLocaleString()} <span className="text-sm">F</span></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500 text-[10px] font-black uppercase mb-1">
                    <Clock size={12} /> {mission.duration}
                  </div>
                  <Link href="#">
                    <button onClick = {(e) => {e.stopPropagation(); setAppliedMission(mission)}}  className="bg-[#000080] items-center text-[10px] text-[#F0E68C] text-md font-bold px-2 py-2 rounded-lg cursor-pointer">Postuler</button>
                  </Link>
                </div>
              </div>
            </div>
          )) : 
          filteredMissions.map((mission) => (
            <div
              key={mission.id}
              onClick={() => setSelectedMission(mission)}
              className="group bg-white border border-slate-100 rounded-[2.5rem] p-7 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
            >
              {/* Indicateur d'urgence subtil */}
              {mission.urgency === 'urgent' && (
                <div className="absolute top-0 right-10 px-4 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-b-xl">
                  Urgent
                </div>
              )}

              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase border ${getContractStyle(mission.type_contrat)}`}>
                    {mission.type_contrat}
                  </span>
                  {mission.urgency === 'premium' && <Star className="w-5 h-5 text-[#F0E68C] fill-[#F0E68C]" />}
                </div>

                <h3 className="text-xl font-black text-slate-800 group-hover:text-[#000080] transition-colors leading-tight">
                  {mission.title}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <Building2 size={16} className="text-[#000080]" /> {mission.company}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                    <MapPin size={16} className="text-[#000080]" /> {mission.location}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {mission.skills.slice(0, 3).map((skill, i) => (
                    <span key={i} className="text-[9px] font-black uppercase tracking-tighter px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer de la carte */}
              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-none mb-1">Prime</p>
                  <p className="text-2xl font-black text-[#000080] tracking-tight">{mission.reward.toLocaleString()} <span className="text-sm">F</span></p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-500 text-[10px] font-black uppercase mb-1">
                    <Clock size={12} /> {mission.duration}
                  </div>
                  <Link href="#">
                    <button onClick = {(e) => {e.stopPropagation(); setAppliedMission(mission)}}  className="bg-[#000080] items-center text-[10px] text-[#F0E68C] text-md font-bold px-2 py-2 rounded-lg cursor-pointer">Postuler</button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== MODAL DÉTAILS (STYLE RPG LIGHT) ==================== */}
      {selectedMission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div 
            className="bg-white rounded-3xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMission(null)} 
              className="absolute top-6 right-6 p-3 bg-slate-50 hover:bg-slate-100 rounded-full transition text-slate-400"
            >
              <X size={24} />
            </button>

            <div className="p-10 space-y-8">
              <div className="space-y-2 pr-12">
                <span className="text-[#000080] font-black text-xs uppercase tracking-[0.3em]">{selectedMission.company}</span>
                <h2 className="text-3xl lg:text-4xl font-black text-slate-800 leading-none">{selectedMission.title}</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Type', val: selectedMission.type_contrat, icon: Briefcase },
                  { 
                    label: 'Délai', 
                    val: new Date(selectedMission.deadline).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }), 
                    icon: Calendar, 
                    color: 'text-orange-600' 
                  },
                  { label: 'Région', val: selectedMission.location, icon: MapPin }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className={`text-xs font-black flex items-center gap-2 ${item.color || 'text-slate-700'}`}>
                      <item.icon size={14} className="text-[#000080]" /> {item.val}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                   <Sword size={16} className="text-[#F0E68C]" /> Objectifs de la mission
                </h4>
                <p className="text-slate-600 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: selectedMission.description }}/>
              </div>

              <div className="p-8 bg-[#000080] rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-900/30">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <Wallet size={32} className="text-[#F0E68C]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200">Récompense Totale</p>
                    <p className="text-3xl font-black">{selectedMission.reward.toLocaleString()} <span className="text-sm">F CFA</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== Modal Candidature (STYLE RPG LIGHT) ==================== */}
      {appliedMission && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-300">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl relative overflow-y-auto no-scrollbar " 
            onClick={e => e.stopPropagation()}
          >
            {/* Header décoratif style "Alerte IA" */}

            <button 
              onClick={() => setAppliedMission(null)} 
              className="absolute top-6 right-6 p-2 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400 z-10"
            >
              <X size={20} />
            </button>

            <div className="p-8 lg:p-10 space-y-8">
              {/* En-tête de la mission */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0E68C]/20 rounded-2xl mb-2">
                  <Zap className="text-[#8B8000] w-8 h-8" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 leading-tight">
                  Prêt pour l&apos;évaluation ?
                </h2>
                <p className="text-slate-500 font-medium">
                  Mission : <span className="text-[#000080]">{appliedMission.title}</span>
                </p>
              </div>

              {/* Liste des règles / Consignes */}
              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <Clock className="w-5 h-5 text-[#000080]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Durée estimée : 5 min</p>
                    <p className="text-sm text-slate-500">Prévoyez un moment calme pour répondre.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <BrainCircuit className="w-5 h-5 text-[#000080]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Test assisté par IA</p>
                    <p className="text-sm text-slate-500">Questions basées sur les besoins réels du poste ou de la mission.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="mt-1 bg-white p-2 rounded-lg shadow-sm">
                    <Target className="w-5 h-5 text-[#000080]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">Score & Badges</p>
                    <p className="text-sm text-slate-500">Votre classement dépendra de la pertinence de vos réponses.</p>
                  </div>
                </div>
              </div>

              {/* Warning / Rappel */}
              <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-700 text-sm">
                <Info size={18} className="shrink-0" />
                <p>Toute sortie du test annulera votre progression actuelle.</p>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => {
                      window.location.href = `/dashboard/candidats/missions/${appliedMission.id}/application`;
                  }}
                  className="w-full py-4 bg-[#000080] hover:bg-[#0000a0] text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-100 active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  Commencer maintenant <ArrowRight size={20} />
                </button>
                
                <button 
                  onClick={() => setAppliedMission(null)}
                  className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition"
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}