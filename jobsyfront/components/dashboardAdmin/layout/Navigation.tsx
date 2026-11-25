'use client';

import { Banknote, Building2, GraduationCap, LayoutDashboard, Package, Users } from "lucide-react";
import { NavigationEspace, type SectionEspace } from "@/components/dashboardEntreprise/layout/Navigation";

const A = "/dashboard/admin";

// Partagé avec le menu mobile de l'en-tête. Pas d'entrée « Profil » : l'administration n'a pas de page de profil.
export const SECTIONS_ADMIN: SectionEspace[] = [
    {
        title: "Menu",
        items: [{ id: "home", name: "Tableau de bord", icon: LayoutDashboard, href: A }]
    },
    {
        title: "Candidats",
        items: [
            { id: "applicants", name: "Candidats", icon: Users, href: `${A}/listCandidateProfile`, prefixe: `${A}/detailProfilCandidat` },
            { id: "withdrawals", name: "Décaissements", icon: Banknote, href: `${A}/withdrawRequests` },
            { id: "logistics", name: "Validation Logistique", icon: Package, href: `${A}/logistics_approval` }
        ]
    },
    {
        title: "Entreprises",
        items: [{ id: "enterprises", name: "Entreprises", icon: Building2, href: `${A}/entreprises/list`, prefixe: `${A}/entreprises` }]
    },
    {
        title: "Formations",
        items: [{ id: "courses", name: "Formations", icon: GraduationCap, href: `${A}/courses/list`, prefixe: `${A}/courses` }]
    }
];

export default function Navigation(props: { isCollapsed: boolean; setIsCollapsed: (collapsed: boolean) => void }) {
    return <NavigationEspace {...props} sections={SECTIONS_ADMIN} libelle="Administration" />;
}
