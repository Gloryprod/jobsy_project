
'use client';

import { useState } from 'react';
import { DataView } from 'primereact/dataview';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import { 
    MapPin, Building2, ChevronDown, ChevronUp, 
    PlayCircle, CheckCircle2, Target, Info, User,
    Download, ChevronLeft, ChevronRight, Search
} from 'lucide-react';
import toast from 'react-hot-toast';

// Tes interfaces restent identiques
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
    application : Application
    status: 'accepted' | 'service_started' | 'in_progress' | 'work_finished' | 'validated' | 'completed' | 'rejected_after_onboarding';
    contract_path: string;
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
    mission: Mission
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

export default function MissionTrackingPage() {
    const { data: offers = [], isLoading, error } = useSWR<MissionOffer[]>('/candidat/my-confirmed-missions', fetcher);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => setExpandedId(expandedId === id ? null : id);

    const handleUpdateStatus = async (offerId: number, nextStatus: string) => {
        try {
            await api.post(`/mission-offers/${offerId}/update-status`, { status: nextStatus });
            toast.success("Mise à jour réussie")
            mutate('/candidat/my-confirmed-missions'); 
        } catch (err) {
            console.error("Erreur de mise à jour", err);
        }
    };

    const getProgress = (status: string) => {
        const steps = { accepted: 20, service_started: 40, in_progress: 60, work_finished: 80, validated: 90, completed: 100 };
        return steps[status as keyof typeof steps] || 0;
    };

    const getStatusSeverity = (status: string) => {
      switch (status) {
        case 'in_progress': return 'info';
        case 'completed': return 'success';
        case 'accepted': return 'warning';
        case 'rejected_after_onboarding': return 'danger';
        default: return null;
      }
    };

    const itemTemplate = (offer: MissionOffer) => {
        const isExpanded = expandedId === offer.id;
        const isFreelance = ['Mission Ponctuelle', 'Freelance'].includes(offer.application.mission.type_contrat);

        return (
            <div className={`m-4 p-4 rounded-3xl border transition-all ${isExpanded ? 'border-[#000080] shadow-xl' : 'border-slate-300 bg-white'}`} key={offer.id}>
                
                {/* ENTÊTE RÉSUMÉE */}
                <div 
                    className="p-5 flex flex-col md:flex-row items-center gap-4 cursor-pointer"
                    onClick={() => toggleExpand(offer.id)}
                >
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-slate-800 uppercase text-sm">{offer.application.mission.title}</h3>
                            <Tag value={status} severity={getStatusSeverity(status)} pt={{ root: { className: 'text-[9px] uppercase px-2' }}} />
                        </div>
                        <div className="flex gap-3 text-xs text-slate-400 font-bold">
                            <span className="flex items-center gap-1"><Building2 size={12}/> {offer.application.mission.company}</span>
                            <span className="flex items-center gap-1"><MapPin size={12}/> {offer.application.mission.location}</span>
                        </div>
                    </div>

                    {offer.started_at && (
                            <a href={`${process.env.NEXT_PUBLIC_API_URL}/storage/${offer.contract_path}`} 
                                target="_blank" 
                                className="flex text-green-500 items-center border-b border-[#000080] rounded-xl p-2 gap-2">
                                <Download size={18} /> Contrat de travail
                            </a>
                        )
                    }

                    <div className="text-right px-6 border-x border-slate-50 hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Salaire prévu</p>
                        <p className="font-black text-[#000080]">{offer.application.mission.reward} FCFA</p>
                    </div>

                    <Button 
                        icon={isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>} 
                        className="p-button-rounded p-button-text text-slate-300" 
                        onClick={(e) => { e.stopPropagation(); toggleExpand(offer.id); }}
                    />
                </div>

                {/* ZONE DE SUIVI DÉTAILLÉE */}
                {isExpanded && (
                    <div className="p-6 bg-slate-50 rounded-b-3xl border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                        
                        {/* 1. Stepper */}
                        <div className="mb-8 max-w-md mx-auto">
                            <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-2">
                                <span>Début</span>
                                <span>En cours</span>
                                <span>Finalisé</span>
                            </div>
                            <ProgressBar value={getProgress(offer.status)} showValue={false} style={{ height: '6px' }} color="#000080" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 2. Instructions de mission */}
                            <div className="md:col-span-2 space-y-4">
                                <div className="bg-[#F0E68C]/30 p-4 rounded-2xl border border-slate-200">
                                    <h4 className="text-xs font-black uppercase text-slate-400 mb-3 flex items-center gap-2">
                                        <Info size={14}/> Instructions de prise de service
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {offer.onboarding_instructions || "Aucune instruction spécifique fournie."}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Lieu exact</span>
                                            <span className="text-xs font-bold">{offer.application.mission.location}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 uppercase font-bold">Contact sur place</span>
                                            <span className="text-xs font-bold flex items-center gap-1"><User size={10}/> {offer.contact_person || 'Non spécifié'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                            </div>

                            {/* 3. Actions contextuelles */}
                            <div className="flex flex-col justify-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                {offer.status === 'accepted' && (
                                    <div className="text-center space-y-4">
                                        <p className="text-xs font-bold text-slate-500 italic">Prêt à commencer ?</p>
                                        <Button 
                                            label="Notifier mon arrivée" 
                                            className="w-full rounded-3xl text-white bg-[#000080] border-none font-black py-4 text-xs tracking-widest"
                                            onClick={() => handleUpdateStatus(offer.id, 'service_started')}
                                        />
                                    </div>
                                )}

                                {offer.status === 'rejected_after_onboarding' && (
                                    <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center space-y-3">
                                        
                                        <h4 className="text-red-700 font-black uppercase text-sm">Entretien non concluant</h4>
                                        <p className="text-xs text-red-600 font-medium">
                                        L&apos;entreprise a décidé de ne pas donner suite après votre prise de service. 
                                        Cette mission est désormais clôturée.
                                        </p>
                                    </div>
                                )}

                                {offer.status === 'service_started' && (
                                    <div className="text-center py-4 text-amber-600 animate-pulse font-black text-[10px] uppercase">
                                        En attente de validation de l&apos;entreprise...
                                    </div>
                                )}

                                {offer.status === 'work_finished' && (
                                    <div className="text-center py-4 text-amber-600 animate-pulse font-black text-[10px] uppercase">
                                        En attente de validation de l&apos;entreprise...
                                    </div>
                                )}

                                {offer.status === 'in_progress' && (
                                    <div className="text-center space-y-4">
                                        <PlayCircle className="mx-auto text-indigo-500" size={32}/>
                                        <Button 
                                            label="Terminer la mission" 
                                            className="w-full rounded-3xl text-white bg-[#000080] border-none font-black py-4 text-xs tracking-widest"
                                            onClick={() => handleUpdateStatus(offer.id, 'work_finished')}
                                        />
                                        
                                    </div>
                                )}

                                {offer.status === 'completed' && (
                                    <div className="text-center space-y-2 text-emerald-600">
                                        <CheckCircle2 className="mx-auto" size={32}/>
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            {isFreelance ? 'Paiement effectué' : 'Recrutement clôturé'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1;

    // 1. Logique de Recherche
    const filteredData = offers?.filter(item =>
        item.application.mission.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem)

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen"><ThreeDots color="#000080" /></div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-[#000080]">
        <p className="text-white">Erreur de chargement des offres. Veuillez réessayer plus tard.</p>
        </div>
    );


    return (
        <div className="bg-slate-50 min-h-screen p-4 md:p-10">
            <div className="max-w-5xl mx-auto">
                <header className="mb-20 mt-10 px-4 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F0E68C]/20 rounded-full">
                      <Target size={16} className="text-[#8B8000]" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8B8000]">Guilde des Opportunités</span>
                    </div>
                    
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-800 tracking-tight">
                      <span className="text-[#000080]">Missions confirmées</span>
                    </h1>
                    
                    <p className="text-slate-500 text-lg w-full mx-auto font-medium">
                      Gérez vos prises de service et validez vos paiements.                    
                    </p>
                </header>

                {currentItems.length > 0 ? <DataView 
                    value={currentItems} 
                    listTemplate={(items) => <div className="flex flex-col">{items.map(itemTemplate)}</div>} 
                    // paginator 
                    // rows={10} 
                /> : (
                    <div className="p-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic">Aucune mission encore confirmée.</p>
                    </div>
                )}

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
        </div>
    );
}