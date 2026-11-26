"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { COMMISSION, messageSuivi, montant, nomRecrute, verifierEvaluation, XP_VALIDATION, type ErreursEvaluation, type OffreRecrute } from "./regles";

type Props = {
  offre: OffreRecrute;
  ouvert: boolean;
  onFermer: () => void;
  cibleFocus: () => HTMLElement | null;
  onTermine: (message: string) => void;
  onActualiser: () => void;
};

/** Valider le travail : une note et un avis, puis le paiement du candidat par l'API (séquestre libéré, commission prélevée). */
export function FenetreValidation({ offre, ouvert, onFermer, cibleFocus, onTermine, onActualiser }: Props) {
  const [note, setNote] = useState<number | null>(null);
  const [avis, setAvis] = useState("");
  const [erreurs, setErreurs] = useState<ErreursEvaluation>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const nom = nomRecrute(offre);
  const brut = montant(offre.application?.mission?.reward);
  const net = brut - Math.round(brut * COMMISSION);

  const valider = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    const trouvees = verifierEvaluation({ note, avis });
    setErreurs(trouvees);
    if (trouvees.note) return document.getElementById("note-1")?.focus();
    if (trouvees.avis) return document.getElementById("evaluation-avis")?.focus();
    setEnvoi(true);
    try {
      await api.post(`/mission-offers/${offre.id}/update-status`, { status: "validated", rating: note, recruiter_review: avis.trim() || null });
      onTermine(`Travail validé : ${nom} est payé.`);
    } catch (err) {
      setErreur(messageSuivi(err, "La validation n'a pas pu aboutir. Réessayez dans quelques instants."));
      onActualiser();
    } finally {
      setEnvoi(false);
    }
  };

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
          <DialogTitle className="font-systeme text-xl font-bold text-systeme-texte">Valider le travail de {nom}</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            {nom} recevra {formaterFcfa(net)} (la récompense moins {COMMISSION * 100} % de commission Jobsy) et {XP_VALIDATION} points d&apos;expérience. La
            validation est définitive.
          </DialogDescription>
          <form noValidate onSubmit={valider} className="grid gap-4">
            <fieldset className="grid gap-2" aria-describedby={erreurs.note ? "note-erreur" : undefined}>
              <legend className="mb-1 font-semibold text-systeme-texte">Note du travail (5 = excellent)</legend>
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-[3px] border border-systeme-lueur/40 px-3 font-bold text-systeme-texte has-checked:border-systeme-lueur has-checked:bg-systeme-lueur/15"
                  >
                    <input id={`note-${n}`} type="radio" name="note" checked={note === n} onChange={() => setNote(n)} className="size-4 accent-systeme-lueur" />
                    {n}
                    <span className="sr-only"> sur 5</span>
                  </label>
                ))}
              </div>
              {erreurs.note && (
                <p id="note-erreur" className="text-sm font-semibold text-systeme-alerte">
                  {erreurs.note}
                </p>
              )}
            </fieldset>
            <div className="grid gap-1.5">
              <label htmlFor="evaluation-avis" className="font-semibold text-systeme-texte">
                Votre avis <span className="font-normal text-systeme-attenue">(facultatif)</span>
              </label>
              <textarea
                id="evaluation-avis"
                rows={4}
                value={avis}
                onChange={(e) => setAvis(e.target.value)}
                aria-invalid={erreurs.avis ? true : undefined}
                aria-describedby={erreurs.avis ? "evaluation-avis-erreur" : undefined}
                className={`${CLASSES_SAISIE} py-2`}
              />
              {erreurs.avis && (
                <p id="evaluation-avis-erreur" className="text-sm font-semibold text-systeme-alerte">
                  {erreurs.avis}
                </p>
              )}
            </div>
            <Alerte message={erreur} />
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme type="submit" chargement={envoi}>
                Valider et payer
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
