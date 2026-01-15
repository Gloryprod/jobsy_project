'use client';

import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import api from '@/lib/api';

export function useLogout() {
  const router = useRouter();

    const handleLogout = async () => {
        const result = await Swal.fire({
        title: "Voulez-vous vraiment vous déconnecter ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, déconnexion",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        });

        if (result.isConfirmed) {
    
            try {
                await api.post("/logout");

                Swal.fire({
                    icon: 'success',
                    title: 'Déconnexion réussie',
                    text: 'Vous avez été déconnecté avec succès.',                   
                })
                    router.push("/login");
                } catch (error: any) {
                console.error("Erreur lors de la déconnexion :", error);

                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de se déconnecter pour le moment.',
                    confirmButtonColor: '#d33'
                });
            }
        }        
    };

  return { handleLogout };
}
