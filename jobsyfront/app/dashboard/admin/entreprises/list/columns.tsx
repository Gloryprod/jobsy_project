"use client"
 
import { STORAGE_URL } from '@/lib/api';
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
        id: "index",
        header: () => <div className="text-center w-10">#</div>,
        cell: ({ row }) => {
            // row.index commence à 0, donc on ajoute 1
            return (
                <div className="text-center font-medium text-slate-600">
                    {row.index + 1}
                </div>  
            );
        },
    },

    {
        accessorKey: "logo",
        header: () => <div className="text-left">Logo</div>,
        cell: ({ row }) => {
            const logo = row.original.logo;
            // Sans logo, l'initiale de l'entreprise (le nom est dans la colonne suivante) plutôt qu'une image cassée (/storage/null)
            if (!logo) {
                return (
                    <span aria-hidden="true" className="flex w-12 h-12 items-center justify-center rounded-full bg-slate-100 font-bold text-[#000080]">
                        {(row.original.nom_entreprise || "?").charAt(0).toUpperCase()}
                    </span>
                );
            }
            return <Image src={`${STORAGE_URL}/${logo}`} alt={`Logo de ${row.original.nom_entreprise}`} width={40} height={40} className="w-12 h-12 object-cover rounded-full" unoptimized />;
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
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => <ActionCell entreprise={row.original} />,
    },


]