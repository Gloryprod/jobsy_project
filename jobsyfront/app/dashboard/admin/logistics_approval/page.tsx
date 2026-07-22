'use client';

import React, { useState } from 'react';
import { Check, X, Package, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import PageInfo from '@/components/PageInfo';
import useSWR, { mutate } from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import toast from 'react-hot-toast';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

interface LogisticEnrollment {
    id: number;
    delivery_status: 'pending' | 'delovered',
    course: {
        title: string;
        validation_mode: string;
        type_contenu: string;
    };
    candidat: {
        user: {
            nom: string;
            prenom: string;
        };
        contact: {
            telephone: string;
        }
    };
    created_at: string;
}

// const mockLogisticsData: LogisticEnrollment[] = [
//     {
//         id: 1,
//         delivery_mode: "logistics",
//         logistic_type: "kit",
//         logistic_status: "En préparation",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "OUINSOU",
//                 prenom: "Jean-Pierre",
//                 telephone: "+229 97 25 48 12"
//             }
//         },
//         created_at: "2026-06-12T10:30:00.000Z"
//     },
//     {
//         id: 2,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Gestionnaire de Stocks & Entrepôts",
//         candidat: {
//             user: {
//                 nom: "GANDONOU",
//                 prenom: "Fatimah",
//                 telephone: "+229 61 14 88 95"
//             }
//         },
//         created_at: "2026-06-14T08:15:00.000Z"
//     },
//     {
//         id: 3,
//         delivery_mode: "logistics",
//         logistic_type: "kit",
//         logistic_status: "Prêt pour expédition",
//         course_title: "Technicien de Distribution Hybride",
//         candidat: {
//             user: {
//                 nom: "MENSAH",
//                 prenom: "Abalo Koffi",
//                 telephone: "+229 65 32 10 74"
//             }
//         },
//         created_at: "2026-06-15T14:00:00.000Z"
//     },
//     {
//         id: 4,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 5,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 6,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 7,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 8,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 9,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 10,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     },
//      {
//         id: 11,
//         delivery_mode: "logistics",
//         logistic_type: "session",
//         logistic_status: "En attente d'atelier",
//         course_title: "Agent Logistique de Terrain",
//         candidat: {
//             user: {
//                 nom: "CHABI",
//                 prenom: "Imourane",
//                 telephone: "+229 90 85 41 23"
//             }
//         },
//         created_at: "2026-06-15T16:45:00.000Z"
//     }
// ];

export default function AdminLogisticsValidation() {
    const { data: logistics, isLoading, error } = useSWR<LogisticEnrollment[]>(`/logistics/pending`, fetcher);

    // const logistics = mockLogisticsData;
    // const isLoading = false;
    // const error = null;

    const logistic_type = "kit"

    const pageLink = "/dashboard/admin/logisticsRequests";

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Logique de Recherche
    const filteredData = logistics?.filter(item =>
        item.candidat.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.candidat.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            // endpoint basé sur l'action reçue
            const response = await api.post(`/logistics/validate/${id}`, { action: action });
            toast.success(response.data.message || "Opération réussie !");
            mutate(`/admin/logistics/pending`);
        } catch (err) {
            toast.error("Erreur lors de l'opération. Veuillez réessayer.");
        }
    }

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-black">Erreur de chargement des requêtes logistiques. Veuillez réessayer plus tard.</p>
        </div>
    );

    return (
        <div className="min-h-screen relative p-4 md:p-2 bg-gray-100">
            <div className="">
                <div className="mb-6">
                    <PageInfo pageName="Validations Logistiques" pageLink={pageLink} />
                </div>

                <div className="mb-8">
                    <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Suivi Formation Logistique Terrain</h1>
                    <p className="text-slate-500 flex items-center justify-center"><i>Validez les kits et les sessions pour débloquer les accès théoriques aux étudiants.</i></p>
                </div>

                {/* Barre de Recherche */}
                <div className="mb-6 relative w-full max-w-sm flex items-end justify-end">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher un candidat ou une formation..."
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
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Candidat</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Formation / Type</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mode Validation</th>
                                {/* <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Statut</th> */}
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date Inscription</th>
                                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {currentItems?.map((item: LogisticEnrollment, index: number) => (
                                <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="p-4 font-bold text-slate-800">{indexOfFirstItem + index + 1}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{item.candidat.user.nom} {item.candidat.user.prenom}</span>
                                            <span className="text-xs text-slate-400 font-mono">{item.candidat.contact ? item.candidat.contact.telephone : "+229 01 97 25 48 12"}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">{item.course.title}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit mt-1 ${
                                                logistic_type === 'kit' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                <span className="flex items-center gap-1">
                                                    {logistic_type === 'kit' ? <Package size={10} /> : <Calendar size={10} />}
                                                    {logistic_type === 'kit' ? 'Kit à livrer' : 'Session Présentiel'}
                                                </span>
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            {item.course.validation_mode == "A" ? "Standard" : item.course.validation_mode == "B" ? "Logistique" : "Expert"}
                                        </span>
                                    </td>
                                    {/* <td className="p-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                            {item.delivery_status == "pending" ? "Non validé" : "Validé"}
                                        </span>
                                    </td> */}
                                    <td className="p-4 text-slate-500">
                                        {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="p-4">
                                        {item.delivery_status == "pending" ? 
                                            <div className="flex justify-center gap-3">
                                                <button 
                                                    onClick={() => handleAction(item.id, 'reject')} 
                                                    title="Rejeter / Annuler" 
                                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm"
                                                >
                                                    <X size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => handleAction(item.id, 'approve')} 
                                                    title="Valider l'étape terrain" 
                                                    className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer flex items-center gap-2 font-black px-6 shadow-sm"
                                                >
                                                    <Check size={20} />
                                                </button>
                                            </div> : 
                                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Validé</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredData?.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={24} className="text-slate-300" />
                            </div>
                            <p className="text-slate-400 font-medium italic">Aucun dossier logistique en attente pour cette recherche.</p>
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
    );
}