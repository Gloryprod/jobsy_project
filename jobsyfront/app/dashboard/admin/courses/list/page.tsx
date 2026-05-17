'use client';

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PageInfo from '@/components/PageInfo';
import useSWR from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import toast from 'react-hot-toast';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react" 
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation" 
import Swal from 'sweetalert2';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

interface Course {
  id: number;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C';
  delivered_skills: string;
  reward_xp: number;
  reward_asset: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminCourses() {
    const { data : courses, isLoading, error } = useSWR<Course[]>(`/courses`, fetcher);
    const [showDetails, setShowDetails] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    
    const pageLink = "/dashboard/admin/courses/list";

    const router = useRouter();

    const skills = Array.isArray(selectedCourse?.delivered_skills) 
    ? selectedCourse.delivered_skills 
    : (selectedCourse?.delivered_skills?.split(',') || []);

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Logique de Recherche
    const filteredData = courses?.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

    const handleDelete = async (course_id:number) =>{

        const result = await Swal.fire({
        title: `Voulez-vous supprimer cette formation ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        });
        
        if (result.isConfirmed) {
            try {            
                await api.delete(`/courses/${course_id}`)
                toast.success("Suppression effectuée avec succès.");   
                router.refresh()            
            } catch (error: any) {
                const messages = error.response?.data?.message;
                toast.error(messages);
            }
        }
    }

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    if (error) return (     
        <div className="min-h-screen flex items-center justify-center">
        <p className="text-black">Erreur de chargement des formations. Veuillez réessayer plus tard.</p>
        </div>
    );

  return (
    <div className="min-h-screen relative p-4 md:p-2 bg-gray-100">
        <div className="">
            <div className="mb-6">
                <PageInfo pageName="Formations" pageLink={pageLink} />
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Formations</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Consultez les formations disponibles.</i></p>
            </div>

            <div className='pt-12'>

                <div className="flex justify-end items-end mb-12 mr-2">
                    <Link href="/dashboard/admin/courses/create">
                        <button className="bg-[#000080] items-center  text-white text-md font-medium px-4 py-2 rounded-lg cursor-pointer">Ajouter une formation</button>
                    </Link>
                </div>

                {/* Barre de Recherche */}
                <div className="mb-6 relative w-full max-w-sm flex items-end justify-end">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 " size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher une formation..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-4 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all"
                    />
                </div>

                <div className="bg-white rounded-4xl border border-slate-100 overflow-x-auto no-scrollbar shadow-xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">#</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Titre</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mode de validation</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Points</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date de création</th>
                            <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                        {currentItems?.map((course : Course, index : number) => (
                            <tr key={course.id} className="hover:bg-blue-50/30 transition-colors group">
                            <td className="p-4 font-bold text-slate-800">{index + 1}</td>
                            <td className="p-4 font-bold text-slate-800">{course.title}</td>
                            <td className="p-4 font-black text-slate-600">{course.validation_mode === 'A' ? 'Standard' : course.validation_mode === 'B' ? 'Logistique' : 'Expert'}</td>
                            <td className="p-4 font-black text-[#000080] text-xl">{course.reward_xp}</td>
                            <td className="p-4 text-slate-500">{new Date(course.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                            <td className="p-4">
                                <div className="flex justify-center gap-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem onClick={() => {setShowDetails(true); setSelectedCourse(course); }} className="cursor-pointer">
                                            <Eye className="h-4 w-4" /> Détails
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/courses/${course.id}`)} className="cursor-pointer">
                                            <Edit className="h-4 w-4" />
                                            Modifier
                                        </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/courses/${course.id}/modules  `)} className="cursor-pointer"><Eye className="h-4 w-4" />Modules</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => handleDelete(course.id)}><Trash className="h-4 w-4" />Supprimer</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                            </tr>
                            
                        ))}
                        </tbody>
                    </table>
                    
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
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
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
        {/* Modal de détails */}
        {selectedCourse && (
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="w-full rounded-3xl">
            <DialogHeader>
                <div className="flex justify-between items-start">
                <div>
                    <DialogTitle className="text-2xl font-bold">{selectedCourse.title}</DialogTitle>
                    {/* <DialogDescription className="text-lg text-primary">{mission.company}</DialogDescription> */}
                </div>
                
                </div>
            </DialogHeader>

            <div className="py-4 -mx-4 px-4 overflow-y-auto max-h-[60vh] no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Colonne Description - Prend plus de place (2/3) */}
                    <div className="lg:col-span-2 space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            À propos de la formation
                        </h4>
                        <div 
                            className="text-sm leading-relaxed text-foreground/90 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: selectedCourse.description }} 
                        />
                    </div>

                    {/* Colonne Compétences - Plus étroite (1/3) */}
                    <div className="space-y-4 bg-secondary/10 p-4 rounded-xl border border-border/50 h-fit">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Compétences
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <Badge key={i} variant="outline" className="bg-background shadow-sm">
                                        {skill.trim()}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            </DialogContent>
        </Dialog>
        )}
        
    </div>


  );
}