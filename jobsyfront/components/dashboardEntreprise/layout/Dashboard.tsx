'use client';
import useSWR from 'swr';
import api from '@/lib/api';
import { ThreeDots } from 'react-loader-spinner';
import { Archive, ArrowRight, Briefcase, ClipboardCheck, LayoutDashboard, MapPin, RefreshCw, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useKKiaPay } from 'kkiapay-react';
import { toast } from 'react-hot-toast';

interface Candidat{
    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;
    user:{
        nom : string;
        prenom : string;
        email : string;
        role : string
    }
    rank: {
        id: number;
        label: string;
        rank: string;
        code_hexa: string;
    }
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
  applications_count: number;
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
    candidat: Candidat;
    mission: Mission
}

interface Stats {
    stats: {
        open_jobs_count: number;
        deactivated_jobs_count: number;
        closed_jobs_count: number;
        active_offers_count: number;
        wallet_balance: number;
        balance_locked: number;
    };
    candidatures_a_chaud : Application[];
    missions_terminees : Mission[];
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function EntreprisesDashboardPage() {
    const { data, error, isLoading } = useSWR<Stats>('/index', fetcher);
    const { data : transactions, error: transactionError, isLoading: isTransactionLoading } = useSWR('/transactions-history', fetcher);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const candidatures = data?.candidatures_a_chaud || [];
    const missionsTerminees = data?.missions_terminees || [];
    const [isDepositOpen, setIsDepositOpen] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const { openKkiapayWidget } = useKKiaPay();

    if (isLoading || isTransactionLoading) {
      return (
        <div className="flex justify-center items-center h-[60vh]">
          <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
      );
    }

    if (error || transactionError) {
      return (
        <div className="rounded-2xl p-10 text-center">
          <p className="text-red-500 font-bold">Erreur de chargement de la page.</p>
        </div>
      );
    }

    const stats = data?.stats || {
      open_jobs_count: 0,
      deactivated_jobs_count: 0,
      closed_jobs_count: 0,
      active_offers_count: 0,
      wallet_balance: 0,
      balance_locked: 0,
    };

    const handleWalletDeposit = async (amount: string) => {
        try {
            const response = await api.post('/entreprise/wallet/initiate-deposit', { amount: parseInt(amount) });
            const { public_key, entreprise_id } = response.data.data;
            console.log(public_key, entreprise_id);

            openKkiapayWidget({
                amount: parseInt(amount),
                api_key: public_key,
                sandbox: true, 
                phone: "97000000",
                data: JSON.stringify({
                    entreprise_id: entreprise_id,
                    type: "wallet_topup" 
                }), 
            }); 

        } catch (err: unknown) {
            toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || "Une erreur est survenue lors de l'initiation du dépôt.");
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 min-h-screen">
      
            {/* 1. EN-TÊTE BIENVENUE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 md:p-8 rounded-4xl border border-slate-100 shadow-sm">
                <div>
                <h1 className="text-2xl md:text-4xl font-black text-slate-950 tracking-tight flex items-center gap-3">
                    <LayoutDashboard className="text-[#000080]" size={32} />
                    Espace Recruteur
                </h1>
                <p className="text-slate-500 text-sm md:text-base font-medium mt-1">
                    Gérez vos quêtes de recrutement et propulsez des talents sans diplôme.
                </p>
                </div>
                <Link href="/dashboard/entreprises/missions/create" className="w-full md:w-auto">
                    <button className="w-full md:w-auto px-6 py-4 bg-[#000080] text-white font-black text-xs uppercase tracking-widest rounded-2xl border-b-4 border-blue-950 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-blue-900/20 cursor-pointer">
                        + Publier une mission
                    </button>
                </Link>
            </div>

            {/* 2. GRILLE DES STATISTIQUES (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Offres Ouvertes */}
                <div className="bg-white p-5 md:p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Ouvertes</span>
                    <div className="p-2 bg-blue-50 text-[#000080] rounded-xl"><ClipboardCheck size={16} /></div>
                </div>
                <span className="text-3xl md:text-4xl font-black text-slate-900 mt-4">{stats.open_jobs_count || 0}</span>
                </div>

                {/* Candidatures en attente */}
                <div className="bg-white p-5 md:p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Désactivées</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Users size={16} /></div>
                </div>
                <span className="text-3xl md:text-4xl font-black text-slate-900 mt-4">{stats.deactivated_jobs_count || 0}</span>
                </div>

                {/* Offres Actives / En cours */}
                <div className="bg-white p-5 md:p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Contrats Actifs/Finis</span>
                    <div className="p-2 bg-green-50 text-green-600 rounded-xl"><Briefcase size={16} /></div>
                </div>
                <span className="text-3xl md:text-4xl font-black text-slate-900 mt-4">{stats.active_offers_count || 0}</span>
                </div>

                {/* Clôturées */}
                <div className="bg-white p-5 md:p-6 rounded-4xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Archives</span>
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Archive size={16} /></div>
                </div>
                <span className="text-3xl md:text-4xl font-black text-slate-900 mt-4">{stats.closed_jobs_count || 0}</span>
                </div>
            </div>

            {/* 3. SECTION DU MILIEU : BI-COLONNE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                
                {/* COLONNE GAUCHE (2/3) : Candidatures récentes */}
                <div className="lg:col-span-2 bg-white  p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                                Candidatures récentes à traiter ({candidatures.length})
                            </h2>
                        </div>

                        {candidatures.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-slate-400 font-medium text-sm">Aucune nouvelle candidature pour le moment.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                            {candidatures.map((app) => (
                                <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    {/* Badge Initial / Avatar Miniature */}
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-700 text-sm border border-slate-200">
                                    {app.candidat?.user?.prenom?.[0]}{app.candidat?.user?.nom?.[0]}
                                    </div>
                                    <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="font-bold text-slate-900 text-sm md:text-base">
                                        {app.candidat?.user?.prenom} {app.candidat?.user?.nom}
                                        </h4>
                                        <span 
                                        className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase text-white shadow-sm"
                                        style={{ backgroundColor: app.candidat?.rank?.code_hexa || "#000080" }}
                                        >
                                        Rang {app.candidat?.rank?.rank || "Nouveau"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        Postule pour : <span className="text-[#000080] font-bold">{app.mission?.title}</span>
                                    </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1 sm:hidden">
                                    <MapPin size={12} /> {app.candidat?.ville || "Bénin"}
                                    </span>

                                    <Link href={`/dashboard/entreprises/missions/${app.mission?.id}/applications`} className="ml-auto sm:ml-0">
                                        <button className="px-4 py-2 bg-blue-50 hover:bg-[#000080] text-[#000080] hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ml-auto sm:ml-0">
                                            Analyser <ArrowRight size={14} />
                                        </button>
                                    </Link>
                                </div>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>                   
                </div>

                {/* COLONNE DROITE (1/3) : Missions terminées à relancer */}
                <div className="bg-transparent space-y-6">
  
                    {/* WIDGET WALLET : Effet Carte de Crédit Gaming/Premium */}
                    <div className="bg-linear-to-br from-[#000080] to-blue-900 p-6 rounded-[2.5rem] text-white shadow-xl shadow-blue-900/30 relative overflow-hidden border border-blue-950">
                        {/* Effets de lumière en fond de carte */}
                        <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-white/5 blur-xl"></div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-yellow-400/5 blur-2xl"></div>

                        <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                                Compte Entreprise
                            </p>
                            <h3 className="text-lg font-bold text-white mt-1">Jobsy Pay</h3>
                            </div>
                            {/* Petite puce ou logo fictif pour faire pro */}
                            <div className="w-8 h-6 bg-white/10 rounded-md border border-white/20 flex items-center justify-center text-[8px] font-black text-yellow-300 tracking-tighter">
                            VIP
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                            Solde Disponible
                            </p>
                            <p className="text-3xl font-black tracking-tight mt-1">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.wallet_balance || 0)}
                            </p>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">
                            Solde Réservé contrats actifs
                            </p>
                            <p className="text-3xl font-black tracking-tight mt-1">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(stats.balance_locked || 0)}
                            </p>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button onClick={() => setIsDepositOpen(true)} className="flex-1 py-3 bg-[#F0E68C] hover:bg-[#ece27c] text-[#000080] text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer shadow-md text-center">
                            Recharger
                            </button>
                            <button onClick={() => setIsHistoryOpen(true)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 cursor-pointer text-center">
                            Historique
                            </button>
                        </div>
                        </div>
                    </div>               
                </div>               
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">
                    Relancer une offre archivée
                </h2>

                {missionsTerminees.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
                    <p className="text-slate-400 font-medium text-xs">Historique des quêtes complétées vide.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                    {missionsTerminees.slice(0, 3).map((mission) => (
                        <div key={mission.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between gap-3 group hover:bg-white hover:shadow-md transition-all">
                        <div>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#000080] transition-colors">
                            {mission.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">
                            {mission.applications_count || 0} talents ont été recrutés
                            </p>
                        </div>
                        
                        <Link href={`/dashboard/entreprises/missions/create?missionId=${mission.id}`} className="w-full">
                        <button className="w-full py-2.5 bg-white border border-slate-200 group-hover:border-[#F0E68C] group-hover:bg-[#F0E68C] text-slate-700 group-hover:text-[#000080] text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                            <RefreshCw size={12} /> Modifier et relancer
                        </button>
                        </Link>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {isDepositOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-2xl relative space-y-6">
                    
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Recharger le compte</h3>
                        <p className="text-slate-400 text-xs font-medium mt-1">Alimentez votre portefeuille Jobsy Pay pour lancer de nouvelles quêtes.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Montant (F CFA)</label>
                        <input 
                        type="number" 
                        placeholder="Ex: 25000"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-none focus:border-[#000080] transition-colors"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button 
                        onClick={() => setIsDepositOpen(false)}
                        className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
                        >
                        Annuler
                        </button>
                        <button 
                        onClick={() => {
                            handleWalletDeposit(depositAmount);
                            setIsDepositOpen(false);
                        }}
                        className="flex-1 py-3.5 bg-[#000080] text-white font-black text-xs uppercase tracking-widest rounded-xl border-b-4 border-blue-950 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md"
                        >
                        Confirmer
                        </button>
                    </div>
                    </div>
                </div>
            )}

            {isHistoryOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsHistoryOpen(false)} />

                    {/* Panneau de contenu */}
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 animate-slide-in border-l border-slate-100">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                        <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Flux financiers</h3>
                        <p className="text-slate-400 text-xs font-medium">Historique de vos dépôts et paiements de missions.</p>
                        </div>
                        <button 
                        onClick={() => setIsHistoryOpen(false)}
                        className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 font-bold text-sm transition-all cursor-pointer"
                        >
                        Fermer
                        </button>
                    </div>

                    {/* Liste des Transactions */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                       {transactions && transactions.length > 0 ? (
                        transactions.map((tx: any) => (
                            <div key={tx.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900">{tx.type === 'deposit' ? 'Dépôt' : 'Paiement de mission'}</span>
                                    <span className={`text-xs font-bold ${tx.status === 'completed' ? 'text-green-600' : tx.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                                        {tx.status === 'completed' ? 'Terminé' : tx.status === 'pending' ? 'En cours' : 'Échoué'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 mt-1">{new Date(tx.created_at).toLocaleString()}</p>
                                <p className="text-lg font-bold text-slate-900 mt-2">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(tx.amount)}</p>
                            </div>
                        ))
                       ) : (
                        <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-3xl">
                            <p className="text-slate-400 font-medium text-xs">Aucun flux financier enregistré pour le moment.</p>
                        </div>
                       )}
                    </div>
                    </div>
                </div>
            )}               
        </div>
    )
}