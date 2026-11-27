'use client';

import { useUser } from "@/context/UserProvider";
import { EnteteEspace } from "@/components/dashboardEntreprise/layout/Header";
import { SECTIONS_ADMIN } from "./Navigation";

/** En-tête de l'administration : celui de l'espace entreprise, sans cloche (l'API n'envoie aucune notification aux admins) ni page de profil. */
export default function Header() {
    const { user } = useUser();
    const nom = [user?.prenom, user?.nom].filter(Boolean).join(" ") || "Administration";
    return <EnteteEspace sections={SECTIONS_ADMIN} accueil="/dashboard/admin" nom={nom} espace="Administration" />;
}
