'use client'
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageMission } from "@/components/dashboardEntreprise/missions/PageMission";

// Création ou relance (?missionId=) d'une mission, refaites au lot 7b de la refonte : voir components/dashboardEntreprise/missions
function Contenu() {
  const missionId = useSearchParams().get("missionId");
  return <PageMission missionId={missionId} mode={missionId ? "relancer" : "creer"} />;
}

export default function CreateJob() {
  return (
    <Suspense fallback={<p role="status">Chargement…</p>}>
      <Contenu />
    </Suspense>
  );
}
