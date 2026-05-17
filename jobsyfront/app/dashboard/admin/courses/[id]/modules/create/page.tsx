'use client'
import PageInfo from "@/components/PageInfo";
import ModuleForm from "@/components/dashboardAdmin/modules/ModuleForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { use } from "react";

export default function CreateModule({ params }: { params: Promise<{ id: string }> }){
    const {id } = use(params);
    const pageLink = `/dashboard/admin/courses/${id}/modules/create`;

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Ajouter un module" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Ajouter un module</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <ModuleForm courseId={id} />                
            </div>
        </div>
    ) 
}