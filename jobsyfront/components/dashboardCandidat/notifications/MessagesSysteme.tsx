"use client";

import { useState } from "react";
import Link from "next/link";
import { useNotifications, type AppNotification } from "@/hooks/useNotifications";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";

const LIEN = "justify-self-start text-sm font-bold text-[#000080] underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

/** Où mène chaque type de notification (voir app/Notifications de l'API). */
function lienDe(n: AppNotification): { href: string; libelle: string } | null {
  const d = n.data;
  if (d.type === "mission_selection" && d.offer_id) return { href: `/dashboard/candidats/missions/offers/${d.offer_id}`, libelle: "Voir l'offre" };
  if (d.type === "reminder_urgent") return { href: "/dashboard/candidats/missions/en_cours", libelle: "Voir mes offres" };
  if (d.type === "rank_promoted") return { href: "/dashboard/candidats/missions", libelle: "Voir les missions" };
  return null;
}

const TITRES: Record<string, string> = {
  mission_selection: "Une entreprise t'a choisi",
  reminder_urgent: "Une offre attend ta réponse",
  mission_closed: "Recrutement terminé",
  rank_promoted: "Réévaluation de rang",
};

function jour(date: Date, maintenant: Date): string {
  const hier = new Date(maintenant);
  hier.setDate(maintenant.getDate() - 1);
  if (date.toDateString() === maintenant.toDateString()) return "Aujourd'hui";
  if (date.toDateString() === hier.toDateString()) return "Hier";
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

/** Les messages du Système : notifications regroupées par jour, message complet et lien utile. Même cache que la cloche. */
export function MessagesSysteme() {
  const { notifications, unreadCount, markAllAsRead, isLoading } = useNotifications();
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const toutLire = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      await markAllAsRead();
    } catch {
      setErreur("Les messages n'ont pas pu être marqués comme lus. Réessaie.");
    } finally {
      setEnvoi(false);
    }
  };

  const maintenant = new Date();
  const groupes = new Map<string, AppNotification[]>();
  for (const n of notifications) {
    const cle = jour(new Date(n.created_at), maintenant);
    groupes.set(cle, [...(groupes.get(cle) ?? []), n]);
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <p className="text-sm font-bold text-[#000080]">Tes notifications</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-[#000080] sm:text-3xl">Messages du Système</h1>
      </header>

      <FenetreSysteme etiquette="Système" balayage={false}>
        <p className="text-systeme-texte" aria-live="polite">
          {isLoading ? "Le Système relève tes messages…" : unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? "s" : ""} non lu${unreadCount > 1 ? "s" : ""}.` : "Tous tes messages sont lus."}
        </p>
        {unreadCount > 0 && (
          <BoutonSysteme variante="contour" onClick={toutLire} chargement={envoi} className="justify-self-start">
            Tout marquer comme lu
          </BoutonSysteme>
        )}
        {erreur && (
          <p role="alert" className="text-sm font-semibold text-systeme-alerte">
            {erreur}
          </p>
        )}
      </FenetreSysteme>

      {!isLoading && notifications.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">Aucun message pour l&apos;instant. Le Système te prévient ici quand une entreprise te répond.</p>
      )}

      {[...groupes].map(([libelle, liste]) => (
        <section key={libelle} aria-label={libelle} className="grid gap-2">
          <h2 className="text-sm font-bold text-slate-600 first-letter:uppercase">{libelle}</h2>
          <ul className="grid gap-2">
            {liste.map((n) => {
              const lien = lienDe(n);
              return (
                <li key={n.id} className={`grid gap-1 rounded-2xl border bg-white p-4 ${n.read_at ? "border-slate-200" : "border-[#000080]/40 shadow-sm"}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-bold text-slate-900">
                      {!n.read_at && <span className="mr-2 rounded bg-[#000080] px-1.5 py-0.5 text-xs font-bold text-white">Nouveau</span>}
                      {(typeof n.data.mission_title === "string" && n.data.mission_title) || TITRES[n.data.type ?? ""] || "Message du Système"}
                    </p>
                    <p className="text-sm text-slate-600">{new Date(n.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ")}</p>
                  </div>
                  {n.data.message && <p className="text-slate-700">{n.data.message}</p>}
                  {lien && (
                    <Link href={lien.href} className={LIEN}>
                      {lien.libelle}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
