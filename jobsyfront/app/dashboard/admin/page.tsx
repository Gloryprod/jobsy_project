'use client';
import { useAuth } from "@/hooks/useAuth";

export default function AdminDashboardPage() {
    useAuth("ADMIN");
    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Bienvenue sur votre tableau de bord Admin</h1>
            <p>Gérez les utilisateurs, les entreprises et les offres d&apos;emploi depuis cet espace.</p>
        </div>
    );
}