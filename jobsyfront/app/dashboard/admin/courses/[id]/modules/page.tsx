'use client'
import api from "@/lib/api";
import useSWR from "swr";
import { use } from "react";
import { ThreeDots } from 'react-loader-spinner';
import PageInfo from "@/components/PageInfo";
import Link from "next/link";
import Image from "next/image";
import { Edit, Delete, BookOpen, HelpCircle, ChevronLeft, ChevronRight, Search} from "lucide-react";
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useRouter } from "next/navigation"
import React, { useState } from 'react';
 
interface Course {
  id: string;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C';
  delivered_skills: string;
  reward_xp: number;
  reward_asset: string;
  is_active: boolean
}

interface Lesson {
    'module_id': number;
    'title': string;
    'type': 'video' | 'text' | 'pdf' | 'quiz_check';
    'content': string;
    'duration_minutes': number;
    'order': number;
}

interface QuizQuestion {
    'module_id': number;
    'question_text': string;
    'options': string[];
    'points': number;
}

interface Module {
    id: number;
    title: string;
    description: string;
    order: number;
    course: Course;
    lessons: Lesson[];
    quiz_questions: QuizQuestion[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function ModulesPage({ params }: { params: Promise<{ id: string }> }){
    const { id } = use(params);
    const { data, error, isLoading } = useSWR<Module[]>(`/getModules/${id}`, fetcher);
    const router = useRouter();

    const pageLink = `/dashboard/admin/courses/${id}/modules`;

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // 1. Logique de Recherche
    const filteredData = data?.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

     if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>      
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">Erreur de chargement des informations de la formation.</p>
        </div>
    );

    const handleDelete = async (module_id:number) =>{

        const result = await Swal.fire({
            title: `Voulez-vous supprimer ce module ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
        });
        
        if (result.isConfirmed) {
            try {            
                await api.delete(`/modules/${module_id}`)
                toast.success("Suppression effectuée avec succès.");   
                router.refresh()  
            } catch (error: any) {
                const messages = error.response?.data?.message;
                toast.error(messages);
            }
        }
    }

    return(
        <div className="min-h-screen relative p-4 md:p-2 bg-gray-100">
            <div className="">
                <div className="mb-6">
                    <PageInfo pageName="Formations" pageLink={pageLink} />
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Modules</h1>
                    <p className="text-slate-500 flex items-center justify-center"><i>Consultez les modules et lecons associées</i></p>
                </div>

                <div className='pt-12'>

                    <div className="flex justify-end items-end mb-12 mr-2">
                        <Link href={`/dashboard/admin/courses/${id}/modules/create`}>
                            <button className="bg-[#000080] items-center text-white text-md font-medium px-4 py-2 rounded-lg cursor-pointer hover:shadow-lg">Ajouter un module à cette formation</button>
                        </Link>
                    </div>

                    <div className="mb-6 relative w-full max-w-sm flex items-end justify-end">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 " size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher un module..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-4 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-6 w-full">
                        {currentItems?.map((module) => (
                        <div key={module.id} className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100">
                            
                            <div className="grid grid-cols-1 md:grid-cols-12">
                            
                            {/* SECTION IMAGE : Fixe la hauteur pour éviter les déformations */}
                            <div className="md:col-span-4 lg:col-span-3 h-48 md:h-auto relative overflow-hidden">
                                <Image 
                                    src="/homme-au-travail.jpg" 
                                    alt="Module Image" 
                                    fill 
                                    className="object-cover transform group-hover:scale-110 transition-transform duration-700" 
                                />
                            </div>

                            {/* SECTION CONTENU */}
                            <div className="md:col-span-8 lg:col-span-9 p-5 md:p-6 flex flex-col justify-between min-w-0">
                                
                                <div className="flex-1">
                                    {/* L'en-tête utilise flex-nowrap pour bloquer les boutons sur une seule ligne */}
                                    <div className="flex items-start justify-between gap-4 mb-3 flex-nowrap">
                                        
                                        {/* Zone Titre : flex-1 et min-w-0 forcent le titre à respecter l'espace disponible */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="shrink-0 bg-[#000080]/10 text-[#000080] w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold">
                                                {module.order}
                                            </span>
                                            {/* line-clamp-2 évite qu'un titre trop long ne pousse le reste vers le bas */}
                                            <h2 className="text-lg md:text-xl font-bold text-gray-800 line-clamp-2 wrap-break-words">
                                                {module.title}
                                            </h2>
                                        </div>

                                        {/* Actions Admin : shrink-0 empêche les boutons de rétrécir ou de se décaler */}
                                        <div className="flex items-center shrink-0 gap-1">
                                            <Link href={`/dashboard/admin/courses/${id}/modules/${module.id}/edit`}>
                                                <button className="cursor-pointer p-2 hover:bg-blue-50 text-[#000080] rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button onClick={()=> handleDelete(module.id)} className="cursor-pointer p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                                <Delete className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description : line-clamp-3 limite à 3 lignes pour un affichage uniforme */}
                                    <div 
                                        className="text-sm leading-relaxed text-foreground/90 prose prose-sm max-w-none line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: module.description }} 
                                    />
                                </div>

                                {/* Pied de carte : Toujours fixé en bas grâce au justify-between du parent */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                            <BookOpen className="w-4 h-4 text-[#000080]" />
                                            <span>{module.lessons?.length || 0} leçons</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                            <HelpCircle className="w-4 h-4 text-orange-500" />
                                            <span>{module.quiz_questions?.length || 0} Quiz</span>
                                        </div>
                                    </div>
                                    
                                    <button className="text-xs font-bold text-[#000080] uppercase tracking-wider hover:opacity-70">
                                        Détails
                                    </button>
                                </div>
                                
                            </div>
                            </div>
                        </div>
                        ))}
                    </div>

                    {filteredData!.length === 0 && (
                        <div className="p-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic">Aucun résultat pour cette recherche.</p>
                        </div>
                    )}

                    {/* Pagination UI */}
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
            </div>
        </div>
    )
}