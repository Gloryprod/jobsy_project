  // 'use client';

  // import React, { useState } from 'react';
  // import { Hexagon, Heart, Search, Sword, Star, Rocket, ShieldCheck, Trophy } from 'lucide-react';
  // import { useUser } from '@/context/UserProvider';
  // import useSWR from 'swr';
  // import api from '@/lib/api';
  // import { ThreeDots } from 'react-loader-spinner';
  // import { Box, Tabs, Tab } from '@mui/material';
  // import { Timestamp } from "next/dist/server/lib/cache-handlers/types";
  // import { getExpirationText } from '@/components/GetExpirationText';
  // import Link from 'next/link';

  // const fetcher = (url: string) => api.get(url).then(res => res.data);
  // const fetcher1 = (url: string) => api.get(url).then(res => res.data.data);

  // type Mission = {
  //   id: number;
  //   title: string;
  //   company: string;
  //   location: string;
  //   reward: number;
  //   duration: string; 
  //   deadline: string;
  //   description: string;
  //   skills: string[]; 
  //   urgency: 'normal' | 'urgent' | 'premium';
  //   category: string;
  //   applicants: number;
  //   type_contrat: 'CDI' | 'CDD' | 'Mission Ponctuelle';
  //   active: boolean;
  //   test_severity: 'light' | 'standard' | 'expert';
  //   min_rank_required: string;
  // }

  // interface MissionOffer {
  //   id: number;
  //   application_id: number;
  //   start_date: string;
  //   place: string;
  //   onboarding_instructions: string;
  //   contact_person: string;
  //   expires_at: string;
  //   accepted_at: string;
  //   declined_at: string;
  //   started_at: string;
  //   decline_reason: string;
  //   application : Application
  //   status: 'accepted' | 'service_started' | 'in_progress' | 'work_finished' | 'validated' | 'completed' | 'rejected_after_onboarding';
  //   contract_path: string;
  // }

  // interface Application{
  //     id: number;
  //     candidat_id: number;
  //     mission: Mission;
  //     status: 'draft' | 'pending' | 'accepted'| 'rejected';
  //     global_score: number;
  //     badge: string;
  //     ai_summary: string;
  //     created_at: Timestamp;
  //     completed_at: Timestamp;
  //     updated_at: Timestamp;
  //     mission_offers: MissionOffer
  // }

  // export default function DashboardHome() {
  //   const { user, loading } = useUser();
  //   const { data, error, isLoading } = useSWR('/candidat/profile-elements', fetcher);
  //   const [tabValue, setTabValue] = useState(0);
  //   const candidatId = user?.candidat?.id;
  //   const { data : applications, error: applicationsError, isLoading: applicationsLoading } = useSWR<Application[]>(`/missions/${candidatId}/myapplications`, fetcher1);

  //   const missions_done = applications?.filter(item => item.mission_offers?.status == "completed");
  //   const missions_active = applications?.filter(item => item.mission_offers?.status == "in_progress");

  //   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
  //     setTabValue(newValue);
  //   };

  //   if (loading || isLoading || applicationsLoading) {
  //     return (
  //       <div className="flex justify-center items-center h-[60vh]">
  //         <ThreeDots height="80" width="80" color="#000080" visible={true} />
  //       </div>
  //     );
  //   }

  //   if (error || applicationsError) {
  //     return (
  //       <div className="rounded-2xl p-10 text-center">
  //         <p className="text-red-500 font-bold">Erreur de chargement des données de quête.</p>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="space-y-8 animate-in fade-in duration-700">
        
  //       <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
  //         <div className="h-2 w-full bg-linear-to-r from-[#000080] to-[#4B0082]" />
          
  //         <div className="p-6 lg:p-10">
  //           <div className="flex flex-col lg:flex-row items-center gap-8">
              
  //             <div className="relative group">
  //               <div className="absolute -inset-1 bg-linear-to-r from-[#F0E68C] to-[#000080] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
  //               <div className="relative shrink-0 flex items-center justify-center">
  //                 <Hexagon className="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-md" fill={data.data.rank.code_hexa || '#000080'} stroke="white" strokeWidth={1} />
  //                 <span className="absolute inset-0 flex items-center justify-center text-white font-black text-3xl lg:text-4xl drop-shadow-sm">
  //                   {data.data.rank.rank}
  //                 </span>
  //               </div>
  //             </div>

  //             <div className="flex-1 w-full space-y-6">
  //               <div className="text-center lg:text-left">
  //                 <h1 className="text-3xl font-black text-[#000080] mb-1">
  //                   {user?.prenom} <span className="text-slate-400 font-medium">| {data.data.domaine_competence} {data.data.rank.rank == "E" ? "Apprenti Junior" : ""}</span>
  //                 </h1>
  //                 <p className="text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2 italic">
  //                   <ShieldCheck size={18} className="text-[#F0E68C]" /> Aventurier de niveau {data.data.rank.rank}
  //                 </p>
  //               </div>

  //               {/* Jauges Style RPG */}
  //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                 {/* XP Bar */}
  //                 <div className="space-y-2">
  //                   <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
  //                     <span className="flex items-center gap-1"><Star size={14} className="fill-[#F0E68C] text-[#F0E68C]" /> Expérience</span>
  //                     <span>{data.data.score} XP</span>
  //                   </div>
  //                   <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
  //                     <div 
  //                       className="h-full bg-linear-to-r from-[#F0E68C] to-yellow-500 rounded-full transition-all duration-1000 shadow-inner"
  //                       style={{ width: '75%' }}
  //                     />
  //                   </div>
  //                 </div>

  //                 {/* Energy Bar */}
  //                 <div className="space-y-2">
  //                   <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
  //                     <span className="flex items-center gap-1"><Heart size={14} className="fill-red-500 text-red-500" /> Vitalité</span>
  //                     <span>80%</span>
  //                   </div>
  //                   <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
  //                     <div 
  //                       className="h-full bg-linear-to-r from-red-500 to-orange-400 rounded-full transition-all duration-1000 shadow-inner"
  //                       style={{ width: '80%' }}
  //                     />
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </section>

  //       {/* ==================== CARTES DE STATISTIQUES ==================== */}
  //       <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //         {[
  //           { label: 'Missions Finies', val: missions_done?.length || 0, icon: Sword, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  //           { label: 'Missions en cours', val: missions_active?.length || 0, icon: Rocket, color: 'text-[#000080]', bg: 'bg-blue-50', border: 'border-blue-100' },
  //           { label: 'Formations entreprises', val: data?.data?.trainings_completed || 0, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' }
  //         ].map((stat, idx) => (
  //           <div key={idx} className={`bg-white ${stat.border} border-2 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group`}>
  //             <div className="flex items-center gap-4">
  //               <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
  //                 <stat.icon size={28} />
  //               </div>
  //               <div>
  //                 <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{stat.label}</p>
  //                 <p className="text-2xl font-black text-slate-800">{stat.val}</p>
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //       </section>

  //       {/* ==================== ONGLETS DE CONTENU ==================== */}
  //       <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
  //         <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 4 }}>
  //           <Tabs 
  //             value={tabValue} 
  //             onChange={handleTabChange}
  //             sx={{
  //               '& .MuiTab-root': { 
  //                 color: '#94a3b8', 
  //                 fontWeight: '800',
  //                 textTransform: 'uppercase',
  //                 fontSize: '0.75rem',
  //                 letterSpacing: '0.1em'
  //               },
  //               '& .Mui-selected': { color: '#000080 !important' },
  //               '& .MuiTabs-indicator': { backgroundColor: '#000080', height: 3 }
  //             }}
  //           >
  //             <Tab label="Mes Missions" />
  //             <Tab label="Mes Formations" />
  //             <Tab label="Suggestions de missions" />
  //           </Tabs>
  //         </Box>

  //         <div className="min-h-62.5">
  //           {tabValue === 0 && (
  //             <div className="space-y-4">
  //               {applications && applications.length > 0 ? applications.map((application) => (
  //                 <div key={application.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-[#000080]/30 hover:bg-slate-50 transition-all cursor-pointer">
  //                   <div className="flex items-center gap-4">
  //                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#000080]">
  //                       <Rocket size={20} />
  //                     </div>
  //                     <div>
  //                       <h4 className="font-bold text-slate-800">{application.mission.title}</h4>
  //                       <p className="text-xs text-slate-400">{application.mission.company} • {getExpirationText(application.mission.deadline)}</p>
  //                     </div>
  //                   </div>
  //                     {application.status === 'pending' && <span className="bg-[#F0E68C]/20 text-[#8B8000] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#F0E68C]/50">En Attente</span>}
  //                     {application.status === 'accepted' && <span className="bg-[#10B981]/20 text-[#059669] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#10B981]/50">Acceptée</span>}
  //                     {application.status === 'rejected' && <span className="bg-[#EF4444]/20 text-[#DC2626] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#EF4444]/50">Rejetée</span>}
  //                     {application.status === 'draft' && getExpirationText(application.mission.deadline) !== "Expiré" ? <Link href={`/dashboard/candidats/missions/${application.mission.id}/application`}><button className="cursor-pointer ml-4 px-3 py-1 bg-[#000080] text-white rounded-full text-xs font-bold hover:bg-[#000080]/80 transition">Finaliser</button></Link> : ""}
  //                 </div>
  //               )) : (
  //                   <div className="p-20 text-center">
  //                       <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
  //                           <Search size={24} className="text-slate-300" />
  //                       </div>
  //                       <p className="text-slate-400 font-medium italic">Aucune candidature pour l&apos;instant.</p>
  //                   </div>
  //               )}
  //             </div>
  //           )}

  //           {tabValue === 2 && (
  //             <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
  //               <div className="w-16 h-16 bg-[#F0E68C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
  //                 <Star className="text-[#8B8000]" size={32} />
  //               </div>
  //               {/* <h3 className="text-xl font-black text-[#000080]">Nouvelles Opportunités !</h3> */}
  //               <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
  //                 Ici, retrouvez nos suggestions d&apos;opportunités dignes de votre rang et de vos perfomances sur Jobsy.
  //               </p>
  //               <button className="cursor-pointer mt-6 px-8 py-3 bg-[#000080] text-white font-bold rounded-xl shadow-lg hover:shadow-[#000080]/30 transition-all active:scale-95">
  //                 Consulter les missions
  //               </button>
  //             </div>
  //           )}
  //         </div>
  //       </section>
  //     </div>
  //   );
  // }


'use client';

import React, { useState } from 'react';
import { 
  Hexagon as HexIcon, 
  Heart as HeartIcon, 
  Search as SearchIcon, 
  Sword as SwordIcon, 
  Star as StarIcon, 
  Rocket as RocketIcon, 
  ShieldCheck as ShieldIcon, 
  Trophy as TrophyIcon, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Package, 
  Clock, 
  PlayCircle, 
  FileCheck,
  Download,
  Loader2
} from 'lucide-react';
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
};

interface MissionOffer {
  id: number;
  application_id: number;
  start_date: string;
  place: string;
  onboarding_instructions: string;
  contact_person: string;
  expires_at: string;
  accepted_at: string;
  declined_at: string;
  started_at: string;
  decline_reason: string;
  application: Application;
  status: 'accepted' | 'service_started' | 'in_progress' | 'work_finished' | 'validated' | 'completed' | 'rejected_after_onboarding';
  contract_path: string;
}

interface Application {
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
  mission_offers: MissionOffer;
}

interface Module {
  id: number;
  title: string;
  course_id: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C' | string;
  delivered_skills: string[];
  reward_xp: number;
  reward_asset?: string;
  is_active: boolean;
  modules?: Module[];
}

export interface Enrollment {
  id: number;
  candidat_id: number;
  course_id: number;
  progress_percentage: number;
  status: 'enrolled' | 'waiting_kit' | 'learning' | 'evaluation_ready' | 'pending_review' | 'certified' | 'failed';
  average_quiz_score?: number | null;
  final_project_score?: number | null;
  global_score?: number | null;
  badge?: string | null;
  delivery_status: 'none' | 'pending' | 'delivered';
  project_path?: string | null;
  admin_feedback?: string | null;
  certificate_hash?: string | null;
  certified_at?: string | null;
  created_at: string;
  updated_at: string;
  course: Course;
}

export default function DashboardHome() {
  const { user, loading } = useUser();
  const { data, error, isLoading } = useSWR('/candidat/profile-elements', fetcher);
  const [tabValue, setTabValue] = useState(0);
  const [downloadingHash, setDownloadingHash] = useState<string | null>(null);
  const candidatId = user?.candidat?.id;

  const { 
    data: applications, 
    error: applicationsError, 
    isLoading: applicationsLoading 
  } = useSWR<Application[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, fetcher1);

  const { 
    data: myLearnings, 
    error: learningsError, 
    isLoading: learningsLoading 
  } = useSWR<Enrollment[]>(candidatId ? '/courses/my-learnings' : null, fetcher1);

  const missions_done = applications?.filter(item => item.mission_offers?.status === "completed");
  const missions_active = applications?.filter(item => item.mission_offers?.status === "in_progress");
  const certified_trainings = myLearnings?.filter(item => item.status === 'certified');

  // Trier pour mettre en avant les formations en cours ('learning', 'enrolled')
  const sortedLearnings = myLearnings ? [...myLearnings].sort((a, b) => {
    const isInProgress = (status: Enrollment['status']) => 
      status === 'learning' || status === 'enrolled';

    if (isInProgress(a.status) && !isInProgress(b.status)) return -1;
    if (!isInProgress(a.status) && isInProgress(b.status)) return 1;
    return 0;
  }) : [];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Fonction de téléchargement du certificat via l'API
  const handleDownloadCertificate = async (courseId: number, hash: string, courseTitle: string) => {
    try {
      setDownloadingHash(hash);
      const response = await api.get(`/courses/${courseId}/${hash}/certificate/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificat-${courseTitle.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement du certificat :', err);
    } finally {
      setDownloadingHash(null);
    }
  };

  const renderStatusBadge = (status: Enrollment['status']) => {
    switch (status) {
      case 'certified':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <CheckCircle2 size={14} /> Certifié
          </span>
        );
      case 'learning':
      case 'enrolled':
        return (
          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-[#000080] border border-blue-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <BookOpen size={14} /> En cours
          </span>
        );
      case 'waiting_kit':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <Package size={14} /> Kit en attente
          </span>
        );
      case 'evaluation_ready':
        return (
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <FileCheck size={14} /> Évaluation prête
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <Clock size={14} /> En révision
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-extrabold uppercase">
            <XCircle size={14} /> Non validé
          </span>
        );
      default:
        return null;
    }
  };

  if (loading || isLoading || applicationsLoading || learningsLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
      </div>
    );
  }

  if (error || applicationsError || learningsError) {
    return (
      <div className="rounded-2xl p-10 text-center">
        <p className="text-red-500 font-bold">Erreur de chargement des données du tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* ==================== HERO / PROFIL RPG ==================== */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="h-2 w-full bg-linear-to-r from-[#000080] to-[#4B0082]" />
        
        <div className="p-6 lg:p-10">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#F0E68C] to-[#000080] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative shrink-0 flex items-center justify-center">
                <HexIcon className="w-24 h-24 lg:w-32 lg:h-32 drop-shadow-md" fill={data?.data?.rank?.code_hexa || '#000080'} stroke="white" strokeWidth={1} />
                <span className="absolute inset-0 flex items-center justify-center text-white font-black text-3xl lg:text-4xl drop-shadow-sm">
                  {data?.data?.rank?.rank}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-black text-[#000080] mb-1">
                  {user?.prenom} <span className="text-slate-400 font-medium">| {data?.data?.domaine_competence} {data?.data?.rank?.rank === "E" ? "Apprenti Junior" : ""}</span>
                </h1>
                <p className="text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2 italic">
                  <ShieldIcon size={18} className="text-[#8B8000]" /> Aventurier de niveau {data?.data?.rank?.rank}
                </p>
              </div>

              {/* Jauges Style RPG */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1"><StarIcon size={14} className="fill-[#F0E68C] text-[#8B8000]" /> Expérience</span>
                    <span>{data?.data?.score || 0} XP</span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full border border-slate-200 p-0.5">
                    <div 
                      className="h-full bg-linear-to-r from-[#F0E68C] to-yellow-500 rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-slate-500">
                    <span className="flex items-center gap-1"><HeartIcon size={14} className="fill-red-500 text-red-500" /> Vitalité</span>
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
          { 
            label: 'Missions Finies', 
            val: missions_done?.length || 0, 
            icon: SwordIcon, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50', 
            border: 'border-emerald-100' 
          },
          { 
            label: 'Missions en cours', 
            val: missions_active?.length || 0, 
            icon: RocketIcon, 
            color: 'text-[#000080]', 
            bg: 'bg-blue-50', 
            border: 'border-blue-100' 
          },
          { 
            label: 'Formations suivies', 
            val: myLearnings?.length || data?.data?.trainings_completed || 0, 
            subVal: certified_trainings?.length ? `${certified_trainings.length} certifiée(s)` : null,
            icon: TrophyIcon, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50', 
            border: 'border-purple-100' 
          }
        ].map((stat, idx) => (
          <div key={idx} className={`bg-white ${stat.border} border-2 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-xl group-hover:scale-110 transition-transform`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-black text-slate-800">{stat.val}</p>
                  {stat.subVal && (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                      {stat.subVal}
                    </span>
                  )}
                </div>
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
            <Tab label="Mes Missions" />
            <Tab label={`Mes Formations (${myLearnings?.length || 0})`} />
            <Tab label="Suggestions de missions" />
          </Tabs>
        </Box>

        <div className="min-h-62.5">
          {/* TAB 0 : MES MISSIONS */}
          {tabValue === 0 && (
            <div className="space-y-4">
              {applications && applications.length > 0 ? applications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-[#000080]/30 hover:bg-slate-50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-[#000080]">
                      <RocketIcon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{application.mission.title}</h4>
                      <p className="text-xs text-slate-400">{application.mission.company} • {getExpirationText(application.mission.deadline)}</p>
                    </div>
                  </div>
                  {application.status === 'pending' && <span className="bg-[#F0E68C]/20 text-[#8B8000] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#F0E68C]/50">En Attente</span>}
                  {application.status === 'accepted' && <span className="bg-[#10B981]/20 text-[#059669] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#10B981]/50">Acceptée</span>}
                  {application.status === 'rejected' && <span className="bg-[#EF4444]/20 text-[#DC2626] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#EF4444]/50">Rejetée</span>}
                  {application.status === 'draft' && getExpirationText(application.mission.deadline) !== "Expiré" ? (
                    <Link href={`/dashboard/candidats/missions/${application.mission.id}/application`}>
                      <button className="cursor-pointer ml-4 px-3 py-1 bg-[#000080] text-white rounded-full text-xs font-bold hover:bg-[#000080]/80 transition">
                        Finaliser
                      </button>
                    </Link>
                  ) : ""}
                </div>
              )) : (
                <div className="p-20 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon size={24} className="text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium italic">Aucune candidature pour l&apos;instant.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 1 : MES FORMATIONS */}
          {tabValue === 1 && (
            <div className="space-y-4">
              {sortedLearnings && sortedLearnings.length > 0 ? (
                <>
                  {/* Afficher en priorité les 3 premières (formations en cours prioritaires) */}
                  {sortedLearnings.slice(0, 3).map((item) => {
                    const course = item.course;
                    const isDownloading = downloadingHash === item.certificate_hash;

                    return (
                      <div 
                        key={item.id} 
                        className="p-5 rounded-2xl border border-slate-100 hover:border-[#000080]/30 hover:bg-slate-50/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex items-start md:items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 font-black">
                            <BookOpen size={22} />
                          </div>
                          <div className="space-y-2 w-full max-w-xl">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-slate-800 text-base">{course?.title}</h4>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                +{course?.reward_xp} XP
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                Mode {course?.validation_mode}
                              </span>
                            </div>

                            {/* Barre de progression */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                                <span>Progression</span>
                                <span>{item.progress_percentage}%</span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-linear-to-r from-[#000080] to-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${item.progress_percentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                              {item.global_score !== null && item.global_score !== undefined && (
                                <span>Score global : <strong>{item.global_score} pts</strong></span>
                              )}
                              {item.certified_at && (
                                <span>• Certifié le {new Date(item.certified_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 shrink-0">
                          {/* BADGE DE STATUT */}
                          {renderStatusBadge(item.status)}

                          {/* ACTION DE TÉLÉCHARGEMENT DU CERTIFICAT VIA L'API */}
                          {item.status === 'certified' && item.certificate_hash && (
                            <button 
                              onClick={() => handleDownloadCertificate(course.id, item.certificate_hash!, course.title)}
                              disabled={isDownloading}
                              className="cursor-pointer px-4 py-2 bg-[#000080] text-white rounded-xl text-xs font-bold hover:bg-[#000080]/90 disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
                            >
                              {isDownloading ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Téléchargement...
                                </>
                              ) : (
                                <>
                                  <Download size={14} /> Certificat
                                </>
                              )}
                            </button>
                          )}

                          {(item.status === 'enrolled' || item.status === 'learning') && (
                            <Link href={`/dashboard/candidats/courses/${course?.id}`}>
                              <button className="cursor-pointer px-4 py-2 bg-[#000080] text-white rounded-xl text-xs font-bold hover:bg-[#000080]/90 transition flex items-center gap-2 shadow-sm">
                                <PlayCircle size={14} /> Continuer
                              </button>
                            </Link>
                          )}

                          {item.status === 'evaluation_ready' && (
                            <Link href={`/dashboard/candidats/courses/${course?.id}/evaluation`}>
                              <button className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm">
                                Passer l&apos;examen <ArrowRight size={14} />
                              </button>
                            </Link>
                          )}

                          {item.status === 'failed' && (
                            <Link href={`/dashboard/candidats/courses/${course?.id}`}>
                              <button className="cursor-pointer px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition flex items-center gap-2 shadow-sm">
                                Repasser
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* LIEN "VOIR TOUT" SI PLUS DE 3 FORMATIONS */}
                  {sortedLearnings.length > 3 && (
                    <div className="text-center pt-2">
                      <Link href="/dashboard/candidats/formations">
                        <button className="cursor-pointer text-[#000080] hover:text-[#000080]/80 font-extrabold text-xs inline-flex items-center gap-1 group">
                          Voir toutes les formations
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                  <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-700">Aucune formation suivie</h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Développez vos compétences et gagnez de l&apos;expérience pour débloquer de meilleures opportunités.
                  </p>
                  <Link href="/dashboard/candidats/courses">
                    <button className="cursor-pointer mt-5 px-6 py-2.5 bg-[#000080] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#000080]/90 transition">
                      Explorer le catalogue
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2 : SUGGESTIONS DE MISSIONS */}
          {tabValue === 2 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-3xl">
              <div className="w-16 h-16 bg-[#F0E68C]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="text-[#8B8000]" size={32} />
              </div>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-2">
                Ici, retrouvez nos suggestions d&apos;opportunités dignes de votre rang et de vos performances sur Jobsy.
              </p>
              <Link href="/dashboard/candidats/missions">
                <button className="cursor-pointer mt-6 px-8 py-3 bg-[#000080] text-white font-bold rounded-xl shadow-lg hover:shadow-[#000080]/30 transition-all active:scale-95">
                  Consulter les missions
                </button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}