"use client";

import { useState, type FormEvent } from "react";
import { useKKiaPay } from "kkiapay-react";
import api from "@/lib/api";
import { formaterFcfa } from "@/lib/formats";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { messageGuilde, RECHARGE_MINIMUM, verifierRecharge } from "./regles";

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  /** Reprend le focus à la fermeture (sans déclencheur Radix, il repartirait en haut de page) */
  cibleFocus: () => HTMLElement | null;
  /** Paiement ouvert : annonce la suite dans la page */
  onPaiementOuvert: (message: string) => void;
};

/** Recharge du portefeuille par KkiaPay : montant vérifié comme l'API, puis ouverture du paiement. */
export function FenetreRecharge({ ouvert, onFermer, cibleFocus, onPaiementOuvert }: Props) {
  const { openKkiapayWidget } = useKKiaPay();
  const [montant, setMontant] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    const refus = verifierRecharge(montant);
    setErreur(refus);
    setErreurEnvoi(null);
    if (refus) {
      document.getElementById("recharge-montant")?.focus();
      return;
    }
    setEnvoi(true);
    try {
      const reponse = await api.post("/entreprise/wallet/initiate-deposit", { amount: Number(montant) });
      const { public_key, intent, sandbox, amount } = reponse.data.data;
      // Seul l'identifiant de l'intention transite par le widget ; le webhook retrouve le reste côté serveur
      openKkiapayWidget({ amount, api_key: public_key, sandbox, data: JSON.stringify({ intent }) });
      setMontant("");
      onPaiementOuvert(
        `Paiement de ${formaterFcfa(amount)} ouvert dans la fenêtre KkiaPay. Votre solde sera mis à jour dès que KkiaPay aura confirmé le paiement.`,
      );
    } catch (err) {
      setErreurEnvoi(messageGuilde(err, "La recharge n'a pas pu être lancée. Réessayez dans quelques instants."));
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
        className="max-h-[90vh] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-md"
      >
        <FenetreSysteme etiquette="Portefeuille" balayage={false}>
          <DialogTitle className="font-systeme text-xl font-bold text-systeme-texte">Recharger le compte</DialogTitle>
          <DialogDescription className="text-systeme-attenue">
            Le paiement se fait par KkiaPay (Mobile Money ou carte). Le solde sert à mettre sous séquestre les récompenses de vos missions.
          </DialogDescription>
          <form noValidate onSubmit={envoyer} className="grid gap-4">
            <div className="grid gap-1.5">
              <label htmlFor="recharge-montant" className="font-semibold text-systeme-texte">
                Montant en FCFA
              </label>
              <p id="recharge-montant-aide" className="text-sm text-systeme-attenue">
                {RECHARGE_MINIMUM} FCFA au minimum, 10 000 000 FCFA au maximum.
              </p>
              <input
                id="recharge-montant"
                inputMode="numeric"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                aria-invalid={erreur ? true : undefined}
                aria-describedby={`recharge-montant-aide${erreur ? " recharge-montant-erreur" : ""}`}
                className={CLASSES_SAISIE}
              />
              {erreur && (
                <p id="recharge-montant-erreur" className="text-sm font-semibold text-systeme-alerte">
                  {erreur}
                </p>
              )}
            </div>
            <Alerte message={erreurEnvoi} />
            <div className="flex flex-wrap gap-2.5">
              <BoutonSysteme type="submit" chargement={envoi}>
                Payer avec KkiaPay
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
