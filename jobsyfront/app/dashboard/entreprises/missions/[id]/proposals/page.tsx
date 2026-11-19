'use client';
import { use } from "react";
import { PageInvitations } from "@/components/dashboardEntreprise/invitations/PageInvitations";

// Les invitations d'une mission, refaites au lot 7c-B de la refonte : voir components/dashboardEntreprise/invitations
export default function ProposalsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <PageInvitations missionId={id} />;
}
