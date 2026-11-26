'use client';
import { ListeMissions } from "@/components/dashboardEntreprise/missions/ListeMissions";

// Les missions clôturées, refaites au lot 7b de la refonte : voir components/dashboardEntreprise/missions
export default function ListMissionClosed() {
    return <ListeMissions cloturees />;
}
