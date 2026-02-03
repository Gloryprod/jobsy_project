"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/dashboardEntreprise/missions/ActionCell";
import { Badge } from "@/components/ui/badge"

export type Mission = {
  id: number;
  title: string;
  company: string;
  location: string;
  reward: number;
  duration: string; 
  deadline: Date;
  description: string;
  skills: string;
  urgency: 'normal' | 'urgent' | 'premium';
  category: 'tout' | 'diplomes' | 'non_diplomes';
  applicants: number;
  type_contrat: string;
  active: boolean
}

export const columns: ColumnDef<Mission>[] = [

    {
        accessorKey: "title",
        header: () => <div className="text-left">Titre</div>,
    },
    {
        accessorKey: "reward",
        header: () => <div className="text-left">Rémunération</div>,
        cell: ({ row }) => {
        const reward = parseFloat(row.getValue("reward"))
        const formatted = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(reward)
    
        return <div className="text-left font-medium">{formatted}</div>
        },
    },
    {
        accessorKey: "deadline",
        header: () => <div className="text-left">Délai</div>,
        cell: ({ row }) => {
            const date = new Date(row.getValue("deadline"));
            const formatted = new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            }).format(date);

            return <div className="font-medium">{formatted}</div>;
        },
    },
    {
        accessorKey: "type_contrat",
        header: () => <div className="text-left">Type de contrat</div>,
    },
    {
        accessorKey: "category",
        header: () => <div className="text-left">Catégorie</div>,
    },
    {
        accessorKey: "active",
        header: () => <div className="text-left">Statut</div>,
        cell: ({ row }) => {
            const statut = new Date(row.getValue("active"));

            return <Badge className={statut ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}>{statut ? 'Activé' : 'Désactivé'}</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell mission={row.original} />,
    },


]