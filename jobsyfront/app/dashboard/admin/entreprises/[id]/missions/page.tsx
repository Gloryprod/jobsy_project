'use client';

import useSWR from "swr";
import api from "@/lib/api";
import { use, useState } from "react";
import  PageInfo  from "@/components/PageInfo";
import { ThreeDots } from "react-loader-spinner";
import MissionAdminCard from "@/components/dashboardAdmin/entreprises/MissionAdminCard";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Candidat {

    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;

    user:{
        id: number;
        nom : string;
        prenom : string;
        email : string;
        role : string
    }
   
}

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
    decline_reason: string;
    application : Application
}

interface Application {
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: string;
    completed_at: string;
    updated_at: string;
    mission_offers: MissionOffer
    candidat: Candidat
}

interface Mission {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string;
  deadline: string;
  urgency: 'normal' | 'urgent' | 'premium';
  test_severity: 'light' | 'standard' | 'expert';
  applicants: number;
  type_contrat: string;
  active: boolean;
  min_rank_required: string;
  applications:Application[]
  closed_at:string
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);


export default function MissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: missions = [], isLoading, error } = useSWR<Mission[]>(`/entreprises/${id}/missions`, fetcher);
    const pageLink = `/dashboard/admin/entreprises/${id}/missions`;

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    // 1. Logique de Recherche
    const filteredData = missions?.filter(item =>
        item.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type_contrat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reward.toString().includes(searchTerm.toLowerCase())
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
        <p className="text-black">Erreur de chargement des offres. Veuillez réessayer plus tard.</p>
        </div>
    );

    return (
        <div className="min-h-screen relative p-2 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Entreprise" pageLink={pageLink} />
            </div>

            <div className="mb-8 ">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Missions</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des missions publiées par entreprise</i></p>
            </div>

            {/* Barre de Recherche */}
            <div className="mb-6 mt-2 relative w-full max-w-sm flex items-end justify-end">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 " size={16} />
                <input
                    type="text"
                    placeholder="Rechercher une mission..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-4 bg-white border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all"
                />
            </div>

            
            {currentItems.length > 0 ? currentItems.map(mission => (
                <MissionAdminCard key={mission.id} mission={mission} />
            )) : (
                <div className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={24} className="text-slate-300" />
                    </div>
                    <p className="text-slate-400 font-medium italic">Aucune mission disponible.</p>
                </div>
            )}

            {filteredData!.length === 0 && (
                <div className="p-20 text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={24} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium italic">Aucun résultat pour cette recherche.</p>
                </div>
            )}

            {/* Pagination UI */}
            {totalPages >= 1 && (
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
    )
}