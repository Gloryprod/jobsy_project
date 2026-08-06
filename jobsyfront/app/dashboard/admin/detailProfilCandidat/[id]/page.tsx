// 'use client'
// import api from "@/lib/api";
// import useSWR from "swr";
// import {use} from "react";
// import { ThreeDots } from 'react-loader-spinner';
// import PageInfo from "@/components/PageInfo";
// import Avatar from "@/components/Avatar";
// import { Briefcase, GraduationCap, Award, Calendar, MapPin, BrainCircuit, CheckCircle2, Eye, Download } from 'lucide-react';

// interface Category{
//     name : string
//     color : string
// }

// interface Experience {
//     JobTitle : string;
//     Duration: string;
//     Company : string;
//     Description : string;
// }

// interface Education {
//     Degree : string;
//     Institution: string;
//     Duration : string;
// }

// interface Certification {
//     CourseName: string;
//     Provider: string;
//     Date: string;
// }

// interface Candidat {

//     domaine_competence : string;
//     niveau_etude : string;
//     bio : string;
//     ville : string;
//     is_validate: boolean;

//     rank : {
//         label: string;
//         rank: string;
//         points: number;
//         color: string;
//         code_hexa: string;
//     }

//     user:{
//         nom : string;
//         prenom : string;
//         email : string;
//         role : string
//     }

//     skills: Array<{
//         id: number;
//         name : string
//         category : Category
//     }>

//     cv_datas :{
//         education: Education[];
//         other_certifications : Certification[];
//         experiences : Experience[]
//     }

//     diplomes : Array<{
//         id: number;
//         intitule: string;
//         fichier: string;
//     }>
// }

// const fetcher = (url : string) => api.get(url).then(res => res.data.data)

// export default function DetailProfil({params} : {params : Promise <{id: string}>}){
//     const {id} = use(params);
//     const {data, isLoading, error} = useSWR<Candidat>(`/infoProfileCandidat/${id}`, fetcher);
//     const pageLink = `/dashboard/admin/detailProfilCandidat/${id}`;


//     if(isLoading){
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <ThreeDots height="80" width="80" color="#000080" visible={true} />
//             </div>
//         );
//     }

//     if(error){
//         return <div>Failed to load</div>
//     }

//     return(
//         <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
//             <div className="mb-6">
//                 <PageInfo pageName="Candidats" pageLink={pageLink} />
//             </div>

//             <div className="mb-8">
//                 <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Candidats</h1>
//                 <p className="text-slate-500 flex items-center justify-center"><i>Détails du profil candidat</i></p>
//             </div>

//             <div className="bg-white w-full p-4 md:p-6 border border-slate-100 rounded-3xl md:rounded-[3rem] shadow-sm relative">
  
//             {/* Banner Header */}
//             <div className="relative w-full bg-[#000080]/40 h-32 md:h-40 rounded-2xl md:rounded-3xl">
//                 {/* Avatar Container - Centré sur mobile, à gauche sur desktop */}
//                 <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-32 h-32 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-md">
//                     <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
//                         <Avatar 
//                             width={120} 
//                             height={120} 
//                             fontSize={48} 
//                             nom={data?.user.nom} 
//                             prenom={data?.user.prenom} 
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Info Content */}
//             <div className="mt-16 md:mt-6 md:ml-48 flex flex-col md:flex-row md:justify-between md:items-end gap-6 px-4 py-6 md:px-0">
  
//             {/* SECTION INFOS : Texte centré sur mobile, à gauche sur desktop */}
//                 <div className="text-center md:text-left flex-1 min-w-0">
//                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
//                         <h3 className="font-black text-2xl md:text-4xl text-slate-900 tracking-tight truncate">
//                             {data?.user.prenom} {data?.user.nom}
//                         </h3>

//                         <div className="flex items-center gap-2">
//                             {/* Badge de Rang - Style modernisé */}
//                             <span 
//                             className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
//                             style={{ backgroundColor: data?.rank.code_hexa || "#000080" }}
//                             >
//                             Rang {data?.rank.rank}
//                             </span>
                            
//                             {/* Badge de validation (Check) */}
//                             {data?.is_validate && data?.rank.rank !== "E" && (
//                                 <div className="bg-blue-50 p-1 rounded-full">
//                                     <CheckCircle2 size={20} className="text-blue-600 fill-blue-50" />
//                                 </div>
//                             )}
//                         </div>
//                     </div>
                    
//                     {/* Détails métier et ville */}
//                     <div className="space-y-1">
//                     <p className="text-sm md:text-lg font-bold text-slate-600 uppercase tracking-wide">
//                         {data?.domaine_competence || "Domaine non défini"}
//                     </p>
//                     <p className="text-xs md:text-sm text-slate-400 font-medium italic">
//                         {data?.ville || "Ville non précisée"}
//                     </p>
//                     </div>
//                 </div>
//             </div>

//             {/* Bio Section */}
//             <div className="mt-8 border-t border-slate-50 pt-6">
//                 <p className="text-slate-600 text-sm md:text-base leading-relaxed text-center md:text-left">
//                 {data?.bio}
//                 </p>
//             </div>

//             {/* SECTION ACTIONS : Boutons côte à côte même sur mobile */}
//             <div className="flex items-center justify-right md:justify-end gap-3 md:w-auto">
//                 {!data?.is_validate && data?.rank.rank !== "E" && (
//                 <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest bg-[#F0E68C] text-[#000080] hover:bg-[#ece27c] transition-all cursor-pointer shadow-sm active:scale-95 border border-[#d4ca6a]">
//                     Valider
//                 </button>
//                 )}

//                 <button className="flex-1 md:flex-none px-6 py-3 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest bg-[#000080] text-white hover:bg-blue-950 transition-all cursor-pointer shadow-lg shadow-blue-900/20 active:scale-95">
//                 Contacter
//                 </button>
//             </div>
//             </div>

//             <div className="bg-white block w-full mt-4 p-6 border border-default rounded-3xl shadow-xs">

//                 <div className="flex items-center gap-3 mb-8">
//                     <div className="p-2 bg-blue-50 text-[#000080] rounded-lg">
//                         <BrainCircuit size={24} />
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800">Compétences</h2>
//                 </div>

//                 <div className="flex flex-wrap gap-4">
//                     {data?.skills.map((skill) => (
//                         <div key={skill.id} className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm">
//                             <span className="w-2 h-2 rounded-full" style={{backgroundColor: skill.category.color}}></span>
//                             {skill.name}
//                         </div>
//                     ))}
//                 </div>

//             </div>

//             <div className="bg-white block w-full mt-4 p-6 border border-slate-100 rounded-3xl shadow-sm">
//                 <div className="flex items-center justify-between mb-8">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-50 text-[#000080] rounded-lg">
//                             <BrainCircuit size={24} />
//                         </div>
//                         <h2 className="text-xl font-bold text-gray-800">Parcours Académique</h2>
//                     </div>
//                     <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
//                         {data?.diplomes?.length || 0} Diplôme(s)
//                     </span>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {data?.diplomes && data.diplomes.length > 0 ? (
//                         data.diplomes.map((diplome) => (
//                             <div key={diplome.id} className="group flex flex-col p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
//                                 <div className="flex justify-between items-start mb-3">
//                                     <div className="p-2 bg-white rounded-xl shadow-xs">
//                                         <GraduationCap size={20} className="text-[#000080]" />
//                                     </div>
//                                     {/* Boutons d'action rapides */}
//                                     <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
//                                         <button 
//                                             onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/storage/${diplome.fichier}`, '_blank')}
//                                             className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                             title="Voir le document"
//                                         >
//                                             <Eye size={18} />
//                                         </button>
//                                         <a 
//                                             href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${diplome.fichier}`}
//                                             target="_blank"
//                                             download 
//                                             className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
//                                         >
//                                             <Download size={18} />
//                                         </a>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-1">
//                                     <h3 className="font-bold text-gray-900 leading-tight">
//                                         {diplome.intitule}
//                                     </h3>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-span-full py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl">
//                             <GraduationCap size={40} className="text-slate-200 mb-2" />
//                             <p className="text-gray-400 text-sm italic">Aucun diplôme n&apos;a été ajouté par le candidat.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {data?.rank.rank !== "E" && data?.rank.rank !== "D" ? <div className="space-y-8 w-full mx-auto p-6"> 
                
//                 {/* SECTION EXPÉRIENCES */}
//                 <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//                     <div className="flex items-center gap-3 mb-8">
//                         <div className="p-2 bg-blue-50 text-[#000080] rounded-lg">
//                             <Briefcase size={24} />
//                         </div>
//                         <h2 className="text-xl font-bold text-gray-800">Expériences Professionnelles</h2>
//                     </div>

//                     <div className="relative border-l-2 border-gray-100 ml-4 space-y-10">
//                         {data?.cv_datas.experiences ?
//                             (data?.cv_datas.experiences.map((exp, index) => (
//                                 <div key={index} className="relative pl-8">
//                                     {/* Point sur la ligne de temps */}
//                                     <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#000080]"></div>
                                    
//                                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
//                                         <h3 className="text-lg font-bold text-[#000080]">{exp?.JobTitle}</h3>
//                                         <span className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
//                                             <Calendar size={14} /> {exp?.Duration}
//                                         </span>
//                                     </div>
                                    
//                                     <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
//                                         <MapPin size={14} className="text-gray-400" /> {exp?.Company}
//                                     </p>
                                    
//                                     <p className="text-gray-600 leading-relaxed text-sm bg-blue-50/30 p-4 rounded-xl border border-blue-50">
//                                         {exp?.Description}
//                                     </p>
//                                 </div>
//                             ))) : (
//                                 <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
//                                     <Award size={32} className="text-gray-200 mb-2" />
//                                     <p className="text-gray-400 text-sm italic">Aucune expérience</p>
//                                 </div>
//                             )
//                         }
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                     {/* SECTION ÉDUCATION / DIPLÔMES */}
//                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//                         <div className="flex items-center gap-3 mb-6">
//                             <div className="p-2 bg-green-50 text-green-600 rounded-lg">
//                                 <GraduationCap size={24} />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Éducation</h2>
//                         </div>

//                         <div className="space-y-6">
//                             {data?.cv_datas.education && data?.cv_datas.education.length > 0 ? (
//                                 data?.cv_datas.education.map((edu, index) => (
//                                     <div key={index} className="group p-4 rounded-2xl border border-transparent hover:border-green-100 hover:bg-green-50/30 transition-all">
//                                         <h3 className="font-bold text-gray-800 leading-tight mb-1">{edu.Degree}</h3>
//                                         <p className="text-sm text-green-700 font-medium mb-2">{edu.Institution}</p>
//                                         <p className="text-xs text-gray-400 flex items-center gap-1">
//                                             <Calendar size={12} /> {edu.Duration}
//                                     </p>
//                                 </div>
//                             ) )) : (
//                                 <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
//                                     <GraduationCap size={32} className="text-gray-200 mb-2" />
//                                     <p className="text-gray-400 text-sm italic">Aucun diplôme ou formation n&apos;a été ajouté par le candidat.</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* SECTION CERTIFICATIONS */}
//                     <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
//                         <div className="flex items-center gap-3 mb-6">
//                             <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
//                                 <Award size={24} />
//                             </div>
//                             <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
//                         </div>

//                         {data?.cv_datas.other_certifications && data?.cv_datas.other_certifications.length > 0 ? (
//                             <div className="space-y-4">
//                                 {data?.cv_datas.other_certifications.map((cert, index) => (
//                                     <div key={index} className="group p-4 rounded-2xl border border-transparent hover:border-orange-100 hover:bg-orange-50/30 transition-all">
//                                         <h3 className="font-bold text-gray-800 leading-tight mb-1">{cert.CourseName}</h3>
//                                         <p className="text-sm text-orange-700 font-medium mb-2">{cert.Provider}</p>
//                                         <p className="text-xs text-gray-400 flex items-center gap-1">
//                                             <Calendar size={12} /> {cert.Date}
//                                         </p>
//                                     </div>
//                                 ))}
//                             </div>
//                         ) : (
//                             <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
//                                 <Award size={32} className="text-gray-200 mb-2" />
//                                 <p className="text-gray-400 text-sm italic">Aucune certification renseignée</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div> : ""}
//         </div>

//     )

// }

'use client';

import React, { use } from 'react';
import api from "@/lib/api";
import useSWR from "swr";
import { ThreeDots } from 'react-loader-spinner';
import PageInfo from "@/components/PageInfo";
import Avatar from "@/components/Avatar";
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Calendar, 
  MapPin, 
  BrainCircuit, 
  CheckCircle2, 
  Eye, 
  Download, 
  Mail, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  FileText,
  Clock,
  Send,
} from 'lucide-react';

interface Category {
  name: string;
  color: string;
}

interface Experience {
  JobTitle: string;
  Duration: string;
  Company: string;
  Description: string;
}

interface Education {
  Degree: string;
  Institution: string;
  Duration: string;
}

interface Certification {
  CourseName: string;
  Provider: string;
  Date: string;
}

interface Candidat {
  domaine_competence: string;
  niveau_etude: string;
  bio: string;
  ville: string;
  is_validate: boolean;
  score: number;

  rank: {
    label: string;
    rank: string;
    points: number;
    color: string;
    code_hexa: string;
  };

  user: {
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };

  skills: Array<{
    id: number;
    name: string;
    category: Category;
  }>;

  cv_datas?: {
    education?: Education[];
    other_certifications?: Certification[];
    experiences?: Experience[];
  };

  diplomes: Array<{
    id: number;
    intitule: string;
    fichier: string;
  }>;
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function DetailProfil({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useSWR<Candidat>(`/infoProfileCandidat/${id}`, fetcher);
  const pageLink = `/dashboard/admin/detailProfilCandidat/${id}`;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] gap-4">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
        <p className="text-slate-500 font-semibold text-sm animate-pulse">Chargement du profil candidat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
          <FileText size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Erreur de chargement</h3>
        <p className="text-slate-500 max-w-md text-sm mb-6">Impossible de récupérer les informations du profil candidat.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-[#000080] text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-[#000060] transition-all shadow-md"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const rankColor = data?.rank?.code_hexa || "#000080";
  const experiences = data?.cv_datas?.experiences || [];
  const educationList = data?.cv_datas?.education || [];
  const certifications = data?.cv_datas?.other_certifications || [];

  return (
    <div className="min-h-screen relative p-4 md:p-8 font-sans">
      
        {/* ⚠️ CONSERVÉ TEL QUEL : PageInfo & Titre */}
        <div className="mb-6">
            <PageInfo pageName="Candidats" pageLink={pageLink} />
        </div>

        <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Candidats</h1>
            <p className="text-slate-500 flex items-center justify-center"><i>Détails du profil candidat</i></p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">

        {/* CARTE HERO / PROFIL PRINCIPAL — version simple */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 md:p-8">
    
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

        {/* Infos principales */}
        <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl md:text-2xl font-black text-slate-900">
            {data?.user.prenom} {data?.user.nom}
            </h2>

            <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider text-white"
            style={{ backgroundColor: rankColor }}
            >
            Rang {data?.rank.rank || 'E'}
            </span>

            {data?.is_validate ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                <ShieldCheck size={12} />
                Vérifié
            </span>
            ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                <Clock size={12} />
                En attente
            </span>
            )}
        </div>

        <p className="text-sm font-bold text-[#000080] flex items-center gap-2">
            <Briefcase size={15} />
            {data?.domaine_competence || "Apprenti Junior Jobsy"}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 font-medium pt-1">
            {data?.ville && (
            <span className="flex items-center gap-1.5">
                <MapPin size={13} />
                {data.ville}
            </span>
            )}
            {data?.user.email && (
            <span className="flex items-center gap-1.5">
                <Mail size={13} />
                {data.user.email}
            </span>
            )}
            {data?.niveau_etude && (
            <span className="flex items-center gap-1.5">
                <GraduationCap size={13} />
                {data.niveau_etude}
            </span>
            )}
            <span className="flex items-center gap-1.5">
            <Sparkles size={13} />
            {data?.score || 0} XP
            </span>
        </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
        {!data?.is_validate && data?.rank.rank !== "E" && (
            <button className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#F0E68C] text-[#000080] hover:bg-[#ece27c] transition-colors border border-[#d4ca6a]">
            Valider
            </button>
        )}
        
            <a href={`mailto:${data?.user.email}`}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#000080] text-white hover:bg-[#000060] transition-colors flex items-center gap-2"
            >
            <Send size={14} />
            Contacter
        </a>
        </div>
            </div>

            {/* Bio */}
            {data?.bio && (
                <p className="text-sm text-slate-600 leading-relaxed mt-5 pt-5 border-t border-slate-100">
                {data.bio}
                </p>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLONNE GAUCHE (2/3) : Compétences, Expériences & Formations */}
          <div className="lg:col-span-2 space-y-6">

            {/* COMPÉTENCES */}
            <div className="bg-white p-6 md:p-8 border border-slate-200/80 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-[#000080] rounded-xl border border-indigo-100/60">
                    <BrainCircuit size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Compétences & Expertise</h3>
                    <p className="text-xs text-slate-400">Savoir-faire techniques et qualités comportementales</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                  {data?.skills?.length || 0}
                </span>
              </div>

              {data?.skills && data.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {data.skills.map((skill) => (
                    <div 
                      key={skill.id} 
                      className="group flex items-center gap-2 bg-slate-50 hover:bg-white border border-slate-200/80 hover:border-indigo-200 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 transition-all shadow-2xs hover:shadow-sm"
                    >
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: skill.category?.color || '#000080' }}
                      />
                      <span>{skill.name}</span>
                      {skill.category?.name && (
                        <span className="text-[10px] text-slate-400 font-medium ml-1 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                          {skill.category.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BrainCircuit size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Aucune compétence renseignée pour ce candidat.</p>
                </div>
              )}
            </div>

            {/* EXPÉRIENCES PROFESSIONNELLES */}
            <div className="bg-white p-6 md:p-8 border border-slate-200/80 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Expériences Professionnelles</h3>
                    <p className="text-xs text-slate-400">Historique des postes et responsabilités</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                  {experiences.length}
                </span>
              </div>

              {experiences.length > 0 ? (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {experiences.map((exp, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-7.75 top-1.5 w-4 h-4 rounded-full bg-white border-4 border-amber-500 shadow-xs"></div>
                      <div className="bg-slate-50/70 group-hover:bg-white p-4 md:p-5 rounded-2xl border border-slate-100 group-hover:border-amber-200 group-hover:shadow-sm transition-all">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <h4 className="font-bold text-slate-900 text-base">{exp.JobTitle}</h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200/60 shrink-0">
                            <Calendar size={12} className="text-amber-500" />
                            {exp.Duration}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#000080] flex items-center gap-1.5 mb-2">
                          <Building2 size={13} />
                          {exp.Company}
                        </p>
                        {exp.Description && (
                          <p className="text-xs text-slate-600 leading-relaxed font-normal">
                            {exp.Description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Briefcase size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Aucune expérience enregistrée.</p>
                </div>
              )}
            </div>

            {/* PARCOURS ACADÉMIQUE & DIPLÔMES */}
            <div className="bg-white p-6 md:p-8 border border-slate-200/80 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-[#000080] rounded-xl border border-blue-100">
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Parcours Académique & Diplômes</h3>
                    <p className="text-xs text-slate-400">Pièces justificatives et diplômes certifiés</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-black">
                  {data?.diplomes?.length || 0} Diplôme(s)
                </span>
              </div>

              {data?.diplomes && data.diplomes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.diplomes.map((diplome) => (
                    <div 
                      key={diplome.id} 
                      className="group flex flex-col justify-between p-4 border border-slate-200/80 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-100">
                          <GraduationCap size={20} className="text-[#000080]" />
                        </div>
                        
                        {/* Actions Rapides */}
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/storage/${diplome.fichier}`, '_blank')}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Voir le document"
                          >
                            <Eye size={16} />
                          </button>
                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${diplome.fichier}`}
                            target="_blank"
                            download 
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                            title="Télécharger"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-[#000080] transition-colors">
                          {diplome.intitule}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                          <FileText size={12} />
                          Document vérifié
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <GraduationCap size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-400">Aucun diplôme téléversé pour le moment.</p>
                </div>
              )}
            </div>

          </div>

          <div className="space-y-6">

            {/* FORMATION ACADÉMIQUE DU CV */}
            {educationList.length > 0 && (
              <div className="bg-white p-6 border border-slate-200/80 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <GraduationCap size={20} />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Éducation</h3>
                </div>

                <div className="space-y-4">
                  {educationList.map((edu, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-xs text-slate-900">{edu.Degree}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">{edu.Institution}</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">{edu.Duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUTRES CERTIFICATIONS */}
            {certifications.length > 0 && (
              <div className="bg-white p-6 border border-slate-200/80 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Award size={20} />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Certifications</h3>
                </div>

                <div className="space-y-3">
                  {certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <Award size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{cert.CourseName}</h4>
                        <p className="text-[11px] text-slate-500">{cert.Provider} • {cert.Date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}