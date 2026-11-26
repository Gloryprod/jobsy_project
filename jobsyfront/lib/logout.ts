'use client';

import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import api from '@/lib/api';

export function useLogout() {
  const router = useRouter();

    const handleLogout = async () => {
        // Chargée au clic : la bibliothèque (21 Ko) ne pèse plus sur chaque page des espaces connectés
        const { default: Swal } = await import('sweetalert2');
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
                // Le cache des données (utilisateur, profil, missions) est vidé : la personne suivante ne les voit pas, même un instant
                await mutate(() => true, undefined, { revalidate: false });

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
