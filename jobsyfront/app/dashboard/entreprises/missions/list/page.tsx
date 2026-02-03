'use client';

import PageInfo from "@/components/PageInfo";
import Link from "next/link";
import { columns, Mission } from "./columns";
import { DataTable } from "./data-table";
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ThreeDots } from 'react-loader-spinner';

const fetchMissions = async (): Promise<Mission[]> => {

    const res = await api.get('/missions');

    if(!res){
        toast.error("Impossible")
    }

    return res.data.data
   
};

export default function ListMission(){
    const pageLink = `/dashboard/entreprises/missions/list`;
    const queryClient = useQueryClient()
    const { data, error, isLoading } = useQuery<Mission[]>({
        queryKey: ['missions'],
        queryFn: fetchMissions,
    });

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );
    if (error) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-red-400">Erreur de chargement des offres.</p>
        </div>
    );

    return (
        <div className="min-h-screen relative  md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Historique des offres" pageLink={pageLink} />
            </div>

            <div className="flex justify-end items-end mb-4">
                <Link href="/dashboard/entreprises/missions/create">
                    <button className="bg-[#000080] items-center  text-white text-md font-medium px-4 py-2 rounded-lg cursor-pointer">Ajouter une offre</button>
                </Link>
            </div>

            <div className="bg-white block w-full border rounded-2xl shadow-xs ">
                <div className="container mx-auto p-6">
                    <DataTable columns={columns} data={data || []} />
                </div>
            </div>
        </div>
    )
}