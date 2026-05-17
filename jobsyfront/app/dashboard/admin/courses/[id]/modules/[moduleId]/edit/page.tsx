'use client'
import PageInfo from "@/components/PageInfo";
import ModuleForm from "@/components/dashboardAdmin/modules/ModuleForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { use } from "react";
import { ThreeDots } from "react-loader-spinner";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function EditModule({ params }: { params: Promise<{ id: string; moduleId: string }> }){
    const {id, moduleId } = use(params);
    const pageLink = `/dashboard/admin/courses/${id}/modules/${moduleId}/edit`;

    const [module, setModule] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/modules/${moduleId}`)
        .then(res => {
            setModule(res.data)
            setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [moduleId])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>      
    );
    if (!module) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">Erreur de chargement des informations du module.</p>
        </div>
    );

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Modifier un module" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Modifier un module</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <ModuleForm courseId={id} initialData={module}/>                
            </div>
        </div>
    ) 
}