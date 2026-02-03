'use client'
import api from "@/lib/api";
import useSWR from "swr";
import {use} from "react";
import { ThreeDots } from 'react-loader-spinner';
import PageInfo from "@/components/PageInfo";
import Avatar from "@/components/Avatar";
import { Briefcase, GraduationCap, Award, Calendar, MapPin } from 'lucide-react';

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

interface Candidat {

    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;

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

    skills: {
        name : string
        category : Category
    }

    cv_datas :{
        education: Education[];
        other_certifications :Array<null>;
        experiences : Experience[]
    }
   
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

    console.log(data)

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Profil Candidat" pageLink={pageLink} />
            </div>

            <div className="bg-white block w-full p-6 border border-default rounded-4xl shadow-xs">
                <div className="w-full bg-[#000080]/40 h-40 rounded-3xl ">

                    <div className="absolute mt-28 ml-8 w-32 h-32 bg-white rounded-full">

                        <div className="mt-2 ml-2 w-28 h-28 bg-gray-200 rounded-full">
                            <Avatar width = {112} height = {112} fontSize = {50} nom = {data?.user.nom} prenom = {data?.user.prenom} />
                        </div> 
                    </div>

                </div>


                <div className="flex justify-left items-start mt-20">
                    <div className="ml-10 space-y-2">
                        <div className="flex justify-between ">
                            <h3 className="font-extrabold text-3xl text-gray-900">{data?.user.nom} {data?.user.prenom} </h3>
                            <span className="font-bold text-sm rounded-2xl p-2 ml-124" style={{backgroundColor: data?.rank.code_hexa , color: "white" }}>Rang {data?.rank.rank}</span>
                        </div>
                        <p className="text-md text-gray-500">{data?.domaine_competence}</p>
                        <p className="text-md text-gray-500">{data?.ville}</p>
                    </div>
                </div> 

                <p className="mt-6 text-body">{data?.bio}</p>    

                <div className="flex items-end justify-end mt-8">
                    <div className="space-x-3 space-y-2">
                        <button className="rounded-3xl text-base bg-[#F0E68C] p-2 text-black">
                            Ajouter aux Favoris
                        </button>

                        <button className="rounded-3xl text-base bg-[#000080] p-2 text-white">
                            Contacter
                        </button>
                    </div>
                </div>                   
            </div>


            <div className="space-y-8 max-w-5xl mx-auto p-4">
                
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
                            {data?.cv_datas.education.map((edu, index) => (
                                <div key={index} className="group p-4 rounded-2xl border border-transparent hover:border-green-100 hover:bg-green-50/30 transition-all">
                                    <h3 className="font-bold text-gray-800 leading-tight mb-1">{edu.Degree}</h3>
                                    <p className="text-sm text-green-700 font-medium mb-2">{edu.Institution}</p>
                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                        <Calendar size={12} /> {edu.Duration}
                                    </p>
                                </div>
                            ))}
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

                        {data?.cv_datas.other_certifications ? (
                            <div className="space-y-4">
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