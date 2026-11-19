'use client';
import { use } from "react";
import { PageRecrutes } from "@/components/dashboardEntreprise/recrutes/PageRecrutes";

// Les recrutés d'une mission, refaits au lot 7d de la refonte : voir components/dashboardEntreprise/recrutes
export default function ConfirmedApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <PageRecrutes missionId={id} />;
}
