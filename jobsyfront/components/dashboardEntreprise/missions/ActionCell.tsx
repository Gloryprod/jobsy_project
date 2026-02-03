"use client"

import { useState } from "react"
import { Mission } from "@/app/dashboard/entreprises/missions/list/columns" 
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


// On crée un composant interne pour gérer l'état du Modal
export const ActionCell = ({ mission }: { mission: Mission }) => {
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

  const handleDelete = async (mission_id:number) =>{
        try {            
            await api.delete(`/missions/${mission_id}`)
            toast.success("Suppression effectuée avec succès.");   
        } catch (error: any) {
            const messages = error.response?.data?.message;
            toast.error(messages);
        }
   }

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
          <DropdownMenuItem onClick={() => router.push(`/dashboard/entreprises/missions/${mission.id}`)} className="cursor-pointer">
            <Edit className="h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer"><Eye className="h-4 w-4" />Candidatures</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">Désactiver</DropdownMenuItem>
          <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={() => handleDelete(mission.id)}><Trash className="h-4 w-4" /> Supprimer</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modal de détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-full rounded-3xl">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-bold">{mission.title}</DialogTitle>
                {/* <DialogDescription className="text-lg text-primary">{mission.company}</DialogDescription> */}
              </div>
              
            </div>
          </DialogHeader>

          <div className="grid gap-4 py-4 no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                <p>{mission.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Rémunération</p>
                <p className="font-bold text-green-600">{mission.reward} $</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date limite</p>
                <p>{format(new Date(mission.deadline), "dd MMMM yyyy", { locale: fr })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Catégorie</p>
                <p className="capitalize">{mission.category.replace('_', ' ')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Type de contrat</p>
                <p className="">{mission.type_contrat}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Nombre de poste</p>
                <p className="">{mission.applicants}</p>
              </div>
            </div>
            
            <div className="space-y-2 border-t pt-4 ">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p dangerouslySetInnerHTML={{ __html: mission.description }} />
              {/* <p className="text-sm leading-relaxed">{mission.description}</p> */}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Compétences</p>
              <div className="flex flex-wrap gap-2">
                {(Array.isArray(mission.skills) ? mission.skills : mission.skills.split(',')).map((skill, i) => (
                  <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}