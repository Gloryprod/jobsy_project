"use client"

import { useState } from "react"
import { Mission } from "@/app/dashboard/entreprises/missions/list/columns" 
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { MoreHorizontal, Eye, Edit, Trash, XCircle } from "lucide-react" 
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


export const ActionCell = ({ mission }: { mission: Mission }) => {
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const deactivateMutation = useMutation({
      mutationFn: (id: number) => api.get(`/missions/deactivate/${id}`),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['missions'] });
          if (mission.active) {
            toast.success("Mission activée avec succès.");
          }else{
            toast.success("Mission désactivée avec succès.");
          }
      },
      onError: (error: any) => {
          const message = error.response?.data?.message || "Une erreur est survenue";
          toast.error(message);
      }
  });

  const closeMutation = useMutation({
      mutationFn: (id: number) => api.get(`/missions/close/${id}`),
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['missions'] });
            toast.success("Mission cloturée avec succès.");
      },
      onError: (error: any) => {
          const message = error.response?.data?.message || "Une erreur est survenue";
          toast.error(message);
      }
  });

  const handleDelete = async (mission_id:number) =>{

    const result = await Swal.fire({
      title: `Voulez-vous supprimer cette offre ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    
    if (result.isConfirmed) {
      try {            
          await api.delete(`/missions/${mission_id}`)
          toast.success("Suppression effectuée avec succès.");   
      } catch (error: any) {
          const messages = error.response?.data?.message;
          toast.error(messages);
      }
    }
  }

  const handleDeactivate = async (mission_id:number) =>{

    const title = mission.active ? "Voulez-vous désactiver cette offre ? Elle ne sera plus visible par les candidats." : "Voulez-vous réactiver cette offre ? Elle sera à nouveau visible par les candidats.";

    const result = await Swal.fire({
      title: title,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    
    if (result.isConfirmed) {
      deactivateMutation.mutate(mission_id);
    }
  }

  const handleCloseMission = async (mission_id:number) => {
      try {
        const title = "Voulez-vous vraiment clôturer les candidatures à cette offre ? Les candidatures en attente seront rejetées et cette mission ne sera plus visible par les candidats.";

        const result = await Swal.fire({
          title: title,
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Oui",
          cancelButtonText: "Annuler",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
        });
        
        if (result.isConfirmed) {
          closeMutation.mutate(mission_id);  
        }
      } catch (error) {
        toast.error("Erreur lors de la clôture");
      }
  };

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
          <DropdownMenuItem onClick={() => router.push(`/dashboard/entreprises/missions/${mission.id}/applications`)} className="cursor-pointer"><Eye className="h-4 w-4" />Candidatures</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => handleDeactivate(mission.id)}>{mission.active ? "Désactiver" : "Activer"}</DropdownMenuItem>
          <DropdownMenuItem className="text-red-300 cursor-pointer" onClick={() => handleCloseMission(mission.id)}>Clôturer le recrutement</DropdownMenuItem>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Localisation</p>
                <p>{mission.location}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Rémunération</p>
                <p className="font-bold text-green-600">{mission.reward} FCFA</p>
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
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Difficulté du test</p>
                <p className="">{mission.test_severity === 'light' ? 'Facile' : mission.test_severity === 'standard' ? 'Moyen' : 'Difficile'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Niveau minimum requis</p>
                <p className="">{mission.min_rank_required === 'E' ? '< BAC' : mission.min_rank_required === 'D' ? 'BAC' : mission.min_rank_required === 'C' ? 'BTS / DTU' : mission.min_rank_required === 'B' ? 'Licence' : mission.min_rank_required === 'A' ? 'Master / Maîtrise' : 'Doctorat'}</p>
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