'use client';
import { use } from "react";
import { EpreuveEntree } from "@/components/dashboardCandidat/epreuve/EpreuveEntree";

// La candidature devient l'épreuve d'entrée du portail (refonte gamifiée, lot 2b).
export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EpreuveEntree missionId={id} />;
}
