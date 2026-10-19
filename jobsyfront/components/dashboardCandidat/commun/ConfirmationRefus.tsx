"use client";

import type { ReactNode } from "react";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "../epreuve/Alerte";

type Props = {
  ouvert: boolean;
  titre: string;
  description: ReactNode;
  libelleConfirmer: string;
  chargement: boolean;
  erreur: string | null;
  onConfirmer: () => void;
  onFermer: () => void;
  /** Élément qui reprend le focus à la fermeture : le bouton « Décliner », ou le message de résultat s'il a disparu. */
  cibleFocus: () => HTMLElement | null;
};

/**
 * Confirmation avant une réponse négative définitive (décliner une invitation ou une offre).
 * Fenêtre accessible : focus gardé, Échap pour annuler, sauf pendant l'envoi.
 */
export function ConfirmationRefus({ ouvert, titre, description, libelleConfirmer, chargement, erreur, onConfirmer, onFermer, cibleFocus }: Props) {
  return (
    <Dialog
      open={ouvert}
      onOpenChange={(estOuvert) => {
        if (!estOuvert && !chargement) onFermer();
      }}
    >
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(e) => {
          // Sans déclencheur Radix, le focus repartirait en haut de page
          const cible = cibleFocus();
          if (cible?.isConnected) {
            e.preventDefault();
            cible.focus();
          }
        }}
        className="gap-0 border-0 bg-transparent p-0 shadow-none sm:max-w-md"
      >
        <FenetreSysteme etiquette="Système" ton="alerte" balayage={false}>
          <DialogTitle className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte">{titre}</DialogTitle>
          <DialogDescription asChild>
            <div className="grid gap-2 text-[0.98rem] text-systeme-attenue">{description}</div>
          </DialogDescription>
          <Alerte message={erreur} />
          <div className="flex flex-wrap gap-2.5 pt-1">
            <BoutonSysteme onClick={onConfirmer} chargement={chargement} className="bg-systeme-alerte">
              {libelleConfirmer}
            </BoutonSysteme>
            <DialogClose asChild>
              <BoutonSysteme variante="contour" disabled={chargement}>
                Annuler
              </BoutonSysteme>
            </DialogClose>
          </div>
        </FenetreSysteme>
      </DialogContent>
    </Dialog>
  );
}
