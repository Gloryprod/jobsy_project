"use client";

import { useRef, useState } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, FenetreSysteme, LignesValeurs } from "@/components/systeme";
import { CarteDossier } from "../statut/ElementsDossier";
import { FenetreRetrait } from "./FenetreRetrait";
import { decrireOperation, missionDe, RETRAIT_MINIMUM, type Coffre } from "./regles";

const lireCoffre = (url: string): Promise<Coffre> => api.get(url).then((reponse) => reponse.data);

const COULEUR = { gain: "text-emerald-700", attente: "text-amber-700", neutre: "text-slate-700" } as const;

/** Le Trésor : soldes réels (couche Système), retrait vers Mobile Money, historique des opérations (couche réalité). */
export function Tresor() {
  const coffre = useSWR<Coffre>("/candidat/wallet", lireCoffre);
  const [retrait, setRetrait] = useState(false);
  const [annonce, setAnnonce] = useState<string | null>(null);
  const bouton = useRef<HTMLButtonElement>(null);

  const c = coffre.data;
  const peutRetirer = !!c && c.balance_available >= RETRAIT_MINIMUM;

  let fenetre;
  if (coffre.isLoading) {
    fenetre = (
      <FenetreSysteme etiquette="Trésor" balayage={false}>
        <p className="text-systeme-attenue">Le Système ouvre ton coffre…</p>
      </FenetreSysteme>
    );
  } else if (coffre.error || !c) {
    fenetre = (
      <FenetreSysteme etiquette="Système" titre="Ton Trésor n'a pas pu se charger" ton="alerte" niveauTitre={2} balayage={false}>
        <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
        <BoutonSysteme onClick={() => coffre.mutate()} className="justify-self-start">
          Réessayer
        </BoutonSysteme>
      </FenetreSysteme>
    );
  } else {
    fenetre = (
      <FenetreSysteme etiquette="Trésor" titre="Ton Trésor" niveauTitre={2} ton="recompense">
        <LignesValeurs
          lignes={[
            { libelle: "Disponible", valeur: formaterFcfa(c.balance_available), ton: "or" },
            { libelle: "Scellé", valeur: formaterFcfa(c.balance_pending) },
            { libelle: "Total gagné", valeur: formaterFcfa(c.total_earned) },
          ]}
        />
        <p className="text-sm text-systeme-attenue">
          Une récompense est scellée quand l&apos;entreprise finance la mission : elle t&apos;est versée à la validation, commission Jobsy déduite.
        </p>
        {peutRetirer ? (
          <BoutonSysteme ref={bouton} onClick={() => setRetrait(true)} className="justify-self-start">
            Retirer vers Mobile Money
          </BoutonSysteme>
        ) : (
          <p className="text-systeme-attenue">Le retrait s&apos;ouvre dès {formaterFcfa(RETRAIT_MINIMUM)} disponibles.</p>
        )}
        <p role="status" className={annonce ? "text-sm text-systeme-lueur" : "sr-only"}>
          {annonce}
        </p>
      </FenetreSysteme>
    );
  }

  const operations = c?.transactions ?? [];

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <p className="text-sm font-bold text-[#000080]">Tes gains</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-[#000080] sm:text-3xl">Le Trésor</h1>
      </header>

      {fenetre}

      {c && (
        <CarteDossier id="historique" titre="Historique">
          {operations.length === 0 ? (
            <p className="text-slate-600">Aucune opération pour l&apos;instant. Chaque mission validée te rapporte sa récompense.</p>
          ) : (
            <ul className="grid gap-2">
              {operations.map((op) => {
                const d = decrireOperation(op);
                const mission = missionDe(op);
                const date = new Date(op.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
                return (
                  <li key={op.id} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 rounded-lg border border-slate-200 p-3">
                    <div className="grid min-w-0 gap-0.5">
                      <p className="font-semibold text-slate-900">{d.titre}</p>
                      {mission && <p className="text-sm break-words text-slate-700">{mission}</p>}
                      <p className="text-sm text-slate-600">
                        {date} · {d.statut}
                      </p>
                    </div>
                    <p className={`shrink-0 font-bold tabular-nums ${COULEUR[d.ton]} ${op.status === "cancelled" || (op.type === "withdrawal" && op.status === "failed") ? "line-through" : ""}`}>
                      {d.signe === "+" ? "+" : d.signe === "-" ? "−" : ""}
                      {formaterFcfa(Math.abs(op.amount))}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </CarteDossier>
      )}

      {c && (
        <FenetreRetrait
          ouvert={retrait}
          disponible={c.balance_available}
          onFermer={() => setRetrait(false)}
          cibleFocus={() => bouton.current}
          onRetire={async (message) => {
            setRetrait(false);
            await coffre.mutate();
            setAnnonce(message);
          }}
        />
      )}
    </div>
  );
}
