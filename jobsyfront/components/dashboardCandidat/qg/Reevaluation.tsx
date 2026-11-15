"use client";

import { useState } from "react";
import { mutate } from "swr";
import api from "@/lib/api";
import { BoutonSysteme, EmblemeRang, FenetreSysteme, LienSysteme } from "@/components/systeme";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useNotifications } from "@/hooks/useNotifications";
import { formaterXp } from "@/lib/progression";

/**
 * La réévaluation de rang : une fenêtre du Système s'ouvre une seule fois quand le rang a vraiment changé
 * (notification rank_promoted de l'API, RankPromotedNotification). La fermer marque la notification comme lue.
 */
export function Reevaluation() {
  const { notifications } = useNotifications();
  const [fermee, setFermee] = useState(false);

  // Plusieurs promotions non lues : une seule fenêtre, du premier rang au dernier
  const promotions = notifications
    .filter((n) => !n.read_at && n.data.type === "rank_promoted" && typeof n.data.rank === "string")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  if (fermee || promotions.length === 0) return null;

  const ancien = promotions[0].data.previous_rank;
  const derniere = promotions[promotions.length - 1].data;
  const rang = String(derniere.rank);

  const fermer = () => {
    setFermee(true);
    // En cas d'échec, la fenêtre reviendra à la prochaine visite
    void Promise.allSettled(promotions.map((n) => api.patch(`/candidat/notifications/${n.id}/read`))).then(() => mutate("/notifications"));
  };

  return (
    <Dialog open onOpenChange={(ouvert) => !ouvert && fermer()}>
      <DialogContent showCloseButton={false} className="gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-md">
        <FenetreSysteme etiquette="Réévaluation" ton="recompense" className="justify-items-center gap-4 text-center">
          <div className="flex items-center gap-4">
            {typeof ancien === "string" && (
              <>
                <EmblemeRang rang={ancien} taille="md" className="opacity-60" />
                <span aria-hidden="true" className="font-systeme text-2xl text-systeme-or">
                  →
                </span>
              </>
            )}
            <EmblemeRang rang={rang} taille="lg" />
          </div>
          <DialogTitle className="font-systeme text-2xl leading-tight font-bold text-balance text-systeme-texte">Tu passes au rang {rang}</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            {typeof derniere.score === "number" ? `Avec ${formaterXp(derniere.score)} d'expérience réelle, tu ` : "Tu "}
            {typeof ancien === "string" ? `quittes le rang ${ancien}. ` : "montes de rang. "}
            Les missions de rang {rang} te sont ouvertes.
          </DialogDescription>
          <div className="flex flex-wrap justify-center gap-2.5">
            <BoutonSysteme onClick={fermer}>Continuer</BoutonSysteme>
            <LienSysteme href="/dashboard/candidats/missions" variante="contour" onClick={fermer}>
              Voir les missions
            </LienSysteme>
          </div>
        </FenetreSysteme>
      </DialogContent>
    </Dialog>
  );
}
