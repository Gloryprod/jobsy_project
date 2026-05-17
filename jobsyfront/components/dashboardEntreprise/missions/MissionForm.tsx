'use client'
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from "react-hook-form"
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { useRouter } from "next/navigation"
import useSWR from "swr";

interface Mission {
  id: string;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: Date;
  description: string;
  skills: string;
  urgency: 'normal' | 'urgent' | 'premium';
  test_severity: 'light' | 'standard' | 'expert';
  category: string
  applicants: number;
  type_contrat: string;
  min_rank_required: string;
  active: boolean
}

interface MissionFormProps {
  initialData?: Mission; // Les données de la mission en mode édition
}

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

interface FilterData {
    categories : Category[];
    ranks : Rank[]
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export default function MissionForm({initialData} : MissionFormProps){
    const { data, error, isLoading } = useSWR<FilterData>('/getFilterData', fetcher);

    const router = useRouter()
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false);

    const [categories, setCategories] = useState<Category[] | []>([]);
    const [ranks, setRanks ] = useState<Rank[] | []>([]);

    const {register, handleSubmit, reset, control} = useForm({
        values: initialData 
    })

    useEffect(() => {
        if (initialData) {
        reset(initialData);
        }
    }, [initialData, reset]);

    useEffect(() => {
        if (!data) return;

        const fetchData = () => {
            setCategories(data.categories);
            setRanks(data.ranks);
        };

        fetchData();
    }, [data]);

    const onSubmit = async (data: Mission) => {
        setLoading(true);
        const dataToSend = {
            ...data,
            skills: isEditing ? (Array.isArray(data?.skills) ? data.skills : (data?.skills || "").split(',').map(s => s.trim()).filter(s => s !== "")) : (data?.skills || "").split(',').map(s => s.trim()).filter(s => s !== ""),
            reward: data.reward
        };
        console.log("Données prêtes :", dataToSend);

        try {
            if (isEditing) {
                await api.put(`/missions/${initialData.id}`, dataToSend)
                toast.success("Modification effectuée avec succès.");

            } else {
                await api.post("/missions", dataToSend)
                toast.success("Mission ajoutée avec succès.");
            }
            router.push("/dashboard/entreprises/missions/list")
            router.refresh()            
        } catch (error: any) {
            const messages = error.response?.data?.message;
            toast.error(messages);

        } finally {
            setLoading(false); // On débloque le bouton
        }
    };

    // Classe réutilisable pour les inputs
    const inputClass = "w-full mt-1 p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all";
    const labelClass = "block text-sm font-medium text-gray-700"

    return(
        <div className="min-h-screen relative md:p-8 bg-white">               
            <form className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Titre de la mission</label>
                    <input {...register("title")} type="text" name="title" className={inputClass} placeholder="Développeur Fullstack..." />
                </div>
                <div>
                    <label className={labelClass}>Entreprise</label>
                    <input {...register("company")} type="text" name="company" className={inputClass} placeholder="Nom de la boîte" />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>Lieu</label>
                    <input {...register("location")} type="text" name="location" className={inputClass} placeholder="Paris / Remote" />
                </div>
                <div>
                    <label className={labelClass}>Rémunération</label>
                    <input {...register("reward")} type="number" name="reward" className={inputClass} placeholder="500" />
                </div>
                <div>
                    <label className={labelClass}>Date limite</label>
                    <input {...register("deadline")} type="date" name="deadline" className={inputClass} />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Difficulté de l&apos;évaluation à passer</label>
                        <select {...register("test_severity")} name="test_severity" className={inputClass}>
                            <option defaultValue="" >Sélectionner un niveau de difficulté</option>
                            <option value="light">Facile</option>
                            <option value="standard">Moyen</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Type de contrat</label>
                        <select {...register("type_contrat")} name="type_contrat" className={inputClass}>
                            <option defaultValue="">Sélectionner le type de contrat</option>
                            <option value="CDD">CDD</option>
                            <option value="CDI">CDI</option>
                            <option value="Mission Ponctuelle">Mission Ponctuelle</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Nombre de poste</label>
                        <input {...register("applicants")} type="number" name="applicants" className={inputClass} placeholder="0" />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Compétences (séparées par des virgules)</label>
                    <input {...register("skills")} type="text" name="skills" className={inputClass} placeholder="React, Tailwind, Laravel..."  />
                </div>

                <div>
                    <label className={labelClass}>Niveau minimum du candidat requis</label>
                    <select {...register("min_rank_required")} name="min_rank_required" className={inputClass}>
                        <option defaultValue="">Sélectionner un niveau</option>
                        {ranks.map(function (value, index) {
                            return <option key={index} value={value.rank}>{value.label}</option>
                        })
                        }
                    </select>                
                </div>

                <div>
                    <label className={labelClass}>Domaine d&apos;activité</label>
                    <select {...register("category")} name="category" className={inputClass}>
                        <option defaultValue="">Sélectionner un domaine d&apos;activité</option>
                        {categories.map(function (value, index) {
                            return <option key={index} value={value.name}>{value.name}</option>
                        })
                        }
                    </select>                
                </div>


                <div>     
                    <label className={labelClass}>Description détaillée</label>
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                            <Editor 
                                value={field.value} 
                                onTextChange={(e) => field.onChange(e.htmlValue)} 
                                style={{ height: '320px' }} 
                            />
                        )}
                    />
                    {/* <Editor {...register("description")} placeholder="Décrivez les objectifs de la mission..." name="description" className={inputClass}  onTextChange={(e: EditorTextChangeEvent) => setFormData({...formData, description: e.htmlValue ?? ""})} style={{ height: '320px' }} /> */}
                </div>

                <button 
                type="button" 
                onClick={handleSubmit(onSubmit)}
                className="w-full py-3 px-5 text-white bg-[#000080] hover:bg-[#000080]/70 font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                {isEditing ? "Mettre à jour" : "Créer la mission"}
                </button>
            </form>
        </div>
    ) 
}