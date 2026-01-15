'use client'
import { useAuth } from "@/hooks/useAuth";

export default function EntreprisesDashboardPage() {
  useAuth("ENTREPRISE");
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Bienvenue sur votre tableau de bord Entreprises</h1>
      <p className="text-black">Ici, vous pouvez gérer votre profil, vos offres d'emploi et bien plus encore.</p>
    </div>
  );
}