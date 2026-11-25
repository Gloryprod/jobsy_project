'use client';

import useSWR from "swr";
import api from "@/lib/api";

/**
 * L'utilisateur connecté (GET /user), lu une seule fois par page : le contexte (UserProvider) et la garde (useAuth)
 * partagent la même requête grâce à la clé SWR. Avant, chacun faisait la sienne, avec sa requête de vérification CORS.
 */
export const CLE_UTILISATEUR = "/user";
export const lireUtilisateur = (url: string) => api.get(url).then((reponse) => reponse.data);
export const OPTIONS_UTILISATEUR = { revalidateOnFocus: false, shouldRetryOnError: false };

export function useCurrentUser() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error, isLoading } = useSWR<any>(CLE_UTILISATEUR, lireUtilisateur, OPTIONS_UTILISATEUR);
  const message = error ? (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Impossible de récupérer l'utilisateur" : null;
  return { user: data ?? null, loading: isLoading, error: message };
}
