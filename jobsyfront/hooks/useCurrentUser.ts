'use client';

import { useState, useEffect } from "react";
import api from "@/lib/api";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data);
      } catch (err: any) {
        console.error("Erreur lors de la récupération de l'utilisateur :", err);
        setError(err?.response?.data?.message || "Impossible de récupérer l'utilisateur");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading, error };
}
