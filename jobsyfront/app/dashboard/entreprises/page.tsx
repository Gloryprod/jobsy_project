'use client'
import { useAuth } from "@/hooks/useAuth";
import { TableauGuilde } from "@/components/dashboardEntreprise/guilde/TableauGuilde";

// Le tableau de bord entreprise, refait au lot 7a de la refonte (la Guilde) : voir components/dashboardEntreprise/guilde
export default function EntreprisesDashboardPage() {
  useAuth("ENTREPRISE");
  return <TableauGuilde />;
}
