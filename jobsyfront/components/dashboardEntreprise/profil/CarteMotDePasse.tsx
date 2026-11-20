"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import api from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { PASSWORD_HINT, apiErrorMessage, passwordSchema } from "@/lib/password";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { CarteRealite } from "@/components/dashboardCandidat/qg/CarteRealite";
import { messageGuilde } from "../guilde/regles";
import { BOUTON_PLEIN } from "./CarteChamps";

const VIDE = { currentPassword: "", newPassword: "", newPassword_confirmation: "" };
type Nom = keyof typeof VIDE;
const CHAMPS: { nom: Nom; libelle: string; autoComplete: string; aide?: string }[] = [
  { nom: "currentPassword", libelle: "Mot de passe actuel", autoComplete: "current-password" },
  { nom: "newPassword", libelle: "Nouveau mot de passe", autoComplete: "new-password", aide: PASSWORD_HINT },
  { nom: "newPassword_confirmation", libelle: "Confirmez le nouveau mot de passe", autoComplete: "new-password" },
];

/** Changement du mot de passe : même règle que l'inscription et l'API (lib/password, PasswordPolicy), champs avec « Afficher ». */
export function CarteMotDePasse() {
  const [v, setV] = useState(VIDE);
  const [erreurs, setErreurs] = useState<Partial<Record<Nom, string>>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);
  const zoneReussite = useRef<HTMLParagraphElement>(null);
  // Après un envoi, React affiche le message plus tard que la prochaine image : le focus suit l'affichage
  useEffect(() => {
    if (reussite) zoneReussite.current?.focus();
  }, [reussite]);

  const signaler = (trouvees: Partial<Record<Nom, string>>) => {
    setErreurs(trouvees);
    const premier = CHAMPS.find((c) => trouvees[c.nom]);
    if (premier) document.getElementById(`mdp-${premier.nom}`)?.focus();
  };

  const changer = async (e: FormEvent) => {
    e.preventDefault();
    setReussite(null);
    setErreurEnvoi(null);
    const trouvees: Partial<Record<Nom, string>> = {};
    if (!v.currentPassword) trouvees.currentPassword = "Saisissez votre mot de passe actuel.";
    const regle = passwordSchema.safeParse(v.newPassword);
    if (!regle.success) trouvees.newPassword = regle.error.issues[0].message;
    if (v.newPassword !== v.newPassword_confirmation) trouvees.newPassword_confirmation = "Les deux mots de passe ne sont pas identiques.";
    if (Object.keys(trouvees).length > 0) return signaler(trouvees);

    setErreurs({});
    setEnvoi(true);
    try {
      await api.post("/entreprise/update/password", v);
      setV(VIDE);
      setReussite("Mot de passe modifié.");
    } catch (err) {
      const code = statutErreur(err);
      if (code === 400) signaler({ currentPassword: "Ce n'est pas votre mot de passe actuel." });
      else if (code === 422 && champsRefuses(err).includes("newPassword")) signaler({ newPassword: apiErrorMessage(err, "Ce mot de passe n'est pas accepté. Choisissez-en un autre.") });
      else setErreurEnvoi(messageGuilde(err, "Le mot de passe n'a pas pu être modifié. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <CarteRealite titre="Mot de passe">
      <form noValidate onSubmit={changer} className="grid max-w-md gap-4">
        {CHAMPS.map((c) => {
          const cid = `mdp-${c.nom}`;
          const decrit = [c.aide ? `${cid}-aide` : null, erreurs[c.nom] ? `${cid}-erreur` : null].filter(Boolean).join(" ") || undefined;
          return (
            <div key={c.nom} className="grid gap-1.5">
              <label htmlFor={cid} className="font-semibold">
                {c.libelle}
              </label>
              {c.aide && (
                <p id={`${cid}-aide`} className="text-sm text-slate-600">
                  {c.aide}
                </p>
              )}
              <PasswordInput
                id={cid}
                name={c.nom}
                autoComplete={c.autoComplete}
                value={v[c.nom]}
                onChange={(e) => setV((actuelles) => ({ ...actuelles, [c.nom]: e.target.value }))}
                aria-invalid={erreurs[c.nom] ? true : undefined}
                aria-describedby={decrit}
                className={CLASSES_SAISIE}
              />
              {erreurs[c.nom] && (
                <p id={`${cid}-erreur`} className="text-sm font-semibold text-red-700">
                  {erreurs[c.nom]}
                </p>
              )}
            </div>
          );
        })}
        {erreurEnvoi && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {erreurEnvoi}
          </p>
        )}
        <button type="submit" disabled={envoi} aria-busy={envoi || undefined} className={`${BOUTON_PLEIN} justify-self-start`}>
          {envoi ? "Modification…" : "Modifier le mot de passe"}
        </button>
      </form>
      <p ref={zoneReussite} tabIndex={-1} role="status" className="text-sm font-semibold text-emerald-800 focus:outline-none empty:hidden">
        {reussite}
      </p>
    </CarteRealite>
  );
}
