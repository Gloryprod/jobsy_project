// 'use client';
// import { useAuth } from "@/hooks/useAuth";

// export default function AdminDashboardPage() {
//     useAuth("ADMIN");
//     return (
//         <div className="p-8">
//             <h1 className="text-2xl font-bold mb-4">Bienvenue sur votre tableau de bord Admin</h1>
//             <p>Gérez les utilisateurs, les entreprises et les offres d&apos;emploi depuis cet espace.</p>
//         </div>
//     );
// }

'use client';

import { useAuth } from "@/hooks/useAuth";
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from "react-loader-spinner";
import { 
  Users, 
  Building2, 
  Briefcase, 
  Trophy, 
  Flame, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert,
  BookOpen
} from "lucide-react";
import Link from "next/link";

const fetcher = (url: string) => api.get(url).then(res => res.data.data || res.data);

export default function AdminDashboardPage() {
    useAuth("ADMIN");

    const { data: stats, isLoading } = useSWR('/dashboard/stats', fetcher);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <ThreeDots height="80" width="80" color="#000080" visible={true} />
            </div>
        );
    }

    const formations: Record<string, number> = stats?.formations_stats || {};

    // Typage strict pour garantir le type 'number' dans les opérations arithmétiques
    const totalFormationsEnrolled: number = (Object.values(formations) as number[]).reduce(
        (acc: number, count: number) => acc + (count || 0), 
        0
    ) || 1;

    const formatStatusLabel = (key: string) => {
        switch (key) {
            case 'enrolled': return { label: 'Inscrits (Non débuté)', color: 'bg-slate-300' };
            case 'waiting_kit': return { label: 'En attente de kit (Mode B)', color: 'bg-amber-400' };
            case 'learning': return { label: 'En cours d\'apprentissage', color: 'bg-blue-500' };
            case 'evaluation_ready': return { label: 'Évaluation prête', color: 'bg-indigo-500' };
            case 'pending_review': return { label: 'En attente de correction (Mode C)', color: 'bg-purple-500' };
            case 'certified': return { label: 'Certifiés avec succès', color: 'bg-emerald-500' };
            case 'failed': return { label: 'Non validés (Échec)', color: 'bg-rose-500' };
            default: return { label: key, color: 'bg-slate-400' };
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
            {/* En-tête */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Tableau de Bord Administrateur</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Pilotez l&apos;activité globale de la plateforme Jobsy, suivez l&apos;engagement et gérez les flux.
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-[#000080] px-4 py-2 rounded-2xl text-xs font-extrabold">
                    <TrendingUp size={16} /> Plateforme active & opérationnelle
                </div>
            </div>

            {/* Grille des KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { 
                        title: 'Total Candidats', 
                        value: stats?.total_candidats ?? '---', 
                        icon: Users, 
                        color: 'text-blue-600', 
                        bg: 'bg-blue-50', 
                        border: 'border-blue-100' 
                    },
                    { 
                        title: 'Entreprises Actives', 
                        value: stats?.total_entreprises ?? '---', 
                        icon: Building2, 
                        color: 'text-purple-600', 
                        bg: 'bg-purple-50', 
                        border: 'border-purple-100' 
                    },
                    { 
                        title: 'Missions Publiées', 
                        value: stats?.total_missions ?? '---', 
                        icon: Briefcase, 
                        color: 'text-emerald-600', 
                        bg: 'bg-emerald-50', 
                        border: 'border-emerald-100' 
                    },
                    { 
                        title: 'Certifications Délivrées', 
                        value: stats?.total_certifications ?? '---', 
                        icon: Trophy, 
                        color: 'text-amber-600', 
                        bg: 'bg-amber-50', 
                        border: 'border-amber-100' 
                    },
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-white ${stat.border} border-2 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</p>
                                <p className="text-3xl font-black text-slate-800 mt-2">{stat.value}</p>
                            </div>
                            <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                                <stat.icon size={26} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sections Secondaires : Vue d'ensemble Formations & Actions Requises */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Graphique / Répartition des Formations */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                            <BookOpen className="text-[#000080]" size={20} /> Aperçu des Formations
                        </h3>
                        <span className="text-xs font-extrabold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                            {Object.values(formations).reduce((a: number, b: number) => a + b, 0)} total
                        </span>
                    </div>
                    <p className="text-xs text-slate-400">Répartition des apprenants selon l&apos;état de leur parcours.</p>

                    {/* Barre de progression segmentée (Graphique visuel) */}
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                        {Object.entries(formations).map(([key, count]: [string, number]) => {
                            const percentage = (count / totalFormationsEnrolled) * 100;
                            if (percentage === 0) return null;
                            const meta = formatStatusLabel(key);
                            return (
                                <div 
                                    key={key} 
                                    className={`h-full ${meta.color} transition-all duration-500`} 
                                    style={{ width: `${percentage}%` }}
                                    title={`${meta.label}: ${count}`}
                                />
                            );
                        })}
                    </div>

                    {/* Légende détaillée */}
                    <div className="space-y-2 pt-2">
                        {Object.entries(formations).map(([key, count]: [string, any]) => {
                            const meta = formatStatusLabel(key);
                            return (
                                <div key={key} className="flex items-center justify-between text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${meta.color}`} />
                                        <span className="text-slate-600">{meta.label}</span>
                                    </div>
                                    <span className="font-black text-slate-800">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Actions en attente de modération (avec pending_candidates) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                        <ShieldAlert className="text-[#000080]" size={20} /> Actions requises / En attente
                    </h3>
                    <p className="text-xs text-slate-400">Éléments nécessitant une validation ou une révision administrative.</p>

                    <div className="space-y-3">
                        <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Candidats en attente de validation de profil</p>
                                    <p className="text-xs text-slate-400">{stats?.pending_candidates ?? 0} candidat(s) à valider</p>
                                </div>
                            </div>
                            <Link href="/dashboard/admin/listCandidateProfile" className="cursor-pointer px-4 py-2 bg-[#000080] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition">
                                Gérer
                            </Link>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Projets de formation en attente de correction</p>
                                    <p className="text-xs text-slate-400">{stats?.pending_reviews ?? 0} évaluation(s) à noter (Mode C)</p>
                                </div>
                            </div>
                            <Link href="/dashboard/admin/courses/list" className="cursor-pointer px-4 py-2 bg-[#000080] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition">
                                Corriger
                            </Link>
                        </div>

                        <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                                    <Flame size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">Engagement global de la communauté</p>
                                    <p className="text-xs text-slate-400">Vitalité moyenne : <strong>{stats?.avg_vitality ?? 0}%</strong> | Série : <strong>{stats?.avg_streak ?? 0}j</strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}