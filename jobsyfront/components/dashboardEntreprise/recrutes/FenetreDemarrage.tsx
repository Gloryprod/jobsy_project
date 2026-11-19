"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { estGarantie, messageSuivi, montant, nomRecrute, type OffreRecrute } from "./regles";

type Props = {
  offre: OffreRecrute;
  disponible: number;
  ouvert: boolean;
  onFermer: () => void;
  cibleFocus: () => HTMLElement | null;
  /** Mission démarrée : message à annoncer dans la page */
  onTermine: (message: string) => void;
  /** Un appel a abouti ou échoué en route : la liste est à recharger */
  onActualiser: () => void;
};

/**
 * Confirmer la prise de service : la ponctualité, puis la récompense bloquée d'abord quand le solde le permet
 * (si ce blocage échoue, rien ne démarre), puis la mission en cours. Sans solde suffisant, la mission démarre quand même.
 */
export function FenetreDemarrage({ offre, disponible, ouvert, onFermer, cibleFocus, onTermine, onActualiser }: Props) {
  const [aLHeure, setALHeure] = useState<"oui" | "non" | null>(null);
  const [erreurChoix, setErreurChoix] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const nom = nomRecrute(offre);
  const brut = montant(offre.application?.mission?.reward);
  const garantie = estGarantie(offre);
  const bloquerDabord = !garantie && disponible >= brut;

  const demarrer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    if (!aLHeure) {
      setErreurChoix("Indiquez si le candidat est arrivé à l'heure.");
      document.getElementById("ponctualite-oui")?.focus();
      return;
    }
    setErreurChoix(null);
    setEnvoi(true);
    if (bloquerDabord) {
      try {
        await api.post("/entreprise/payments/lock_funds", { offerId: offre.id });
      } catch (err) {
        setErreur(messageSuivi(err, "La récompense n'a pas pu être bloquée. Réessayez dans quelques instants.") + " La mission n'a pas démarré.");
        setEnvoi(false);
        onActualiser();
        return;
      }
    }
    try {
      await api.post(`/mission-offers/${offre.id}/update-status`, { status: "in_progress", is_on_time: aLHeure === "oui" });
      onTermine(
        `Mission démarrée pour ${nom}. Le contrat est prêt à télécharger.${garantie || bloquerDabord ? "" : " Garantissez la récompense pour pouvoir payer le candidat."}`,
      );
    } catch (err) {
      setErreur(
        (bloquerDabord ? "La récompense est bloquée, mais la mission n'a pas pu démarrer. " : "") +
          messageSuivi(err, "La mission n'a pas pu démarrer. Réessayez dans quelques instants."),
      );
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
          <DialogTitle className="font-systeme text-xl font-bold text-systeme-texte">Confirmer la prise de service</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            {nom} a signalé sa présence. En confirmant, la mission démarre et le contrat est établi.
          </DialogDescription>
          <form noValidate onSubmit={demarrer} className="grid gap-4">
            <fieldset className="grid gap-2" aria-describedby={erreurChoix ? "ponctualite-erreur" : undefined}>
              <legend className="mb-1 font-semibold text-systeme-texte">Le candidat est-il arrivé à l&apos;heure ?</legend>
              {(
                [
                  ["oui", "Oui, à l'heure"],
                  ["non", "Non, en retard"],
                ] as const
              ).map(([valeur, libelle]) => (
                <label key={valeur} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-systeme-texte">
                  <input
                    id={`ponctualite-${valeur}`}
                    type="radio"
                    name="ponctualite"
                    checked={aLHeure === valeur}
                    onChange={() => setALHeure(valeur)}
                    className="size-4 accent-systeme-lueur"
                  />
                  {libelle}
                </label>
              ))}
              {erreurChoix && (
                <p id="ponctualite-erreur" className="text-sm font-semibold text-systeme-alerte">
                  {erreurChoix}
                </p>
              )}
            </fieldset>
            <p className="text-sm text-systeme-texte">
              {garantie
                ? "La récompense est déjà bloquée."
                : bloquerDabord
                  ? `La récompense de ${formaterFcfa(brut)} sera d'abord bloquée sur votre solde disponible (${formaterFcfa(disponible)}).`
                  : `Votre solde disponible (${formaterFcfa(disponible)}) ne couvre pas la récompense de ${formaterFcfa(brut)}. La mission démarrera quand même : garantissez ensuite la récompense par KkiaPay pour pouvoir payer le candidat.`}
            </p>
            <Alerte message={erreur} />
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme type="submit" chargement={envoi}>
                Démarrer la mission
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
