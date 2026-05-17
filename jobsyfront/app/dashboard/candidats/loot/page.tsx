'use client';

import React, { useState } from 'react';
import { 
  Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, 
  CheckCircle, XCircle, Calendar, TrendingUp, 
  Hexagon, X
} from 'lucide-react';
import useSWR from 'swr';
import api from '@/lib/api';
import { useUser } from '@/context/UserProvider';
import { ThreeDots } from 'react-loader-spinner';
import PhoneInput from '@/components/forms/PhoneInput';
import { toast } from 'react-hot-toast';

// Configuration du fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface Transaction {
  id: number;
  type: 'transfer' | 'withdrawal' | 'deposit' | 'fee' ;
  description: string;
  amount: number;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
  payment_method?: string;
}

interface WalletData {
  balance_available: number;
  balance_pending: number;
  total_earned: number;
  transactions: Transaction[];
}

export default function WalletPage() {
  const { user } = useUser();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('');

  // Récupération des données réelles du portefeuille
  const { data, error, mutate, isLoading } = useSWR<WalletData>(`/candidat/wallet/`,fetcher);

  const handleWithdraw = async () => {
  // 1. Validation de base ; || Number(withdrawAmount) < 1000
  if (!withdrawAmount || Number(withdrawAmount) > (data?.balance_available || 0)) {
    toast.error("Le montant demandé dépasse votre solde disponible");
    return;
  }
  if (!selectedMethod) {
    toast.error("Veuillez choisir un réseau Mobile Money");
    return;
  }
  if (!phoneNumber) {
    toast.error("Veuillez saisir votre numéro de téléphone");
    return;
  }

  setLoadingRequest(true);

  try {
    const response = await api.post('/candidat/withdraw', {
      amount: withdrawAmount,
      payment_method: selectedMethod,
      phone_number: phoneNumber,
      candidat_id: user?.candidat?.id // Assure-toi que l'ID est disponible
    });

    // 2. Succès
    toast.success(response.data.message);
    setWithdrawAmount('');
    setPhoneNumber('');
    setSelectedMethod('');
    setShowWithdrawModal(false);
    
    // 3. Rafraîchir les données de la wallet (SWR)
    mutate(); 
    
  } catch (error: any) {
    const errorMsg = error.response?.data?.message || "Une erreur est survenue lors du retrait";
    toast.error(errorMsg);
  } finally {
    setLoadingRequest(false);
  }
};

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-6 pb-24 text-slate-900 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 space-y-10">

        {/* ==================== HEADER DYNAMIQUE ==================== */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#000080] to-[#4B0082]" />
          
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
                <Hexagon className="w-20 h-20" fill="#000080" stroke="white" strokeWidth={1} />
                <Wallet className="absolute inset-0 m-auto text-[#F0E68C] w-9 h-9" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-[#000080] uppercase tracking-tight">
                    Mon Coffre-fort
                </h1>
                <p className="text-slate-500 font-medium italic mt-1">
                    Gère tes gains. Retrait sécurisé vers Mobile Money.
                </p>
            </div>
          </div>

          <button
            onClick={() => setShowWithdrawModal(true)}
            className="cursor-pointer shrink-0 px-8 py-4 bg-[#000080] text-white font-black rounded-2xl shadow-xl hover:shadow-[#000080]/30 transition-all hover:-translate-y-1 active:scale-95 uppercase tracking-wider text-sm"
          >
            Retirer le solde disponible
          </button>
        </header>

        {/* ==================== SOLDES RÉELS ==================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Disponible', val: data?.balance_available || 0, icon: ArrowDownToLine, color: 'text-[#000080]', bg: 'bg-blue-50', border: 'border-blue-100' },
            { label: 'En attente', val: data?.balance_pending || 0, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' },
            { label: 'Total Amassé', val: data?.total_earned || 0, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' }
          ].map((stat, idx) => (
            <div key={idx} className={`bg-white ${stat.border} border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all text-center group`}>
              <div className={`p-3 ${stat.bg} ${stat.color} rounded-full inline-flex mb-4 group-hover:rotate-12 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{(stat.val).toLocaleString()} F</p>
            </div>
          ))}
        </div>

        {/* ==================== JOURNAL DES TRANSACTIONS RÉELLES ==================== */}
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-3 mb-8 px-2">
            <Calendar className="text-[#F0E68C]" size={24} />
            <h2 className="text-xl font-black text-[#000080] uppercase tracking-tight">Journal des transactions liées à mon compte</h2>
          </div>

          <div className="space-y-3">
            {data?.transactions && data.transactions.length > 0 ? (
              data.transactions.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-slate-50 transition-all flex items-center justify-between rounded-2xl border border-slate-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tx.type === 'transfer' ? 'bg-[#F0E68C]/10 text-[#8B8000]' : 'bg-slate-50 text-slate-400'}`}>
                        {tx.type === 'transfer' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm md:text-base leading-tight">{tx.description}</p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase mt-1">
                        <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(tx.status)} {tx.status === 'completed' ? 'Succès' : 'En cours'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-xl font-black ${tx.type === 'withdrawal' ? 'text-slate-400' : 'text-[#000080]'}`}>
                    {tx.type === 'transfer' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()} F
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium italic">Aucune transaction réalisée pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* ==================== MODAL DE RETRAIT DYNAMIQUE ==================== */}
        {showWithdrawModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto no-scrollbar border border-slate-200 p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#000080] to-[#4B0082]" />
              
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-[#000080] uppercase tracking-tighter text-center w-full">Retrait  </h2>
                <button onClick={() => setShowWithdrawModal(false)} className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition p-2 bg-slate-100 rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 text-center">
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Montant disponible</p>
                  <p className="text-3xl font-black text-[#000080]">{data?.balance_available.toLocaleString() || 0} F CFA</p>
                </div>

                <div className="space-y-2">
                  <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-2">Montant du transfert</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[#000080] text-3xl font-black text-center outline-none focus:border-[#000080] transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <p className="text-slate-500 text-[11px] font-black uppercase tracking-widest ml-2 block">Réseau Mobile Money</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button 
                      onClick={() => setSelectedMethod('MTN')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all font-black ${
                        selectedMethod === 'MTN' 
                        ? 'border-yellow-400 bg-yellow-50 text-yellow-600 scale-95 shadow-inner' 
                        : 'border-yellow-100 bg-white text-yellow-600 hover:border-yellow-400'
                      }`}
                    >
                      MTN
                    </button>

                    <button 
                      onClick={() => setSelectedMethod('MOOV')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all font-black ${
                        selectedMethod === 'MOOV' 
                        ? 'border-[#000080] bg-blue-50 text-[#000080] scale-95 shadow-inner' 
                        : 'border-blue-100 bg-white text-[#000080] hover:border-[#000080]'
                      }`}
                    >
                      MOOV
                    </button>

                    <button 
                      onClick={() => setSelectedMethod('CELTIIS')}
                      className={`cursor-pointer p-5 rounded-2xl border-2 transition-all font-black ${
                        selectedMethod === 'CELTIIS' 
                        ? 'border-green-400 bg-green-50 text-green-600 scale-95 shadow-inner' 
                        : 'border-green-100 bg-white text-green-600 hover:border-green-400'
                      }`}
                    >
                      CELTIIS
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Numéro Mobile Money (Bénin)</label>
                  <div className="relative">
                   <PhoneInput
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                    />
                  </div>
                </div>

                <button
                  onClick={handleWithdraw}
                  disabled={loadingRequest || !withdrawAmount}
                  className="cursor-pointer w-full py-4 bg-[#000080] text-white font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest disabled:opacity-50"
                >
                  {loadingRequest ? "Envoi au conseil..." : "Confirmer le transfert"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}