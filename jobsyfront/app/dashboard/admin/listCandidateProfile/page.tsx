'use client';
import PageInfo from "@/components/PageInfo";
import Avatar from "@/components/Avatar";
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import { useState, useEffect } from "react";
import { Filter, X, ChevronRight, RotateCcw, ChevronLeft, Search } from 'lucide-react';
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Category{
    id: number;
    name : string;
    color : string
}

interface Rank{
    id: number;
    label: string;
    rank: string;
    points: number;
    color: string;
    code_hexa: string;
}

interface Candidat {

    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;

    rank : {
        id: number;
        label: string;
        rank: string;
        points: number;
        color: string;
        code_hexa: string;
    }

    user:{
        id: number;
        nom : string;
        prenom : string;
        email : string;
        role : string
    }

    skills: {
        id: number;
        name : string
        category : Category
    }[]
   
}

interface FilterData {
    categories : Category[];
    ranks : Rank[]
}

interface PaginatedResponse<T> {
    data: T[]; // C'est ici que se trouvent tes candidats
    current_page: number;
    last_page: number;
    total: number;
    // Ajoute d'autres champs de pagination si tu en as besoin
}


const fetcher = (url: string) => api.get(url).then(res => res.data.data);   
export default function ListCandidateProfile() {
    const { data, error, isLoading } = useSWR<FilterData>('/getFilterData', fetcher);
    const { data: data2, error: error2, isLoading: isLoading2 } = useSWR<PaginatedResponse<Candidat>>('/filter', fetcher);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuRankOpen, setIsMenuRankOpen] = useState(false);
    const [categories, setCategories] = useState<Category[] | []>([]);
    const [ranks, setRanks ] = useState<Rank[] | []>([]);
    const [candidats, setCandidats] = useState<Candidat[] | []>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const pageLink = "/dashboard/entreprises/listCandidateProfile";
    const [loading, setLoading] = useState(false);

    // États pour la recherche et la pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Logique de Recherche
    const filteredData = candidats?.filter(item =>
        item.user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.user.prenom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Logique de Pagination
    const totalPages = Math.ceil((filteredData?.length ?? 0) / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData?.slice(indexOfFirstItem, indexOfLastItem);


    useEffect(() => {
        if (!data || !data2) return;

        const fetchData = () => {
            setCategories(data.categories);
            setRanks(data.ranks);
            setCandidats(data2?.data || []);
        };

        fetchData();
    }, [data, data2]);

    const handleFilter = async (category_id: number, rank_id: number) => {
        // const newSelection = selectedCategories.includes(category_id)
        //     ? selectedCategories.filter(id => id !== category_id)
        //     : [...selectedCategories, category_id];
        
        // setSelectedCategories(newSelection);
        // setCandidats([]);

        console.log(category_id, rank_id);
        setLoading(true);
        try {
            const response = await api.get('/filter', {
                params: { category_id: category_id, rank_id: rank_id }
            });
            
            setCandidats(response.data.data.data);

            console.log(response.data.data.data);
        } catch (e : any) {
            if (error instanceof Error) {
                    toast.error(e.response.data.message);
            } else {
                // Handle cases where other types of values might be thrown
                console.error("An unknown error occurred:", error);
            }
        } finally {            
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setSelectedCategories([]); 
        setCandidats(data2?.data || []);
    };

    if (error || error2) return <div>Failed to load</div>;
    if (isLoading || isLoading2) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    return (
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Candidats" pageLink={pageLink} />
            </div>

            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Candidats</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des talents inscrits</i></p>
            </div>

            <div className="max-w-7xl mx-auto">

                {/* BARRE D'OUTILS : Filtres + Recherche */}
                <div className="flex flex-col lg:flex-row gap-3 mb-6">
                    <div className="flex gap-3 overflow-x-auto no-scrollbar lg:flex-none">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="cursor-pointer shrink-0 flex items-center justify-center gap-2 bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200/80 font-bold text-slate-700 hover:border-[#000080]/30 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <Filter size={16} className="text-[#000080]" />
                            <span className="text-xs uppercase tracking-wide">Domaines</span>
                        </button>

                        <button
                            onClick={() => setIsMenuRankOpen(true)}
                            className="cursor-pointer shrink-0 flex items-center justify-center gap-2 bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-200/80 font-bold text-slate-700 hover:border-[#000080]/30 hover:bg-slate-50 active:scale-95 transition-all"
                        >
                            <Filter size={16} className="text-[#000080]" />
                            <span className="text-xs uppercase tracking-wide">Diplômes</span>
                        </button>

                        <button
                            onClick={() => resetFilters()}
                            className="cursor-pointer shrink-0 flex items-center justify-center gap-2 bg-red-50 px-5 py-3.5 rounded-2xl font-bold text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                        >
                            <RotateCcw size={16} />
                            <span className="text-xs uppercase tracking-wide">Réinitialiser</span>
                        </button>
                    </div>

                    {/* Barre de Recherche */}
                    <div className="relative flex-1 lg:max-w-sm lg:ml-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher un nom ou prénom..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#000080]/10 focus:border-[#000080] transition-all"
                        />
                    </div>
                </div>

                {/* SIDEBAR CATEGORIES */}
                <div className={`
                    fixed inset-0 z-50
                    transition-opacity duration-300
                    ${isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
                `}>
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    <div className={`
                        absolute right-0 top-0 w-4/5 max-w-sm h-full bg-white shadow-2xl overflow-y-auto no-scrollbar
                        transition-transform duration-300 ease-out
                        ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="font-black text-slate-800 text-lg">Domaines</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-3 space-y-1">
                            {categories?.map((category) => (
                                <button
                                    onClick={() => { setIsMenuOpen(false); handleFilter(category.id, 0) }}
                                    key={category.id}
                                    className="cursor-pointer group w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: category.color }}></div>
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-[#000080]">
                                            {category.name}
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#000080]" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR RANKS */}
                <div className={`
                    fixed inset-0 z-50
                    transition-opacity duration-300
                    ${isMenuRankOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
                `}>
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
                        onClick={() => setIsMenuRankOpen(false)}
                    ></div>

                    <div className={`
                        absolute right-0 top-0 w-4/5 max-w-sm h-full bg-white shadow-2xl overflow-y-auto no-scrollbar
                        transition-transform duration-300 ease-out
                        ${isMenuRankOpen ? 'translate-x-0' : 'translate-x-full'}
                    `}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <h2 className="font-black text-slate-800 text-lg">Diplômes</h2>
                            <button onClick={() => setIsMenuRankOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={22} />
                            </button>
                        </div>

                        <div className="p-3 space-y-1">
                            {ranks?.map((rank) => (
                                <button
                                    onClick={() => { setIsMenuRankOpen(false); handleFilter(0, rank.id) }}
                                    key={rank.id}
                                    className="cursor-pointer group w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-slate-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: rank.code_hexa }}></div>
                                        <span className="text-sm font-semibold text-slate-600 group-hover:text-[#000080]">
                                            {rank.label} (Rang {rank.rank})
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-slate-300 group-hover:text-[#000080]" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* LISTE DES CANDIDATS */}
                {loading ? (
                    <div className="flex justify-center items-center py-24">
                        <ThreeDots height="70" width="70" color="#000080" visible={true} />
                    </div>
                ) : currentItems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {currentItems.map((candidat) => {
                            const uniqueCategories = Array.from(
                                new Map(
                                    (candidat.skills || [])
                                        .filter(skill => skill.category)
                                        .map(skill => [skill.category.id, skill.category])
                                ).values()
                            );

                            return (
                                <Link key={candidat.id} href={`/dashboard/admin/detailProfilCandidat/${candidat.id}`}>
                                    <div className="h-full flex flex-col p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-[#000080]/20 transition-all cursor-pointer">
                                        
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-11 h-11 shrink-0 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                                                    <Avatar width={44} height={44} fontSize={18} nom={candidat.user?.nom} prenom={candidat.user?.prenom} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-slate-900 text-sm truncate">{candidat.user?.nom} {candidat.user?.prenom}</h3>
                                                    <p className="text-xs text-slate-500 truncate">{candidat.domaine_competence || "Apprenti Junior Jobsy"}</p>
                                                </div>
                                            </div>
                                            <span
                                                className="shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-lg"
                                                style={{ backgroundColor: `${candidat.rank?.code_hexa}20`, color: candidat.rank?.code_hexa }}
                                            >
                                                Rang {candidat.rank.rank}
                                            </span>
                                        </div>

                                        <div className="mt-3.5 flex flex-wrap gap-1.5 flex-1">
                                            {uniqueCategories.length > 0 ? (
                                                uniqueCategories.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="px-2.5 py-1 text-[11px] font-bold rounded-full"
                                                        style={{
                                                            backgroundColor: `${cat.color || '#E1F5FE'}20`,
                                                            color: `${cat.color}`
                                                        }}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Aucun domaine renseigné</span>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                                            <span className="text-xs text-[#000080] font-bold flex items-center gap-1">
                                                Voir profil
                                                <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                            <Search size={22} className="text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium italic text-sm">Aucun résultat pour cette recherche.</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages >= 1 && currentItems.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-200/80 flex items-center justify-between">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Page {currentPage} sur {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#000080] hover:text-white hover:border-[#000080] transition-all cursor-pointer"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-[#000080] hover:text-white hover:border-[#000080] transition-all cursor-pointer"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}