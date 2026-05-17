'use client';

import React, { useState } from 'react';
import { Check, X, Phone, Search, ChevronLeft, ChevronRight} from 'lucide-react';
import PageInfo from '@/components/PageInfo';
import useSWR, {mutate} from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import toast from 'react-hot-toast';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

interface Withdrawals {
    id: number;
    amount: number;
    metadata: {
        method: string;
        phone: string;
    };
    wallet: {
        candidat: {
            user: {
                nom: string;
                prenom: string;
            };
        };
    };
    created_at: string;
}

export default function AdminWithdrawals() {
    const { data : withdrawals, isLoading, error } = useSWR<Withdrawals[]>(`/candidats/withdrawals`, fetcher);

    const pageLink = "/dashboard/admin/withdrawRequests";
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 1;

    // 1. Logique de Recherche
    const filteredData = withdrawals?.filter(item =>
        item.wallet.candidat.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.wallet.candidat.user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metadata.phone.includes(searchTerm)
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            const response = await api.post(`/candidats/updateWithdrawalStatus/${id}`, { action: action });
            toast.success(response.data.message);
            mutate(`/candidats/withdrawals`); 
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
        <p className="text-black">Erreur de chargement des requêtes. Veuillez réessayer plus tard.</p>
        </div>
    );

  return (
    <div className="min-h-screen relative p-4 md:p-2 bg-gray-100">
      <div className="">
        <div className="mb-6">
          <PageInfo pageName="Retraits" pageLink={pageLink} />
        </div>

        <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Retraits</h1>
            <p className="text-slate-500 flex items-center justify-center"><i>Validez les requêtes de retrait.</i></p>
        </div>

        {/* Barre de Recherche */}
        <div className="mb-6 relative w-full max-w-sm flex items-end justify-end">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 " size={16} />
          <input
            type="text"
            placeholder="Rechercher un candidat ou un numéro..."
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
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Montant</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Méthode & Numéro</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date de la demande</th>
                <th className="p-6 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems?.map((wd : Withdrawals, index : number) => (
                <tr key={wd.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="p-4 font-bold text-slate-800">{index + 1}</td>
                  <td className="p-4 font-bold text-slate-800">{wd.wallet.candidat.user.nom} {wd.wallet.candidat.user.prenom}</td>
                  <td className="p-4 font-black text-[#000080] text-xl">{wd.amount.toLocaleString()} F</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full w-fit mb-1 ${
                        wd.metadata.method === 'MTN' ? 'bg-yellow-100 text-yellow-700' : 
                        wd.metadata.method === 'MOOV' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {wd.metadata.method}
                      </span>
                      <span className="flex items-center gap-2 font-mono font-bold text-slate-600">
                        <Phone size={14} className="text-slate-400" /> {wd.metadata.phone}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(wd.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <button onClick={() => handleAction(wd.id, 'reject')} title="Refuser" className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-sm">
                        <X size={20} />
                      </button>
                      <button onClick={() => handleAction(wd.id, 'approve')} title="Valider le paiement" className="p-3 bg-emerald-50 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all cursor-pointer flex items-center gap-2 font-black px-6 shadow-sm">
                        <Check size={20} /> 
                      </button>
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
  );
}