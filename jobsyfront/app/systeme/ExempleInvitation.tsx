"use client";

import { useState } from "react";
import { BoutonSysteme, LignesValeurs, MessageSysteme } from "@/components/systeme";

const fcfa = (montant: number) => `${montant.toLocaleString("fr-FR")} FCFA`;

/** Exemple du catalogue : le délai est fixé à 5 h 12 après l'ouverture de la page. */
export function ExempleInvitation() {
  const [echeance] = useState(() => new Date(Date.now() + (5 * 60 + 12) * 60_000).toISOString());

  return (
    <MessageSysteme
      etiquette="Invitation de guilde"
      titre="La Boutique Saint-Michel te propose une quête"
      echeance={echeance}
      actions={
        <>
          <BoutonSysteme>Voir la proposition</BoutonSysteme>
          <BoutonSysteme variante="contour">Plus tard</BoutonSysteme>
        </>
      }
    >
      <LignesValeurs
        lignes={[
          { libelle: "Quête", valeur: "Inventaire, 2 jours" },
          { libelle: "Récompense", valeur: fcfa(45000), ton: "or" },
        ]}
      />
    </MessageSysteme>
  );
}
