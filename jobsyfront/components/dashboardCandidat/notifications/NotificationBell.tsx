// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Bell } from "lucide-react";
// import pusher  from "@/lib/pusher-client"; 
// import api from "@/lib/api";

// declare global {
//   interface Window {
//     USER_ID: string;
//   }
// }

// export function NotificationBell() {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     async function load() {
//       try {
//         const res = await api.get("candidat/notifications/unread");
//         const data = res.data.data; 
//         setCount(data.length || 0);
//       } catch (e) {
//         console.error("Erreur chargement notifications :", e);
//       }
//     }

//     load();
//   }, []);

//   // Écoute Pusher en temps réel
//   useEffect(() => {
//     if (typeof window === "undefined" || !window.USER_ID) {
//       console.warn("Pusher : ID utilisateur introuvable pour l'abonnement.");
//       return;
//     }

//     const channelName = `user-${window.USER_ID}`;
//     const channel = pusher.subscribe(channelName);

//     channel.bind("new-notification", () => {
//       setCount((c) => c + 1);
//     });

//     return () => {
//       pusher.unsubscribe(channelName);
//     };
//   }, []); // S'exécute une fois que le composant est monté côté client

//   return (
//     <Link href="/dashboard/candidats/notifications" className="relative block">
//       {/* Icône */}
//       <div className="w-6 h-6">
//         <Bell className="w-6 h-6 text-white hover:text-slate-300 transition-colors duration-150" />
//       </div>

//       {/* Badge */}
//       {count > 0 && (
//         <span className="
//           absolute -top-1 -right-1 
//           bg-red-600 text-white text-xs font-semibold 
//           rounded-full h-4 min-w-4 
//           px-1 flex items-center justify-center
//           animate-pulse
//         ">
//           {count}
//         </span>
//       )}
//     </Link>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { getPusherClient } from "@/lib/pusher-client"; // Notre fonction dynamique
import api from "@/lib/api";

declare global {
  interface Window {
    USER_ID: string;
  }
}

export function NotificationBell() {
  const [count, setCount] = useState(0);

  // 1. Charger les notifications existantes (inchangé)
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("candidat/notifications/unread");
        console.log("Notifications non lues chargées :", res.data.data); // Log pour vérifier les données
        setCount(res.data.data.length || 0);
      } catch (e) {
        console.error("Erreur chargement notifications :", e);
      }
    }
    load();
  }, []);

  // 2. Écoute en temps réel via l'import dynamique
  useEffect(() => {
    // Sécurité de base
    if (typeof window === "undefined" || !window.USER_ID) return;

    let activeChannel: any   = null;
    let currentPusher: any = null;
    const channelName = `user-${window.USER_ID}`;

    // On crée une sous-fonction asynchrone pour attendre Pusher
    const initPusher = async () => {
      const pusher = await getPusherClient();
      
      if (pusher) {
        currentPusher = pusher;
        activeChannel = pusher.subscribe(channelName);

        activeChannel.bind("new-notification", () => {
          setCount((c) => c + 1);
        });
      }
    };

    initPusher();

    // Nettoyage à la désinscription du composant
    return () => {
      if (currentPusher && activeChannel) {
        currentPusher.unsubscribe(channelName);
      }
    };
  }, []); // S'exécute une seule fois côté client

  return (
    <Link href="/dashboard/candidats/notifications" className="relative block">
      <div className="w-6 h-6">
        <Bell className="w-6 h-6 text-white hover:text-slate-300 transition-colors duration-150" />
      </div>

      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold rounded-full h-4 min-w-4 px-1 flex items-center justify-center animate-pulse">
          {count}
        </span>
      )}
    </Link>
  );
}