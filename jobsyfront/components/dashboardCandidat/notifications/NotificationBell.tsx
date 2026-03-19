"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import pusher  from "@/lib/pusher-client";
import api from "@/lib/api";

declare global {
  interface Window {
    USER_ID: string;
  }
}

export function NotificationBell() {
  const [count, setCount] = useState(0);

  // Charger le nombre de notifications non lues
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("candidat/notifications/unread");
        const data = await res.data.data;
        setCount(data.length || 0);
      } catch (e) {
        console.error("Erreur chargement notifications :", e);
      }
    }

    load();
  }, []);

  useEffect(() => {
    const channel = pusher.subscribe(`user-${window.USER_ID}`);

    channel.bind("new-notification", () => {
      setCount((c) => c + 1);
    });

    return () => {
      pusher.unsubscribe(`user-${window.USER_ID}`);
    };
  }, []);

  return (
    <Link href="/dashboard/candidats/notifications" className="relative block">
      {/* Icône */}
      <div className="w-6 h-6">
        <Bell className="w-6 h-6 text-white hover:text-slate-300 transition-colors duration-150" />
      </div>

      {/* Badge */}
      {count > 0 && (
        <span className="
          absolute -top-1 -right-1 
          bg-red-600 text-white text-xs font-semibold 
          rounded-full h-4 min-w-4 
          px-1 flex items-center justify-center
          animate-pulse
        ">
          {count}
        </span>
      )}
    </Link>
  );
}
