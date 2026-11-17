"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "../epreuve/Alerte";
import { CLASSES_SAISIE } from "../commun/saisie";
import { nettoyerNumero, RESEAUX, RETRAIT_MINIMUM, verifierRetrait, type ErreursRetrait } from "./regles";

type Props = {
  ouvert: boolean;
  disponible: number;
  onFermer: () => void;
  /** Reprend le focus à la fermeture (sans déclencheur Radix, il repartirait en haut de page) */
  cibleFocus: () => HTMLElement | null;
  /** Retrait enregistré : recharge le coffre et annonce le résultat */
  onRetire: (message: string) => Promise<unknown>;
};

/** Demande de retrait vers Mobile Money : fenêtre accessible, règles de l'API vérifiées avant l'envoi. */
export function FenetreRetrait({ ouvert, disponible, onFermer, cibleFocus, onRetire }: Props) {
  const [montant, setMontant] = useState("");
  const [reseau, setReseau] = useState("");
  const [numero, setNumero] = useState("");
  const [erreurs, setErreurs] = useState<ErreursRetrait>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    const trouvees = verifierRetrait(montant, reseau, numero, disponible);
    setErreurs(trouvees);
    setErreurEnvoi(null);
    const premiere = (["montant", "reseau", "numero"] as const).find((cle) => trouvees[cle]);
    if (premiere) {
      document.getElementById(premiere === "reseau" ? `retrait-${RESEAUX[0]}` : `retrait-${premiere}`)?.focus();
      return;
    }
    setEnvoi(true);
    try {
      await api.post("/candidat/withdraw", { amount: Number(montant), payment_method: reseau, phone_number: nettoyerNumero(numero) });
      setMontant("");
      await onRetire(`Retrait de ${formaterFcfa(Number(montant))} demandé vers ${reseau}. Le montant est retiré de ton solde ; Jobsy traite la demande.`);
    } catch (err) {
      setErreurEnvoi(messageErreur(err, "Ta demande de retrait n'a pas pu être envoyée. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const aide = (id: string, texte: string) => (
    <p id={id} className="text-sm text-systeme-attenue">
      {texte}
    </p>
  );
  const erreur = (id: string, texte?: string) =>
    texte ? (
      <p id={id} className="text-sm font-semibold text-systeme-alerte">
        {texte}
      </p>
    ) : null;

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
        className="max-h-[90vh] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-md">
        <FenetreSysteme etiquette="Trésor" balayage={false}>
          <DialogTitle className="font-systeme text-xl font-bold text-systeme-texte">Retirer vers Mobile Money</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            Disponible : <strong className="text-systeme-or">{formaterFcfa(disponible)}</strong>. Le montant quitte ton solde dès la demande.
          </DialogDescription>
          <form noValidate onSubmit={envoyer} className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="retrait-montant" className="font-semibold text-systeme-texte">
                Montant en FCFA
              </label>
              {aide("retrait-montant-aide", `${RETRAIT_MINIMUM} FCFA au minimum.`)}
              <input
                id="retrait-montant"
                inputMode="numeric"
                value={montant}
                onChange={(e) => setMontant(e.target.value.replace(/\D/g, ""))}
                aria-invalid={erreurs.montant ? true : undefined}
                aria-describedby={`retrait-montant-aide${erreurs.montant ? " retrait-montant-erreur" : ""}`}
                className={CLASSES_SAISIE}
              />
              {erreur("retrait-montant-erreur", erreurs.montant)}
            </div>
            <fieldset className="grid gap-1.5" aria-describedby={erreurs.reseau ? "retrait-reseau-erreur" : undefined}>
              <legend className="mb-1.5 font-semibold text-systeme-texte">Réseau</legend>
              <div className="flex flex-wrap gap-2">
                {RESEAUX.map((r) => (
                  <label key={r} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-[3px] border border-systeme-lueur/40 px-3 text-systeme-texte has-checked:border-systeme-lueur has-checked:bg-systeme-lueur/15">
                    <input id={`retrait-${r}`} type="radio" name="reseau" value={r} checked={reseau === r} onChange={() => setReseau(r)} className="accent-[var(--color-systeme-lueur)]" />
                    {r}
                  </label>
                ))}
              </div>
              {erreur("retrait-reseau-erreur", erreurs.reseau)}
            </fieldset>
            <div className="grid gap-1.5">
              <label htmlFor="retrait-numero" className="font-semibold text-systeme-texte">
                Numéro Mobile Money
              </label>
              {aide("retrait-numero-aide", "Avec l'indicatif, par exemple +229 01 97 00 00 00.")}
              <input
                id="retrait-numero"
                type="tel"
                autoComplete="tel"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                aria-invalid={erreurs.numero ? true : undefined}
                aria-describedby={`retrait-numero-aide${erreurs.numero ? " retrait-numero-erreur" : ""}`}
                className={CLASSES_SAISIE}
              />
              {erreur("retrait-numero-erreur", erreurs.numero)}
            </div>
            <Alerte message={erreurEnvoi} />
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme type="submit" chargement={envoi}>
                Demander le retrait
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
