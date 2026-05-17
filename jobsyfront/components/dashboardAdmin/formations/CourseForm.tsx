'use client'
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from "react-hook-form"
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Editor, EditorTextChangeEvent } from 'primereact/editor';
import { useRouter } from "next/navigation"

interface Course {
  id: string;
  title: string;
  description: string;
  validation_mode: 'A' | 'B' | 'C';
  delivered_skills: string;
  reward_xp: number;
  reward_asset: string;
  is_active: boolean
}

interface CourseFormProps {
  initialData?: Course; // Les données de la mission en mode édition
}

export default function CourseForm({ initialData }: CourseFormProps) {

    const router = useRouter()
    const isEditing = !!initialData
    const [loading, setLoading] = useState(false);

    const {register, handleSubmit, reset, control} = useForm<Course>({
        values: initialData,
    })

    useEffect(() => {
        if (initialData) {
        reset(initialData);
        }
    }, [initialData, reset]);

    const onSubmit = async (data: Course) => {
        console.log(data)
        setLoading(true);
        const dataToSend = {
            ...data,
            delivered_skills: isEditing ? (Array.isArray(data?.delivered_skills) ? data.delivered_skills : (data?.delivered_skills || "").split(',').map(s => s.trim()).filter(s => s !== "")) : (data?.delivered_skills || "").split(',').map(s => s.trim()).filter(s => s !== ""),
            reward: data.reward_xp
        };
        console.log("Données prêtes :", dataToSend);

        try {
            if (isEditing) {    
                await api.put(`/courses/${initialData.id}`, dataToSend)
                toast.success("Modification effectuée avec succès.");

            } else {
                await api.post("/courses", dataToSend)
                toast.success("Formation ajoutée avec succès.");
            }
            router.push("/dashboard/admin/courses/list")
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
                        <label className={labelClass}>Titre de la formation</label>
                        <input {...register("title")} type="text" name="title" className={inputClass} />
                    </div>

                    <div>
                        <label className={labelClass}>Mode de validation</label>
                        <select {...register("validation_mode")} name="validation_mode" className={inputClass}>
                            <option defaultValue="">Sélectionner le mode de validation</option>
                            <option value="A">Mode Standard</option>
                            <option value="B">Mode Logistique</option>
                            <option value="C">Mode Expert</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Compétences à acquérir</label>
                    <input {...register("delivered_skills")} type="text" name="delivered_skills" className={inputClass}   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div>
                        <label className={labelClass}>Points</label>
                        <input {...register("reward_xp")} type="number" name="reward_xp" className={inputClass} />
                    </div>
                </div>

                <div>     
                    <label className={labelClass}>Description</label>
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
                    {/* <Editor {...register("description")} name="description" className={inputClass}  onTextChange={(e: EditorTextChangeEvent) => setFormData({...formData, description: e.htmlValue ?? ""})} style={{ height: '320px' }} /> */}
                </div>

                <button 
                    type="button" 
                    onClick={handleSubmit(onSubmit)}
                    className="cursor-pointer w-full py-3 px-5 text-white bg-[#000080] hover:bg-[#000080]/70 font-bold rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all duration-200 transform hover:-translate-y-0.5"
                    >
                    {isEditing ? "Mettre à jour" : "Créer la formation"}
                </button>
            </form>
        </div>
    ) 
}