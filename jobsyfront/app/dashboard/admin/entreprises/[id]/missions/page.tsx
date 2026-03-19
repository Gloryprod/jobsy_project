'use client';

import useSWR from "swr";
import api from "@/lib/api";
import { use } from "react";
import  PageInfo  from "@/components/PageInfo";
import { ThreeDots } from "react-loader-spinner";
import MissionAdminCard from "@/components/dashboardAdmin/entreprises/MissionAdminCard";

interface Candidat {

    id: number;
    domaine_competence : string;
    niveau_etude : string;
    bio : string;
    ville : string;

    user:{
        id: number;
        nom : string;
        prenom : string;
        email : string;
        role : string
    }
   
}

interface MissionOffer {
    id: number;
    application_id: number;
    start_date: string;
    place: string;
    onboarding_instructions: string;
    contact_person: string;
    expires_at: string;
    accepted_at: string;
    declined_at: string;
    decline_reason: string;
    application : Application
}

interface Application {
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: string;
    completed_at: string;
    updated_at: string;
    mission_offers: MissionOffer
    candidat: Candidat
}

interface Mission {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string;
  deadline: string;
  urgency: 'normal' | 'urgent' | 'premium';
  test_severity: 'light' | 'standard' | 'expert';
  applicants: number;
  type_contrat: string;
  active: boolean;
  min_rank_required: string;
  applications:Application[]
  closed_at:string
}

const fetcher = (url: string) => api.get(url).then(res => res.data.data);


export default function MissionsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: missions = [], isLoading, error } = useSWR<Mission[]>(`/entreprises/${id}/missions`, fetcher);
    const pageLink = `/dashboard/admin/entreprises/${id}/missions`;

    if (isLoading) return (
        <div className="flex justify-center items-center h-screen">
        <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
    );

    if (error) return (
        <div>Failed to load</div>
    );

    return (
        <div className="min-h-screen relative p-2 md:p-8 bg-gray-100">
            <div className="mb-6">
                <PageInfo pageName="Entreprise" pageLink={pageLink} />
            </div>

            <div className="mb-8 ">
                <h1 className="text-2xl font-black text-slate-800 flex items-center justify-center">Gestion des Missions</h1>
                <p className="text-slate-500 flex items-center justify-center"><i>Vue d&apos;ensemble des missions publiées par entreprise</i></p>
            </div>
            
            {missions.map(mission => (
                <MissionAdminCard key={mission.id} mission={mission} />
            ))}
        </div>
    )
}