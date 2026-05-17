'use client'
import PageInfo from "@/components/PageInfo";
import CourseForm from "@/components/dashboardAdmin/formations/CourseForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function CreateFormation(){
    const pageLink = `/dashboard/admin/courses/create`;

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Ajouter une formation" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Ajouter une formation</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <CourseForm />                
            </div>
        </div>
    ) 
}