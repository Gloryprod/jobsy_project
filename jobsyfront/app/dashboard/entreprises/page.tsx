'use client'
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/components/dashboardEntreprise/layout/Dashboard";

export default function EntreprisesDashboardPage() {
  useAuth("ENTREPRISE");
  return (
    <div className="">
      <Dashboard />
    </div>
  );
}