"use client";

import { use } from "react";
import { OffreMission } from "@/components/dashboardCandidat/journal/OffreMission";

// L'offre à confirmer, selon son état réel : en attente, acceptée, déclinée ou expirée (refonte gamifiée, lot 2c).
export default function MissionOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OffreMission offreId={id} />;
}
