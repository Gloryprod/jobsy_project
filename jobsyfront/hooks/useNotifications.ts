'use client';

import useSWR from "swr";
import api from "@/lib/api";

export type AppNotification = {
  id: string;
  type: string;
  data: {
    type?: string;
    message?: string;
    mission_title?: string;
    mission_id?: number;
    offer_id?: number;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
};

const fetcher = (url: string) => api.get(url).then((res) => res.data.data as AppNotification[]);

/**
 * Notifications de l'utilisateur connecté (tous rôles), rafraîchies toutes les minutes et au retour sur l'onglet.
 * Remplace l'abonnement Pusher, jamais alimenté côté serveur.
 */
export function useNotifications(refreshInterval = 60_000) {
  const { data, mutate, isLoading } = useSWR("/notifications", fetcher, {
    refreshInterval,
    revalidateOnFocus: true,
  });

  const notifications = data ?? [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markAllAsRead = async () => {
    await api.patch("/notifications/mark-as-read");
    const now = new Date().toISOString();
    await mutate(notifications.map((n) => ({ ...n, read_at: n.read_at ?? now })), { revalidate: false });
  };

  return { notifications, unreadCount, markAllAsRead, isLoading };
}
