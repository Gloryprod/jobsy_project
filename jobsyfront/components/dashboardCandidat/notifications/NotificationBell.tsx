"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  // Compteur rafraîchi toutes les minutes (voir useNotifications)
  const { unreadCount } = useNotifications();

  return (
    <Link href="/dashboard/candidats/notifications" className="relative block" aria-label={`Notifications (${unreadCount} non lues)`}>
      <div className="w-6 h-6">
        <Bell className="w-6 h-6 text-white hover:text-slate-300 transition-colors duration-150" />
      </div>

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse">
          {unreadCount}
        </span>
      )}
    </Link>
  );
}
