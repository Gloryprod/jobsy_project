import type { Ref } from "react";
import { LienSysteme, LignesValeurs } from "@/components/systeme";
import { formaterFcfa } from "@/lib/formats";
import type { MissionEpreuve } from "./types";

/** Fin de l'épreuve : seulement ce que le système fait vraiment ensuite (aucun délai promis). */
export function FinEpreuve({ mission, titreRef }: { mission: MissionEpreuve; titreRef: Ref<HTMLHeadingElement> }) {
  return (
    <div className="grid gap-4">
      <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl font-bold text-systeme-or focus:outline-none">
        Candidature envoyée
      </h2>
      <div className="grid gap-2 text-systeme-attenue">
        <p>
          Ta candidature pour « <strong className="text-systeme-texte">{mission.title}</strong> » est envoyée. L&apos;IA note tes réponses, puis
          l&apos;entreprise examine les candidatures.
        </p>
        <p>Si elle te retient, tu reçois une offre par e-mail et dans tes notifications, avec un délai pour l&apos;accepter.</p>
      </div>
      <LignesValeurs
        lignes={[
          { libelle: "Récompense si la mission est validée", valeur: formaterFcfa(mission.reward) ?? "Non précisée", ton: "or" },
          { libelle: "Expérience", valeur: "+250 XP", ton: "or" },
        ]}
      />
      <div className="flex flex-wrap gap-3">
        <LienSysteme href="/dashboard/candidats">Voir mon QG</LienSysteme>
        <LienSysteme href="/dashboard/candidats/missions" variante="contour">
          Retour aux missions
        </LienSysteme>
      </div>
    </div>
  );
}
