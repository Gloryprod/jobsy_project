"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/dashboardAdmin/entreprises/ActionCell";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Contact {
    id: number;
    nom_promoteur: string;
    telephone: string;
    email: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    twitter: string;
}

export type Entreprise = {
    id: number;
    nom_officiel?: string;
    nom_entreprise: string;
    date_creation?: Date | null;
    secteur_activite?: string;
    localisation?: string;
    taille?: string;
    site_web?: string;
    description?: string;
    logo?: string;
    contact_entreprise?: Contact;
}

export const columns: ColumnDef<Entreprise>[] = [

    {
        accessorKey: "logo",
        header: () => <div className="text-left">Logo</div>,
        cell: ({ row }) => {
            return <Image src={`${process.env.NEXT_PUBLIC_API_URL}/storage/${row.getValue("logo")}`} alt="Logo de l'entreprise" width={40} height={40} className="w-12 h-12 object-cover rounded-full" unoptimized />;
        }
    },

    {
        accessorKey: "nom_entreprise",
        header: () => <div className="text-left">Entreprise</div>,
    },
   
    {
        accessorKey: "secteur_activite",
        header: () => <div className="text-left">Secteur d&apos;activité</div>,
    },
    {
        accessorKey: "localisation",
        header: () => <div className="text-left">Localisation</div>,
    },
    
    {
        id: "actions",
        cell: ({ row }) => <ActionCell entreprise={row.original} />,
    },


]