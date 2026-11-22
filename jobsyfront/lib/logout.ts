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
        // Couleurs contrastées avec le texte blanc des boutons (4,5:1 au moins)
        confirmButtonColor: "#b91c1c",
        cancelButtonColor: "#000080",
        });

        if (result.isConfirmed) {
    
            try {
                // L'API révoque les tokens et efface les cookies httpOnly (poste partagé, cybercafé...)
                await api.post("/logout");

                Swal.fire({
                    icon: 'success',
                    title: 'Déconnexion réussie',
                    text: 'Vous avez été déconnecté avec succès.',
                    confirmButtonColor: '#000080',                   
                })
                    router.push("/login");
                } catch (error) {
                console.error("Erreur lors de la déconnexion :", error);

                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Impossible de se déconnecter pour le moment.',
                    confirmButtonColor: '#b91c1c'
                });
            }
        }        
    };

  return { handleLogout };
}
