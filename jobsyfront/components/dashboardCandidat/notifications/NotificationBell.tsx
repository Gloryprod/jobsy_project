"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

/** Lien vers les messages du Système, nommé avec le nombre de non lus. Ne pas le placer dans un bouton (deux arrêts au clavier). */
export function NotificationBell() {
  // Compteur rafraîchi toutes les minutes (voir useNotifications)
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/dashboard/candidats/notifications"
      aria-label={unreadCount > 0 ? `Notifications : ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Notifications"}
      className="relative inline-flex size-11 items-center justify-center rounded-xl text-white hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#F0E68C]"
    >
      <Bell aria-hidden="true" className="h-6 w-6" />
      {unreadCount > 0 && (
        <span aria-hidden="true" className="absolute top-1 right-1 min-w-5 rounded-full bg-red-600 px-1 text-[11px] leading-5 font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
