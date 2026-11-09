"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { BoutonDossier, CarteDossier, Champ, MessageErreurDossier, MessageReussite } from "./ElementsDossier";
import { LONGUEUR_MIN_MOT_DE_PASSE, messageEnvoi } from "./regles";

const VIDE = { currentPassword: "", newPassword: "", newPassword_confirmation: "" };
type Nom = keyof typeof VIDE;

const REGLE_LONGUEUR = `${LONGUEUR_MIN_MOT_DE_PASSE} caractères au moins.`;

export function SectionMotDePasse() {
  const [valeurs, setValeurs] = useState(VIDE);
  const [erreurs, setErreurs] = useState<Partial<Record<Nom, string>>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);

  const signaler = (trouvees: Partial<Record<Nom, string>>) => {
    setErreurs(trouvees);
    const premier = (Object.keys(VIDE) as Nom[]).find((nom) => trouvees[nom]);
    if (premier) document.getElementById(`mot-de-passe-${premier}`)?.focus();
  };

  const changer = async (e: FormEvent) => {
    e.preventDefault();
    setReussite(null);
    setErreurEnvoi(null);
    const trouvees: Partial<Record<Nom, string>> = {};
    if (!valeurs.currentPassword) trouvees.currentPassword = "Indique ton mot de passe actuel.";
    if (valeurs.newPassword.length < LONGUEUR_MIN_MOT_DE_PASSE) trouvees.newPassword = REGLE_LONGUEUR;
    if (valeurs.newPassword !== valeurs.newPassword_confirmation) trouvees.newPassword_confirmation = "Les deux mots de passe ne sont pas identiques.";
    if (Object.keys(trouvees).length > 0) {
      signaler(trouvees);
      return;
    }

    setErreurs({});
    setEnvoi(true);
    try {
      await api.post("/candidat/update/password", valeurs);
      setValeurs(VIDE);
      setReussite("Mot de passe modifié.");
    } catch (err) {
      const code = statutErreur(err);
      if (code === 400) {
        signaler({ currentPassword: "Ce n'est pas ton mot de passe actuel." });
      } else if (code === 422 && champsRefuses(err).includes("newPassword")) {
        signaler({ newPassword: "Ce mot de passe n'est pas accepté. Choisis-en un autre." });
      } else {
        setErreurEnvoi(messageEnvoi(err, "Ton mot de passe n'a pas pu être modifié. Réessaie."));
      }
    } finally {
      setEnvoi(false);
    }
  };

  const champ = (nom: Nom, libelle: string, autoComplete: string, aide?: string) => (
    <Champ
      id={`mot-de-passe-${nom}`}
      name={nom}
      type="password"
      libelle={libelle}
      aide={aide}
      autoComplete={autoComplete}
      valeur={valeurs[nom]}
      erreur={erreurs[nom] ?? null}
      onChange={(valeur) => setValeurs((actuelles) => ({ ...actuelles, [nom]: valeur }))}
    />
  );

  return (
    <CarteDossier id="mot-de-passe" titre="Mot de passe">
      <form noValidate onSubmit={changer} className="grid gap-4">
        {champ("currentPassword", "Mot de passe actuel", "current-password")}
        {champ("newPassword", "Nouveau mot de passe", "new-password", REGLE_LONGUEUR)}
        {champ("newPassword_confirmation", "Confirme le nouveau mot de passe", "new-password")}
        <MessageErreurDossier message={erreurEnvoi} />
        <BoutonDossier type="submit" chargement={envoi} className="justify-self-start">
          Modifier mon mot de passe
        </BoutonDossier>
      </form>
      <MessageReussite message={reussite} />
    </CarteDossier>
  );
}
