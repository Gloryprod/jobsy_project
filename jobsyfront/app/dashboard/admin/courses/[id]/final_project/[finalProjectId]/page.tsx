'use client'
import PageInfo from "@/components/PageInfo";
import FinalProjectForm from "@/components/dashboardAdmin/finalProject/FinalProjectForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { use } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function EditModule({ params }: { params: Promise<{ id: string; finalProjectId: string }> }){
    const {id, finalProjectId } = use(params);
    const pageLink = `/dashboard/admin/courses/${id}/final_project/${finalProjectId}`;

    const [finalProject, setFinalProject] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/exam-projects/${finalProjectId}`)
        .then(res => {
            // L'API répond { project } : sans cela, le formulaire de modification s'ouvrait vide
            setFinalProject(res.data.project)
            setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [finalProjectId])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>      
    );
    if (!finalProject) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-700">Erreur de chargement des informations du projet final.</p>
        </div>
    );

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Modifier un projet final" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Projet Final</h1>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <FinalProjectForm courseId={id} initialData={finalProject}/>                
            </div>
        </div>
    ) 
}