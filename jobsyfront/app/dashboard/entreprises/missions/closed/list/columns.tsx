"use client"
 
import { ColumnDef } from "@tanstack/react-table";
import { ActionCell } from "@/components/dashboardEntreprise/missions/ActionCell";
import { Badge } from "@/components/ui/badge"

interface MissionOffer {
    id: number;
    application_id: number;
    start_date: string;
    place: string;
    onboarding_instructions: string;
    contact_person: string;
    expires_at: string;
    accepted_at: string;
    declined_at: string;
    decline_reason: string;
    application : Application
}

interface Application {
    id: number;
    candidat_id: number;
    mission_id: number;
    status: 'draft' | 'pending' | 'accepted'| 'rejected';
    global_score: number;
    badge: string;
    ai_summary: string;
    created_at: string;
    completed_at: string;
    updated_at: string;
    mission_offers: MissionOffer
}

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
  test_severity: 'light' | 'standard' | 'expert';
  category: string
  applicants: number;
  type_contrat: string;
  active: boolean
  min_rank_required: string;
  applications: Application[]
}

export const columns: ColumnDef<Mission>[] = [
    {
        id: "index",
        header: () => <div className="text-center w-10">#</div>,
        cell: ({ row }) => {
            // row.index commence à 0, donc on ajoute 1
            return (
                <div className="text-center font-medium text-slate-400">
                    {row.index + 1}
                </div>
            );
        },
    },

    {
        accessorKey: "title",
        header: () => <div className="text-left">Postes/Missions</div>,
    },
    // {
    //     accessorKey: "reward",
    //     header: () => <div className="text-left">Rémunération</div>,
    //     cell: ({ row }) => {
    //     const reward = parseFloat(row.getValue("reward"))
    //     const formatted = new Intl.NumberFormat("en-US", {
    //         style: "currency",
    //         currency: "USD",
    //     }).format(reward)
    
    //     return <div className="text-left font-medium">{formatted}</div>
    //     },
    // },
    // {
    //     accessorKey: "deadline",
    //     header: () => <div className="text-left">Délai</div>,
    //     cell: ({ row }) => {
    //         const date = new Date(row.getValue("deadline"));
    //         const formatted = new Intl.DateTimeFormat("fr-FR", {
    //         day: "2-digit",
    //         month: "short",
    //         year: "numeric",
    //         }).format(date);

    //         return <div className="font-medium">{formatted}</div>;
    //     },
    // },
    {
        accessorKey: "type_contrat",
        header: () => <div className="text-left">Type Contrat</div>,
    },
    // {
    //     accessorKey: "category",
    //     header: () => <div className="text-left">Catégorie</div>,
    // },
    {
        id: "applications_count",
        header: () => <div className="text-left">Candidatures</div>,
        cell: ({ row }) => {
            const count = row.original.applications?.length || 0;
            const statut = row.getValue("active");

            return (
                <div className="text-left">
                {statut ? (
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-3 font-bold">
                    {count}
                    </Badge>
                ) : (
                    <span className="text-slate-400 pl-4">-</span>
                )}
                </div>
            );
        },
    },
    {
        id: "offers_accapted_count",
        header: () => <div className="text-left">Confirmations Offres</div>,
        cell: ({ row }) => {
            const acceptedCount = row.original.applications.filter(app => 
            app.mission_offers && app.mission_offers.accepted_at !== null
            ).length;
            const statut = row.getValue("active");

            return (
                <div className="text-left">
                {statut ? (
                    <Badge variant="outline" className="bg-slate-50 border-slate-200 text-slate-600 px-3 font-bold">
                    {acceptedCount}
                    </Badge>
                ) : (
                    <span className="text-slate-400 pl-4">-</span>
                )}
                </div>
            );
        },
    },
    {
        accessorKey: "active",
        header: () => <div className="text-left">Statut</div>,
        cell: ({ row }) => {
            const statut = row.getValue("active");

            return <Badge className={statut ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}>{statut ? 'Activé' : 'Désactivé'}</Badge>;
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <ActionCell mission={row.original} />,
    },


]