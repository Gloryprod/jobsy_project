'use client';
import PageInfo from "@/components/PageInfo";
import Avatar from "@/components/Avatar";
import useSWR from "swr";
import api from "@/lib/api";
import { ThreeDots } from 'react-loader-spinner';
import { useState, useEffect } from "react";
import { Filter, X, ChevronRight, RotateCcw } from 'lucide-react';
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
    }
   
}

interface FilterData {
    categories : Category[];
    ranks : Rank[]
}


const fetcher = (url: string) => api.get(url).then(res => res.data.data);
export default function ListCandidateProfile() {
    const { data, error, isLoading } = useSWR<FilterData>('/getFilterData', fetcher);
    const { data: data2, error: error2, isLoading: isLoading2 } = useSWR<Candidat[] | []>('/filter', fetcher);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuRankOpen, setIsMenuRankOpen] = useState(false);
    const [categories, setCategories] = useState<Category[] | []>([]);
    const [ranks, setRanks ] = useState<Rank[] | []>([]);
    const [candidats, setCandidats] = useState<Candidat[] | []>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const pageLink = "/dashboard/entreprises/listCandidateProfile";

    useEffect(() => {
        if (!data || !data2) return;

        const fetchData = () => {
            setCategories(data.categories);
            setRanks(data.ranks);
            setCandidats(data2.data);
        };

        fetchData();
    }, [data, data2]);

    const handleFilter = async (category_id: number, rank_id: number) => {
        const newSelection = selectedCategories.includes(category_id)
            ? selectedCategories.filter(id => id !== category_id)
            : [...selectedCategories, category_id];
        
        setSelectedCategories(newSelection);
        setCandidats([]);
        try {
            const response = await api.get('/filter', {
                params: { category_ids: newSelection, rank_id: rank_id }
            });
            
            setCandidats(response.data.data.data);

            console.log(response.data.data.data);
        } catch (e : unknown) {
            if (error instanceof Error) {
                    toast.error(e.response.data.message);
            } else {
                // Handle cases where other types of values might be thrown
                console.error("An unknown error occurred:", error);
            }
        }
    };

    const resetFilters = () => {
        setSelectedCategories([]); 
        setCandidats(data2.data);
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
                <PageInfo pageName="Profils candidats disponibles" pageLink={pageLink} />
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                >
                    <Filter size={18} className="text-indigo-600" />
                    <span className="text-sm">Domaines</span>
                </button>

                <button 
                    onClick={() => setIsMenuRankOpen(true)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition"
                >
                    <Filter size={18} className="text-blue-600" />
                    <span className="text-sm">Diplômes</span>
                </button>

                <button 
                    onClick={() => resetFilters()}
                    className="flex-none md:w-auto flex items-center justify-center gap-2 bg-red-50 p-4 rounded-2xl font-bold text-red-600 hover:bg-red-100 active:scale-95 transition"
                >
                    <RotateCcw size={18} />
                    <span className="text-sm md:hidden lg:inline">Réinitialiser</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-6 gap-8">
                
                {/* SIDEBAR CATEGORIES */}
                <div className={`
                    fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:col-span-2
                    transition-transform duration-300 ease-in-out
                    ${isMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    {/* Overlay mobile pour fermer le menu en cliquant à côté */}
                    <div 
                        className="absolute inset-0 bg-black/50 " 
                        onClick={() => setIsMenuOpen(false)}
                    ></div>

                    {/* Contenu de la Sidebar */}
                    <div className="absolute right-0 w-4/5 max-w-sm h-full bg-white lg:w-full lg:rounded-xl shadow-xl lg:shadow-sm overflow-y-auto no-scrollbar">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                            <h2 className="font-bold text-gray-800 text-lg">Catégories</h2>
                            <button onClick={() => setIsMenuOpen(false)} className="lg:hidden p-2 text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-3 space-y-1">
                            {categories?.map((category) => (
                                <button 
                                    onClick={() => {setIsMenuOpen(false); handleFilter(category.id, 0)}}
                                    key={category.id} 
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selectedCategories.includes(category.id) ? 'bg-indigo-100' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: category.color}}></div>
                                        <span className="text-sm font-semibold text-gray-600 group-hover:text-indigo-700">
                                            {category.name}
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* SIDEBAR RANKS */}
                <div className={`
                    fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-0 lg:col-span-2
                    transition-transform duration-300 ease-in-out
                    ${isMenuRankOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    <div 
                        className="absolute inset-0 bg-black/50 " 
                        onClick={() => setIsMenuRankOpen(false)}
                    ></div>

                    <div className="absolute right-0 w-4/5 max-w-sm h-full bg-white lg:w-full lg:rounded-xl shadow-xl lg:shadow-sm overflow-y-auto no-scrollbar">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
                            <h2 className="font-bold text-gray-800 text-lg">Diplômes</h2>
                            <button onClick={() => setIsMenuRankOpen(false)} className="lg:hidden p-2 text-gray-500">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-3 space-y-1">
                            {ranks?.map((rank) => (
                                <button 
                                    onClick={() => {setIsMenuRankOpen(false); handleFilter(0, rank.id)}}
                                    key={rank.id} 
                                    className="w-full group flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm" style={{backgroundColor: rank.code_hexa}}></div>
                                        <span className="text-sm font-semibold text-gray-600 group-hover:text-indigo-700">
                                            {rank.label} (Rang {rank.rank})
                                        </span>
                                    </div>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 lg:col-span-4 space-y-4">
                    {candidats.length > 0 ? (
                        candidats.map((candidat) => (
                            <div key={candidat.id} className="flex flex-col p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"><Avatar width = {48} height = {48} fontSize = {24} nom = {candidat.user?.nom} prenom = {candidat.user?.prenom} />
                                        </div> <div className="ml-3">
                                            <h3 className="font-bold text-gray-900">{candidat.user?.nom} {candidat.user?.prenom}</h3>
                                            <p className="text-sm text-gray-500">{candidat.domaine_competence}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 text-xs font-semibold rounded" style={{ backgroundColor: `${candidat.rank?.code_hexa}20`, color: candidat.rank?.code_hexa }} >{candidat.niveau_etude} (Rang {candidat.rank ? candidat.rank.rank : "E"})</span> 
                                </div>
                                
                                {(() => {
                                    const uniqueCategories = Array.from(
                                        new Map(
                                            candidat.skills
                                                .filter(skill => skill.category) // Sécurité au cas où category est null
                                                .map(skill => [skill.category_id, skill.category])
                                        ).values()
                                    );

                                    return (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {uniqueCategories.length > 0 ? (
                                                uniqueCategories.map((cat) => (
                                                    <span 
                                                        key={cat.id} 
                                                        className="px-2 py-1 text-xs font-bold rounded-full"
                                                        style={{ 
                                                            backgroundColor: `${cat.color || '#E1F5FE'}20`, 
                                                            color:  `${cat.color}`
                                                        }}
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 bg-gray-50 italic">Aucun domaine</span>
                                            )}
                                        </div>
                                    );
                                })()}
                                <Link href={`/dashboard/entreprises/detailProfilCandidat/${candidat.id}`}>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button className="text-sm text-indigo-600 font-medium cursor-pointer">Voir profil</button>
                                    </div>
                                </Link>
                            </div>
                        ))) : (

                            <div className="flex flex-col p-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <div className="ml-3">
                                            <h3 className="font-bold text-gray-900 text-center">Aucun candidat trouvé</h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )                        
                    }
                </div>
            </div>
        </div>
    );
}