'use client'
import React, { useState } from 'react';
import { useForm } from "react-hook-form"
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { useRouter } from "next/navigation"

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
  category: 'tout' | 'diplomes' | 'non_diplomes';
  applicants: number;
  type_contrat: string;
  active: boolean
}

interface MissionFormProps {
  initialData?: Mission; // Les données de la mission en mode édition
}

export default function MissionForm({initialData} : MissionFormProps){
    const router = useRouter()
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Mission>>({
        urgency: 'normal',
        category: 'tout',
        skills: ''
    });

    const form = useForm({
        defaultValues: initialData
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const onSubmit = async () => {
        setLoading(true);
        const dataToSend = {
            ...formData,
            skills: formData.skills?.split(',').map(s => s.trim()).filter(s => s !== ""),
            reward: formData.reward
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
                    <input {...form.register("title")} type="text" name="title" onChange={handleChange} className={inputClass} placeholder="Développeur Fullstack..." />
                </div>
                <div>
                    <label className={labelClass}>Entreprise</label>
                    <input {...form.register("company")} type="text" name="company" onChange={handleChange} className={inputClass} placeholder="Nom de la boîte" />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>Lieu</label>
                    <input {...form.register("location")} type="text" name="location" onChange={handleChange} className={inputClass} placeholder="Paris / Remote" />
                </div>
                <div>
                    <label className={labelClass}>Rémunération</label>
                    <input {...form.register("reward")} type="number" name="reward" onChange={handleChange} className={inputClass} placeholder="500" />
                </div>
                <div>
                    <label className={labelClass}>Date limite</label>
                    <input {...form.register("deadline")} type="date" name="deadline" onChange={handleChange} className={inputClass} />
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Catégorie Cible</label>
                        <select {...form.register("category")} name="category" onChange={handleChange} className={inputClass}>
                            <option value="Tous les candidats">Tous les candidats</option>
                            <option value="Candidats avec diplomes">Candidats avec diplomes</option>
                            <option value="Candidats sans diplomes">Candidats sans diplomes</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Type de contrat</label>
                        <select {...form.register("type_contrat")} name="type_contrat" onChange={handleChange} className={inputClass}>
                            <option value="CDD">CDD</option>
                            <option value="CDI">CDI</option>
                            <option value="Mission Ponctuelle">Mission Ponctuelle</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Nombre de poste</label>
                        <input {...form.register("applicants")} type="number" name="applicants" onChange={handleChange} className={inputClass} placeholder="0" />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Compétences (séparées par des virgules)</label>
                    <input {...form.register("skills")} type="text" name="skills" onChange={handleChange} className={inputClass} placeholder="React, Tailwind, Laravel..."  />
                </div>

                <div>
                <label className={labelClass}>Description détaillée</label>
                <Editor {...form.register("description")} placeholder="Décrivez les objectifs de la mission..." name="description" className={inputClass}  onTextChange={(e: EditorTextChangeEvent) => setFormData({...formData, description: e.htmlValue})} style={{ height: '320px' }} />
                </div>

                <button 
                type="button" 
                onClick={form.handleSubmit(onSubmit)}
                className="w-full py-3 px-5 text-white bg-[#000080] hover:bg-[#000080]/70 font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                >
                {isEditing ? "Mettre à jour" : "Créer la mission"}
                </button>
            </form>
        </div>
    ) 
}