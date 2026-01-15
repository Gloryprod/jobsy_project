'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export function useAuth(allowedRole: string) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user");
        const user = res.data; 
        
        console.log("Utilisateur connecté :", user);

        // Vérification du rôle
        if (user.role !== allowedRole) {
          console.log("CALL /user AVEC COOKIE...");
          router.replace("/"); 
          return;
        }

      } catch (error: any) {
        // Si le cookie n’est pas valide => 401 Unauthorized
        if (error?.response?.status === 401) {
          console.log("Utilisateur non authentifié");
          router.replace("/login");
        } else {
          console.error("Erreur inconnue :", error);
          router.replace("/login");
        }
      }
    };

    checkAuth();
  }, [router, allowedRole]);
}
