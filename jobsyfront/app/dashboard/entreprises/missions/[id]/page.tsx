'use client'
import { use } from "react";
import { PageMission } from "@/components/dashboardEntreprise/missions/PageMission";

// Modification d'une mission, refaite au lot 7b de la refonte : voir components/dashboardEntreprise/missions
export default function EditJob({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PageMission missionId={id} mode="modifier" />;
}
