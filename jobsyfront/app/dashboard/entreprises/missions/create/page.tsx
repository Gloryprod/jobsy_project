'use client'
import PageInfo from "@/components/PageInfo";
import MissionForm from "@/components/dashboardEntreprise/missions/MissionForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export default function CreateJob(){
    const pageLink = `/dashboard/entreprises/missions/create`;

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Ajouter une offre d'emploi" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Ajouter une mission</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <MissionForm />                
            </div>
        </div>
    ) 
}