'use client'
import { use } from "react";
import { DossierCandidat } from "@/components/dashboardEntreprise/candidatures/DossierCandidat";

// Le dossier d'un candidat, refait au lot 7c-A de la refonte : voir components/dashboardEntreprise/candidatures
export default function DetailProfil({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <DossierCandidat candidatId={id} />;
}
