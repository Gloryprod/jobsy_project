"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { messageGuilde } from "../guilde/regles";
import { ORDRE_PRISE, verifierPriseDeService, type ErreursPrise, type PriseDeService } from "./regles";

export type ResultatEnvoi = { nom: string; envoye: boolean; message?: string };

/** Un destinataire de l'offre et la route qui la lui envoie (candidature retenue ou invitation acceptée). */
export type CiblePrise = { nom: string; url: string };

type Props = {
  cibles: CiblePrise[];
  /** Offre préremplie, pour corriger une offre encore sans réponse */
  initiales?: PriseDeService;
  ouvert: boolean;
  onFermer: () => void;
  cibleFocus: () => HTMLElement | null;
  /** Envois terminés : un résultat par candidat */
  onTermine: (resultats: ResultatEnvoi[]) => void;
};

const VIDE: PriseDeService = { start_date: "", start_time: "", place: "", contact_person: "", expires_at: "", onboarding_instructions: "" };

const CHAMPS: { id: keyof PriseDeService; libelle: string; type?: string; aide?: string; facultatif?: boolean }[] = [
  { id: "start_date", libelle: "Date de prise de service", type: "date" },
  { id: "start_time", libelle: "Heure d'arrivée", type: "time" },
  { id: "place", libelle: "Lieu", aide: "L'adresse où le candidat doit se présenter." },
  { id: "contact_person", libelle: "Personne à contacter", aide: "Nom et téléphone, par exemple : M. Adjovi, 01 97 00 00 00." },
  { id: "expires_at", libelle: "Réponse attendue avant le", type: "date", aide: "Au plus tard le jour de la prise de service." },
];

/** L'offre de prise de service (candidats retenus, invitation acceptée) : les informations, puis un envoi par candidat avec son résultat. */
export function FenetrePriseDeService({ cibles, initiales, ouvert, onFermer, cibleFocus, onTermine }: Props) {
  const [v, setV] = useState<PriseDeService>(initiales ?? VIDE);
  const [erreurs, setErreurs] = useState<ErreursPrise>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    const trouvees = verifierPriseDeService(v);
    setErreurs(trouvees);
    const premiere = ORDRE_PRISE.find((c) => trouvees[c]);
    if (premiere) {
      document.getElementById(`prise-${premiere}`)?.focus();
      return;
    }
    setEnvoi(true);
    const resultats: ResultatEnvoi[] = [];
    // Un envoi par candidat : un refus n'empêche pas les autres, et chacun a son résultat
    for (const c of cibles) {
      try {
        await api.post(c.url, { ...v, place: v.place.trim(), contact_person: v.contact_person.trim() });
        resultats.push({ nom: c.nom, envoye: true });
      } catch (err) {
        resultats.push({ nom: c.nom, envoye: false, message: messageGuilde(err, "L'offre n'a pas pu être envoyée.") });
      }
    }
    setEnvoi(false);
    if (resultats.every((r) => !r.envoye) && resultats.length === 1) {
      setErreurEnvoi(resultats[0].message ?? null);
      return;
    }
    setV(VIDE);
    onTermine(resultats);
  };

  const noms = cibles.map((c) => c.nom).join(", ");

  return (
    <Dialog open={ouvert} onOpenChange={(estOuvert) => !estOuvert && !envoi && onFermer()}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(e) => {
          const cible = cibleFocus();
          if (cible?.isConnected) {
            e.preventDefault();
            cible.focus();
          }
        }}
        className="max-h-[90vh] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-lg"
      >
        <FenetreSysteme etiquette="Guilde" balayage={false}>
          <DialogTitle className="font-systeme text-xl font-bold text-systeme-texte">Prise de service</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            {cibles.length > 1 ? "Ces candidats recevront" : "Ce candidat recevra"} une offre avec ces informations : <strong className="text-systeme-texte">{noms}</strong>.
          </DialogDescription>
          <form noValidate onSubmit={envoyer} className="grid gap-4">
            {CHAMPS.map((champ) => {
              const id = `prise-${champ.id}`;
              const decrit = [champ.aide ? `${id}-aide` : null, erreurs[champ.id] ? `${id}-erreur` : null].filter(Boolean).join(" ") || undefined;
              return (
                <div key={champ.id} className="grid gap-1.5">
                  <label htmlFor={id} className="font-semibold text-systeme-texte">
                    {champ.libelle}
                  </label>
                  {champ.aide && (
                    <p id={`${id}-aide`} className="text-sm text-systeme-attenue">
                      {champ.aide}
                    </p>
                  )}
                  <input
                    id={id}
                    type={champ.type ?? "text"}
                    value={v[champ.id]}
                    onChange={(e) => setV((actuelles) => ({ ...actuelles, [champ.id]: e.target.value }))}
                    aria-invalid={erreurs[champ.id] ? true : undefined}
                    aria-describedby={decrit}
                    required
                    className={CLASSES_SAISIE}
                  />
                  {erreurs[champ.id] && (
                    <p id={`${id}-erreur`} className="text-sm font-semibold text-systeme-alerte">
                      {erreurs[champ.id]}
                    </p>
                  )}
                </div>
              );
            })}
            <div className="grid gap-1.5">
              <label htmlFor="prise-onboarding_instructions" className="font-semibold text-systeme-texte">
                Consignes <span className="font-normal text-systeme-attenue">(facultatif)</span>
              </label>
              <textarea
                id="prise-onboarding_instructions"
                rows={4}
                value={v.onboarding_instructions}
                onChange={(e) => setV((actuelles) => ({ ...actuelles, onboarding_instructions: e.target.value }))}
                className={`${CLASSES_SAISIE} py-2`}
              />
            </div>
            <Alerte message={erreurEnvoi} />
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme type="submit" chargement={envoi}>
                Envoyer {cibles.length > 1 ? `les ${cibles.length} offres` : "l'offre"}
              </BoutonSysteme>
              <DialogClose asChild>
                <BoutonSysteme variante="contour" disabled={envoi}>
                  Annuler
                </BoutonSysteme>
              </DialogClose>
            </div>
          </form>
        </FenetreSysteme>
      </DialogContent>
    </Dialog>
  );
}
