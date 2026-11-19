'use client';
import { use } from "react";
import { PageCandidatures } from "@/components/dashboardEntreprise/candidatures/PageCandidatures";

// Les candidatures d'une mission, refaites au lot 7c-A de la refonte : voir components/dashboardEntreprise/candidatures
export default function ApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <PageCandidatures missionId={id} />;
}
