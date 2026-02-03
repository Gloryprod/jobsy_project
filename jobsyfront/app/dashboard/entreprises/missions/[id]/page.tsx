'use client'
import PageInfo from "@/components/PageInfo";
import MissionForm from "@/components/dashboardEntreprise/missions/MissionForm";
import {  
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import {use} from "react";
import { ThreeDots } from 'react-loader-spinner';

export default function CreateJob({ params }: { params: Promise<{ id: string }>}){
    const {id} = use(params);
    const pageLink = `/dashboard/entreprises/missions/${id}`;
    const [mission, setMission] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get(`/missions/${id}`)
        .then(res => {
            setMission(res.data)
            setLoading(false)
        })
        .catch(() => setLoading(false))
    }, [id])

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );
    if (!mission) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">Erreur de chargement des informations de la mission.</p>
        </div>
    );

    return(
        <div className="min-h-screen relative p-4 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Mise à jour d'une offre d'emploi" pageLink={pageLink} />
            </div>

            <div className="w-full mx-auto my-10 p-4 bg-white shadow-xl rounded-2xl border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800 ml-4 mb-4">Modifier une mission</h2>
                <DropdownMenuSeparator className="ml-4 mr-4 flex items-center justify-end" />
                <MissionForm initialData={mission} />            
            </div>
        </div>
    ) 
}