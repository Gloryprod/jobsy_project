'use client'
import api from "@/lib/api";
import useSWR from "swr";
import {use} from "react";
import { ThreeDots } from 'react-loader-spinner';
import PageInfo from "@/components/PageInfo";
import Avatar from "@/components/Avatar";
import { Briefcase, GraduationCap, Award, Calendar, MapPin, BrainCircuit, CheckCircle2, Eye, Download } from 'lucide-react';

interface Category{
    name : string
    color : string
}

interface Experience {
    JobTitle : string;
    Duration: string;
    Company : string;
    Description : string;
}

interface Education {
    Degree : string;
    Institution: string;
    Duration : string;
}

interface Certification {
    CourseName: string;
    Provider: string;
    Date: string;
}

interface Candidat {

    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;
    is_validate: boolean;

    rank : {
        label: string;
        rank: string;
        points: number;
        color: string;
        code_hexa: string;
    }

    user:{
        nom : string;
        prenom : string;
        email : string;
        role : string
    }

    skills: Array<{
        id: number;
        name : string
        category : Category
    }>

    cv_datas :{
        education: Education[];
        other_certifications : Certification[];
        experiences : Experience[]
    }

    diplomes : Array<{
        id: number;
        intitule: string;
        fichier: string;
    }>
}

const fetcher = (url : string) => api.get(url).then(res => res.data.data)

export default function DetailProfil({params} : {params : Promise <{id: string}>}){
    const {id} = use(params);
    const {data, isLoading, error} = useSWR<Candidat>(`/showProfileCandidat/${id}`, fetcher);
    const pageLink = `/dashboard/entreprises/detailProfilCandidat/${id}`;


    if(isLoading){
        return (
            <div className="flex justify-center items-center h-screen">
                <ThreeDots height="80" width="80" color="#000080" visible={true} />
            </div>
        );
    }

    if(error){
        return <div>Failed to load</div>
    }

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Candidats" pageLink={pageLink} />
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Candidats</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Détails du profil candidat</i></p>
            </div>

            <div className="bg-white w-full p-4 md:p-6 border border-slate-100 rounded-2xl md:rounded-[3rem] shadow-sm relative">
  
            <div className="relative w-full bg-[#000080]/40 h-32 md:h-40 rounded-2xl md:rounded-3xl">
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 w-32 h-32 md:w-32 md:h-32 bg-white rounded-full p-1 shadow-md">
                    <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                        <Avatar 
                            width={120} 
                            height={120} 
                            fontSize={48} 
                            nom={data?.user.nom} 
                            prenom={data?.user.prenom} 
                        />
                    </div>
                </div>
            </div>

            {/* Info Content */}
            <div className="mt-14 md:mt-4 md:ml-44 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="text-center md:text-left space-y-1">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h3 className="font-black text-2xl md:text-3xl text-gray-900">
                        {data?.user.nom} {data?.user.prenom}
                        </h3>

                        {/* Badge de Rang */}
                        <span 
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: data?.rank.code_hexa || "#000080" }}
                        >
                        Rang {data?.rank.rank}
                        </span>
                        
                        {/* Badge de validation (Check) */}
                        {data?.is_validate ? (
                            <CheckCircle2 size={24} className="text-green-600 fill-blue-50" />
                        ) : ""}

                    </div>
                    
                    <p className="text-sm md:text-md font-bold text-slate-500 uppercase tracking-tight">
                        {data?.domaine_competence}
                    </p>
                    <p className="text-xs md:text-sm text-slate-400 font-medium">
                        {data?.ville}
                    </p>
                </div>

                {/* Actions - Empilées sur mobile, ligne sur desktop */}
                <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-2 md:mt-0">
                    {/* N'affiche le bouton "Valider" QUE si le profil n'est pas encore validé */}
                    <button className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#000080] text-white hover:bg-blue-900 transition-all cursor-pointer shadow-md">
                        Contacter
                    </button>
                </div>
            </div> 

            {/* Bio Section */}
            <div className="mt-8 border-t border-slate-50 pt-6">
                <p className="text-slate-600 text-sm md:text-base leading-relaxed text-center md:text-left">
                {data?.bio}
                </p>
            </div>
            </div>

            <div className="bg-white block w-full mt-4 p-6 border border-default rounded-3xl shadow-xs">

                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-50 text-[#000080] rounded-lg">
                        <BrainCircuit size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Compétences</h2>
                </div>

                <div className="flex flex-wrap gap-4">
                    {data?.skills.map((skill) => (
                        <div key={skill.id} className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm">
                            <span className="w-2 h-2 rounded-full" style={{backgroundColor: skill.category.color}}></span>
                            {skill.name}
                        </div>
                    ))}
                </div>

            </div>

            
            <div className="space-y-8 w-full mx-auto p-6">
                
                {/* SECTION EXPÉRIENCES */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-50 text-[#000080] rounded-lg">
                            <Briefcase size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Expériences Professionnelles</h2>
                    </div>

                    <div className="relative border-l-2 border-gray-100 ml-4 space-y-10">
                        {data?.cv_datas.experiences ?
                            (data?.cv_datas.experiences.map((exp, index) => (
                                <div key={index} className="relative pl-8">
                                    {/* Point sur la ligne de temps */}
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-[#000080]"></div>
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                                        <h3 className="text-lg font-bold text-[#000080]">{exp?.JobTitle}</h3>
                                        <span className="flex items-center gap-1 text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                                            <Calendar size={14} /> {exp?.Duration}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-700 font-semibold mb-2 flex items-center gap-2">
                                        <MapPin size={14} className="text-gray-400" /> {exp?.Company}
                                    </p>
                                    
                                    <p className="text-gray-600 leading-relaxed text-sm bg-blue-50/30 p-4 rounded-xl border border-blue-50">
                                        {exp?.Description}
                                    </p>
                                </div>
                            ))) : (
                                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <Award size={32} className="text-gray-200 mb-2" />
                                    <p className="text-gray-400 text-sm italic">Aucune expérience</p>
                                </div>
                            )
                        }
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* SECTION ÉDUCATION / DIPLÔMES */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                                <GraduationCap size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Éducation</h2>
                        </div>

                        <div className="space-y-6">
                            {data?.cv_datas.education && data?.cv_datas.education.length > 0 ? (
                                data?.cv_datas.education.map((edu, index) => (
                                    <div key={index} className="group p-4 rounded-2xl border border-transparent hover:border-green-100 hover:bg-green-50/30 transition-all">
                                        <h3 className="font-bold text-gray-800 leading-tight mb-1">{edu.Degree}</h3>
                                        <p className="text-sm text-green-700 font-medium mb-2">{edu.Institution}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} /> {edu.Duration}
                                    </p>
                                </div>
                            ) )) : (
                                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
                                    <GraduationCap size={32} className="text-gray-200 mb-2" />
                                    <p className="text-gray-400 text-sm italic">Aucun diplôme ou formation n&apos;a été ajouté par le candidat.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* SECTION CERTIFICATIONS */}
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                <Award size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">Certifications</h2>
                        </div>

                        {data?.cv_datas.other_certifications && data?.cv_datas.other_certifications.length > 0 ? (
                            <div className="space-y-4">
                                {data?.cv_datas.other_certifications.map((cert, index) => (
                                    <div key={index} className="group p-4 rounded-2xl border border-transparent hover:border-orange-100 hover:bg-orange-50/30 transition-all">
                                        <h3 className="font-bold text-gray-800 leading-tight mb-1">{cert.CourseName}</h3>
                                        <p className="text-sm text-orange-700 font-medium mb-2">{cert.Provider}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} /> {cert.Date}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-100 rounded-2xl">
                                <Award size={32} className="text-gray-200 mb-2" />
                                <p className="text-gray-400 text-sm italic">Aucune certification renseignée</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    )

}