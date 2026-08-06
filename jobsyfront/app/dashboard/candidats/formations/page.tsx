'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  BookOpen, 
  GraduationCap, 
  ChevronRight, 
  Target, 
  ChevronLeft, 
  X,
  Sparkles,
  Truck,
  Zap,
  CheckCircle2,
  Award,
  Layers,
  Package,
  FileText,
  AlertTriangle,
  Clock
} from 'lucide-react';
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import { useRouter } from "next/navigation";
import toast from 'react-hot-toast';

interface Course {
  id: number;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C' | string;
  delivered_skills: string[];
  reward_xp: number;
  reward_asset?: string;
  is_active: boolean;
  modules: Module[];
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
}

export type EnrollmentStatus = 
  | 'enrolled' 
  | 'waiting_kit' 
  | 'learning' 
  | 'evaluation_ready' 
  | 'pending_review' 
  | 'certified' 
  | 'failed';

interface ApiResponse {
  is_enrolled: boolean;
  course: Course;
  enrollment?: {
    id: number;
    status: EnrollmentStatus;
  };
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

// Mapping des modes de validation backend ('A', 'B', 'C') vers les filtres UI
const MODE_MAPPINGS: Record<string, { codes: string[]; label: string; icon: any; colorClass: string; borderClass: string; bgClass: string; textClass: string }> = {
  'STANDARD': {
    codes: ['A', 'STANDARD'],
    label: 'Standard (Soft Skills)',
    icon: GraduationCap,
    colorClass: 'from-blue-600 to-indigo-600',
    borderClass: 'border-indigo-100 hover:border-indigo-300',
    bgClass: 'bg-indigo-50/70',
    textClass: 'text-indigo-700'
  },
  'LOGISTIQUE': {
    codes: ['B', 'LOGISTIQUE'],
    label: 'Logistique (Terrain)',
    icon: Truck,
    colorClass: 'from-amber-500 to-orange-600',
    borderClass: 'border-amber-100 hover:border-amber-300',
    bgClass: 'bg-amber-50/70',
    textClass: 'text-amber-700'
  },
  'EXPERT': {
    codes: ['C', 'EXPERT'],
    label: 'Expert (Spécialisé)',
    icon: Zap,
    colorClass: 'from-purple-600 to-pink-600',
    borderClass: 'border-purple-100 hover:border-purple-300',
    bgClass: 'bg-purple-50/70',
    textClass: 'text-purple-700'
  }
};

// Configuration visuelle et textes selon le niveau d'avancement (enrollment.status)
const ENROLLMENT_STATUS_CONFIG: Record<
  EnrollmentStatus, 
  { label: string; icon: any; bgClass: string; textClass: string; borderClass: string; actionText: string }
> = {
  'enrolled': {
    label: 'Inscrit(e)',
    icon: CheckCircle2,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    actionText: 'Démarrer le parcours'
  },
  'waiting_kit': {
    label: 'En attente du kit',
    icon: Package,
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    actionText: 'Suivre le matériel'
  },
  'learning': {
    label: 'En cours',
    icon: BookOpen,
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    actionText: 'Continuer la formation'
  },
  'evaluation_ready': {
    label: 'Évaluation lancée',
    icon: FileText,
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    actionText: 'Passer l\'évaluation'
  },
  'pending_review': {
    label: 'Correction en cours',
    icon: Clock,
    bgClass: 'bg-sky-50',
    textClass: 'text-sky-700',
    borderClass: 'border-sky-200',
    actionText: 'Voir l\'avancement'
  },
  'certified': {
    label: 'Certifiée ! 🎉',
    icon: Award,
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    actionText: 'Voir mon certificat'
  },
  'failed': {
    label: 'Non validé',
    icon: AlertTriangle,
    bgClass: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    actionText: 'Repasser l\'évaluation'
  }
};

export default function FormationCatalogue() {
  const { data, isLoading, error } = useSWR<ApiResponse[]>('/open/courses', fetcher);
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState('TOUTES');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingCourseId, setLoadingCourseId] = useState<number | null>(null);

  const filters = ['TOUTES', 'STANDARD', 'LOGISTIQUE', 'EXPERT'];
  const itemsPerPage = 6;

  const filteredData = useMemo(() => {
    if (!data) return [];

    return data.filter(item => {
      const mode = (item.course.validation_mode || 'A').toString().toUpperCase();

      let matchesMode = true;
      if (activeFilter !== 'TOUTES') {
        const targetConfig = MODE_MAPPINGS[activeFilter];
        matchesMode = targetConfig ? targetConfig.codes.includes(mode) : false;
      }

      const searchLower = searchTerm.toLowerCase().trim();
      let matchesSearch = true;
      if (searchLower) {
        matchesSearch = 
          item.course.title?.toLowerCase().includes(searchLower) ||
          item.course.description?.toLowerCase().includes(searchLower) ||
          (item.course.delivered_skills && item.course.delivered_skills.some(skill => 
            skill.toLowerCase().includes(searchLower)
          ));
      }

      return matchesMode && matchesSearch;
    });
  }, [data, activeFilter, searchTerm]);

  const countsByFilter = useMemo(() => {
    if (!data) return { TOUTES: 0, STANDARD: 0, LOGISTIQUE: 0, EXPERT: 0 };
    return {
      TOUTES: data.length,
      STANDARD: data.filter(i => MODE_MAPPINGS['STANDARD'].codes.includes((i.course.validation_mode || 'A').toString().toUpperCase())).length,
      LOGISTIQUE: data.filter(i => MODE_MAPPINGS['LOGISTIQUE'].codes.includes((i.course.validation_mode || 'B').toString().toUpperCase())).length,
      EXPERT: data.filter(i => MODE_MAPPINGS['EXPERT'].codes.includes((i.course.validation_mode || 'C').toString().toUpperCase())).length,
    };
  }, [data]);

  const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

  const handleStartCourse = async (courseId: number) => {
    try {
      setLoadingCourseId(courseId);
      const response = await api.post(`/candidat/formations/${courseId}/enroll`);
      
      if (response.data.data.is_enrolled === false) {
        toast.success(response.data.message || "Inscription réussie !");
      }
      
      router.push(`/dashboard/candidats/formations/${courseId}/workspace`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription à la formation.");
    } finally {
      setLoadingCourseId(null);
    }
  };

  const getModeInfo = (modeStr: string) => {
    const uppercaseMode = (modeStr || 'A').toUpperCase();
    if (MODE_MAPPINGS['LOGISTIQUE'].codes.includes(uppercaseMode)) return MODE_MAPPINGS['LOGISTIQUE'];
    if (MODE_MAPPINGS['EXPERT'].codes.includes(uppercaseMode)) return MODE_MAPPINGS['EXPERT'];
    return MODE_MAPPINGS['STANDARD'];
  };

  const getEnrollmentStatusInfo = (status?: EnrollmentStatus) => {
    if (!status || !ENROLLMENT_STATUS_CONFIG[status]) {
      return ENROLLMENT_STATUS_CONFIG['learning'];
    }
    return ENROLLMENT_STATUS_CONFIG[status];
  };

  if (isLoading) return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
      <ThreeDots height="70" width="70" color="#000080" visible={true} />
      <p className="text-slate-500 font-semibold text-sm animate-pulse">Chargement du catalogue des formations...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
        <X size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">Impossible de charger les formations</h3>
      <p className="text-slate-500 max-w-md text-sm mb-6">Une erreur réseau s&apos;est produite lors de la récupération du catalogue.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-6 py-2.5 bg-[#000080] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#000060] transition-all shadow-md"
      >
        Réessayer
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen font-sans">
      
      {/* Header */}
      <div className="relative mb-10 text-center sm:text-left">
        <div className=" sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F0E68C]/25 border border-[#8B8000]/20 rounded-full mb-3 shadow-xs">
              <Target size={14} className="text-[#8B8000]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#8B8000]">Guilde des Formations</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Catalogue des <span className="text-[#000080] ">Formations</span>
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium mt-2">
              Développez vos compétences, gagnez de l&apos;XP et validez vos badges d&apos;expertise métier.
            </p>
          </div>

        </div>
      </div>

      {/* Barre de Recherche et Filtres */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#000080] transition-colors" size={20} />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { 
                setSearchTerm(e.target.value); 
                setCurrentPage(1); 
              }}
              placeholder="Rechercher par titre, compétence (ex: React, Management)..." 
              className="w-full bg-white border-2 border-slate-200/80 py-3.5 pl-12 pr-10 rounded-2xl focus:outline-none focus:border-[#000080] focus:ring-4 focus:ring-[#000080]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400 text-sm shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                title="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs flex items-center gap-2 border border-slate-200">
              <SlidersHorizontal size={16} className="text-[#000080]" />
              <span className="hidden sm:inline uppercase tracking-wider">Filtre actif :</span>
              <span className="text-[#000080] font-black">{activeFilter}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {filters.map((filter) => {
            const count = countsByFilter[filter as keyof typeof countsByFilter] || 0;
            const isActive = activeFilter === filter;
            
            return (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full text-xs font-black transition-all whitespace-nowrap cursor-pointer select-none ${
                  isActive 
                  ? 'bg-[#000080] text-white shadow-lg shadow-[#000080]/20 scale-[1.02]' 
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <span>{filter}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 font-bold'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille de Cartes */}
      {currentItems && currentItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map((dataItem) => {
            const course = dataItem.course;
            const modeInfo = getModeInfo(course.validation_mode);
            const ModeIcon = modeInfo.icon;
            const isEnrolled = dataItem.is_enrolled;
            const enrollmentStatus = dataItem.enrollment?.status;
            const statusInfo = getEnrollmentStatusInfo(enrollmentStatus);
            const StatusIcon = statusInfo.icon;
            const isLoadingThis = loadingCourseId === course.id;

            return (
              <div
                key={course.id}
                className={`group relative bg-white rounded-3xl border-2 ${
                  isEnrolled ? statusInfo.borderClass : modeInfo.borderClass
                } p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div>
                  {/* Badge Mode & Statut */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider ${modeInfo.bgClass} ${modeInfo.textClass}`}>
                      <ModeIcon size={14} />
                      <span>{activeFilter !== 'TOUTES' ? modeInfo.label.split(' ')[0] : course.validation_mode === "A" ? "STANDARD" : course.validation_mode === "B" ? "LOGISTIQUE" : "EXPERT"}</span>
                    </div>

                    {isEnrolled ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${statusInfo.bgClass} ${statusInfo.textClass} border ${statusInfo.borderClass}`}>
                        <StatusIcon size={13} />
                        {statusInfo.label}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                        Nouveau
                      </span>
                    )}
                  </div>

                  {/* Titre & Description */}
                  <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-2 group-hover:text-[#000080] transition-colors leading-snug">
                    {course.title}
                  </h3>

                  <p className="text-slate-500 text-xs sm:text-sm line-clamp-3 mb-4 font-normal leading-relaxed" dangerouslySetInnerHTML={{ __html: course.description }}>
                    {/* {course.description || "Aucune description disponible pour cette formation."} */}
                  </p>

                  {/* Notification de Statut Détaillée quand inscrit */}
                  {isEnrolled && (
                    <div className={`mb-4 p-3 rounded-2xl border ${statusInfo.bgClass} ${statusInfo.borderClass} flex items-center gap-3 transition-all`}>
                      <div className={`p-2 rounded-xl bg-white shadow-xs shrink-0 ${statusInfo.textClass}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Progression</span>
                        <p className={`text-xs font-black truncate ${statusInfo.textClass}`}>
                          {statusInfo.label}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Compétences délivrées */}
                  {course.delivered_skills && course.delivered_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {course.delivered_skills.slice(0, 3).map((skill, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200/60 uppercase tracking-tight"
                        >
                          {skill}
                        </span>
                      ))}
                      {course.delivered_skills.length > 3 && (
                        <span className="px-2 py-1 bg-slate-50 text-slate-400 text-[10px] font-bold rounded-lg border border-slate-200/50">
                          +{course.delivered_skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer & Bouton Dynamique */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#000080]" />
                      <span>{course.modules?.length || 0} module{(course.modules?.length || 0) > 1 ? 's' : ''}</span>
                    </div>

                    <div className="flex items-center gap-1 font-black text-[#000080]">
                      <Sparkles size={14} className="text-amber-500 fill-amber-400" />
                      <span>+{course.reward_xp || 0} XP</span>
                    </div>

                    {course.reward_asset && (
                      <div className="flex items-center gap-1 text-purple-600 font-bold" title={course.reward_asset}>
                        <Award size={14} />
                        <span className="truncate max-w-20">{course.reward_asset}</span>
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action avec libellé dynamique basé sur le statut */}
                  <button 
                    onClick={() => handleStartCourse(course.id)} 
                    disabled={isLoadingThis}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isEnrolled
                        ? enrollmentStatus === 'certified'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : enrollmentStatus === 'evaluation_ready'
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/20'
                          : enrollmentStatus === 'waiting_kit'
                          ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                          : enrollmentStatus === 'failed'
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                        : 'bg-[#000080] hover:bg-[#000060] text-white shadow-[#000080]/20'
                    }`}
                  >
                    {isLoadingThis ? (
                      <ThreeDots height="18" width="40" color="#ffffff" visible={true} />
                    ) : (
                      <>
                        <span>{isEnrolled ? statusInfo.actionText : "Démarrer la formation"}</span>
                        <ChevronRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center my-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-1">Aucune formation trouvée</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Aucun cours ne correspond à vos critères de recherche actuels ({activeFilter} {searchTerm && `"${searchTerm}"`}).
          </p>
          <button
            onClick={() => {
              setActiveFilter('TOUTES');
              setSearchTerm('');
              setCurrentPage(1);
            }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center justify-between shadow-xs">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Page <span className="text-slate-900 font-black">{currentPage}</span> sur <span className="text-slate-900 font-black">{totalPages}</span>
          </p>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#000080] hover:text-white hover:border-[#000080] transition-all cursor-pointer"
              title="Page précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#000080] hover:text-white hover:border-[#000080] transition-all cursor-pointer"
              title="Page suivante"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}