'use client';
import { useAuth } from "@/hooks/useAuth";
import DashboardHome from "@/components/dashboardCandidat/layout/DashboardHome";

export default function CandidatsDashboardPage() {
  useAuth("JEUNE");

  return (
    <div className="p-8">
      <DashboardHome />
    </div>
  );
}
