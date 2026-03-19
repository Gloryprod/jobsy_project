"use client"

import { useState } from "react"
import { Entreprise } from "@/app/dashboard/admin/entreprises/list/columns" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react" 
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { useQueryClient, useMutation } from '@tanstack/react-query';


export const ActionCell = ({ entreprise }: { entreprise: Entreprise }) => {
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setShowDetails(true)} className="cursor-pointer">
            <Eye className="h-4 w-4" /> Détails
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/entreprises/${entreprise.id}/missions`)} className="cursor-pointer"><Eye className="h-4 w-4" />Missions</DropdownMenuItem>
          <DropdownMenuSeparator />
          
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-full rounded-3xl">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">{entreprise.nom_entreprise}</DialogTitle>
                {/* <DialogDescription className="text-lg text-primary">{mission.company}</DialogDescription> */}
              </div>
              
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                    <p>{entreprise.localisation}</p>
                </div>

                <div>
                    <p className="text-sm font-medium text-muted-foreground">Secteur d&apos;activité</p>
                    <p>{entreprise.secteur_activite}</p>
                </div>
              
                <div className="space-y-2 border-t pt-4 ">
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm leading-relaxed">{entreprise.description}</p>
                </div>

                <div className="space-y-2 border-t pt-4 ">
                    <p className="text-sm font-medium text-muted-foreground">Contacts</p>
                    <p>{entreprise.contact_entreprise?.nom_promoteur}</p>
                    <p>{entreprise.contact_entreprise?.telephone}</p>
                    <p>{entreprise.contact_entreprise?.email}</p>
                </div>


            </div>
          </div>
        </DialogContent>
    </Dialog>
    </>
  )
}