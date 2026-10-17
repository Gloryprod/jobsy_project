'use client';
import { useAuth } from "@/hooks/useAuth";
import { QGCandidat } from "@/components/dashboardCandidat/qg/QGCandidat";

// Le QG remplace DashboardHome (refonte gamifiée, lot 1). L'ancien composant reste dans le dépôt : sa suppression revient à Gloria.
export default function CandidatsDashboardPage() {
  useAuth("JEUNE");

  return <QGCandidat />;
}
