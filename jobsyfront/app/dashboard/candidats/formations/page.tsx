'use client'
import React, { useState } from 'react';
import { Search, SlidersHorizontal, BookOpen, GraduationCap, ChevronRight, Clock, Star, Target, ChevronLeft } from 'lucide-react';
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import { useRouter } from "next/navigation"

interface Course {
  id: string;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C';
  delivered_skills: string[];
  reward_xp: number;
  reward_asset: string;
  is_active: boolean
  modules : Module[]
}

interface Module {
    id: number;
    title: string;
    description: string;
    order: number;
    course: Course;
    // lessons?: Lesson[];
    // quiz_questions?: QuizQuestion[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function FormationCatalogue(){
  const { data: courses = [], isLoading, error } = useSWR<Course[]>('/open/courses', fetcher);
  const router = useRouter()

  const [activeFilter, setActiveFilter] = useState('TOUTES');

  const filters = ['TOUTES', 'RESTAURATION', 'LOGISTIQUE', 'BTP', 'DIGITAL'];

  // États pour la recherche et la pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 1;

  // 1. Logique de Recherche
  const filteredData = courses?.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.delivered_skills.some(skill => 
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // 2. Logique de Pagination
  const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <ThreeDots height="80" width="80" color="#000080" visible={true} />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600">Erreur de chargement des formations</p>
    </div>
  );

  return (
    <div className="m-2 md:p-8 max-w-5xl mx-auto min-h-screen">
      <div className="pt-4 pb-12">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0E68C]/20 rounded-full">
            <Target size={16} className="text-[#8B8000]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B8000]">Guilde des Opportunités</span>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
            <span className="text-[#000080]">Formations</span>
          </h1>
          
          <p className="text-slate-500 text-lg w-full mx-auto font-medium">
            Formez vous et prouvez votre expertise.
          </p>
        </div>
      </div>
      {/* BARRE DE RECHERCHE & FILTRE - Style Dark Mode inspiré de l'image mais adapté */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#000080] transition-colors" size={20} />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            placeholder="Rechercher une formation ou une compétence..." 
            className="w-full bg-slate-50 border-2 border-slate-200 py-3.5 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-[#000080]/20 focus:ring-4 focus:ring-[#000080]/5 transition-all font-medium text-slate-700"
          />
        </div>
        <button onClick={(e) => {setCurrentPage(1);}} className="flex items-center justify-center gap-2 bg-[#000080] text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-[#000060] transition-all shadow-lg shadow-[#000080]/20 cursor-pointer">
          <SlidersHorizontal size={20} />
          <span className="uppercase tracking-widest text-xs">Filtres</span>
        </button>
      </div>

      {/* CAPSULES DE CATÉGORIES - Style "Chips" de l'image */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-6 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter 
              ? 'bg-[#000080] text-white shadow-md' 
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* LISTE DES FORMATIONS (QUÊTES) */}
      <div className="space-y-4">
        {currentItems.map((course) => (
          <div
            onClick={() => router.push(`/dashboard/candidats/formations/${course.id}/modules`)} 
            key={course.id}
            className="group relative bg-white rounded-3xl border-2 border-slate-100 p-5 md:p-6 hover:border-[#000080]/30 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              
              {/* ICÔNE DE RANG (Style Hexagone/Cercle de l'image) */}
              <div className="hidden md:flex shrink-0 w-16 h-16 bg-slate-50 rounded-2xl items-center justify-center group-hover:bg-[#000080]/5 transition-colors">
                <GraduationCap className="text-[#000080]" size={32} />
              </div>

              <div className="flex-1 min-w-0">
                {/* BADGES DE RANG (Comme sur ta photo) */}
                <div className="flex items-center gap-3 mb-2">
                  {course.delivered_skills.map((skill, index) => (
                    <span key={index} className="px-2.5 py-0.5 bg-[#F0E68C]/30 text-[#000080] text-[10px] font-black rounded-md uppercase tracking-tighter border border-[#F0E68C]">
                      {skill}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2 truncate group-hover:text-[#000080] transition-colors">
                  {course.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Clock size={14} className="text-orange-500" />
                    1 heure 
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <BookOpen size={14} className="text-[#000080]" />
                    {course.modules.length} modules
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />
                    4.8
                  </div>
                </div>
              </div>

              {/* PRIX / RÉCOMPENSE (Style à droite de l'image) */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-50">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gain estimé</p>
                  <p className="text-2xl font-black text-[#000080]">+{course.reward_xp} XP</p>
                </div>
                <ChevronRight onClick={() => router.push(`/dashboard/candidats/formations/${course.id}/modules`)} className="text-slate-300 group-hover:text-[#000080] group-hover:translate-x-1 transition-all" size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
          <div className="p-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Page {currentPage} sur {totalPages}
            </p>
            <div className="flex gap-2">
                <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-[#000080] hover:text-white transition-all cursor-pointer"
                >
                <ChevronLeft size={20} />
                </button>
                <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg disabled:opacity-30 hover:bg-[#000080] hover:text-white transition-all cursor-pointer"
                >
                <ChevronRight size={20} />
                </button>
            </div>
          </div>
      )}
    </div>
  );
};

