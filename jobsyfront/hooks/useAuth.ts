'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { CLE_UTILISATEUR, lireUtilisateur, OPTIONS_UTILISATEUR } from "./useCurrentUser";

/** Garde d'une page : sans session, retour à la connexion ; avec un autre rôle, retour à l'accueil. Même requête que UserProvider. */
export function useAuth(allowedRole: string) {
  const router = useRouter();
  const { data: user, error } = useSWR<{ role?: string }>(CLE_UTILISATEUR, lireUtilisateur, OPTIONS_UTILISATEUR);

  useEffect(() => {
    // Session absente ou expirée (401), ou API injoignable : on repart de la connexion
    if (error) router.replace("/login");
    else if (user && user.role !== allowedRole) router.replace("/");
  }, [user, error, router, allowedRole]);
}
