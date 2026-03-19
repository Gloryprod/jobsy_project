"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, CheckCircle2, Clock, ArrowRight, Ghost } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import api from "@/lib/api";
import { ThreeDots } from "react-loader-spinner";
import toast from "react-hot-toast";

interface Notification {
  id: string;
  read_at: string | null;
  created_at: string;
  data: {
    type: string;
    mission_title?: string;
    message: string;
    offer_id?: string;
  };
}

interface NotificationGroup {
  label: string;
  items: Notification[];
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  async function loadNotifications() {
    try {
      setLoading(true);
      const res = await api.get("/candidat/notifications");
      setNotifications(res.data.data);
    } catch (error) {
      console.error("Erreur chargement notifications", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function markAllAsRead() {
    startTransition(async () => {
      try {
        await api.patch("/candidat/notifications/mark-as-read");
        await loadNotifications();
        toast.success("Toutes les notifications ont été marquées comme lues.");
      } catch (error) {
        console.error("Erreur lors de la mise à jour", error);
      }
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <Bell className="text-[#000080]" />
            Notifications
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Restez informé de l&apos;avancement de vos candidatures et actualités Jobsy
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllAsRead}
            disabled={isPending}
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#000080] hover:text-white transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? "Traitement..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {/* LOADER */}
      {loading && (
        <div className="flex justify-center items-center h-screen">
            <ThreeDots height="80" width="80" color="#000080" visible={true} />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <Ghost className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">
            Rien à signaler pour le moment ✨
          </p>
        </div>
      )}

      {/* LISTE DES NOTIFICATIONS */}
      <div className="space-y-8">
        {groupNotificationsByDate(notifications).map((group: NotificationGroup) => (
          <div key={group.label} className="space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
              {group.label}
            </h2>

            <div className="space-y-3">
              {group.items.map((n: Notification) => (
                <div 
                  key={n.id} 
                  className={`group relative p-5 rounded-2xl border transition-all duration-300 ${
                    n.read_at 
                    ? 'bg-white border-slate-100 opacity-70' 
                    : 'bg-white border-blue-100 shadow-md ring-1 ring-blue-50'
                  }`}
                >
                  {/* Point bleu pour les non-lues */}
                  {!n.read_at && (
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-[#000080] rounded-full" />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icône dynamique selon le type (basé sur ton notification array de Laravel) */}
                    <div className={`p-3 rounded-2xl ${n.data.type === 'mission_selection' ? 'bg-[#F0E68C]/30 text-[#000080]' : 'bg-blue-50 text-blue-600'}`}>
                      <CheckCircle2 size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-black text-slate-800 text-base leading-tight">
                          {n.data.mission_title || "Nouvelle mise à jour"}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          {format(new Date(n.created_at), 'HH:mm')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                        {n.data.message}
                      </p>

                      {/* Action spécifique pour les offres de mission */}
                      {n.data.offer_id && (
                        <Link 
                          href={`/dashboard/candidats/missions/offers/${n.data.offer_id}`}
                          className="inline-flex items-center gap-2 text-xs font-black text-[#000080] hover:gap-3 transition-all uppercase tracking-tighter"
                        >
                          Détails
                          <ArrowRight size={14} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------- UTILS : GROUPAGE PAR DATE ----------- */
function groupNotificationsByDate(notifs: Notification[]): NotificationGroup[] {
  const groups: Record<string, Notification[]> = {};

  notifs.forEach((notif) => {
    // Laravel utilise created_at par défaut
    const date = new Date(notif.created_at);
    const today = new Date();

    let label = "";

    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) label = "Aujourd'hui";
    else if (isYesterday) label = "Hier";
    else label = format(date, 'eeee d MMMM', { locale: fr });

    if (!groups[label]) groups[label] = [];
    groups[label].push(notif);
  });

  return Object.entries(groups).map(([label, items]) => ({
    label,
    items,
  }));
}