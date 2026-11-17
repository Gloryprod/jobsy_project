"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { passwordSchema } from "@/lib/password";
import { BoutonSysteme } from "@/components/systeme";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CadreEveil } from "./CadreEveil";
import { ChampMotDePasse, ReglesMotDePasse } from "./ChampsAuth";
import { messageReseau } from "./regles";

const LIEN = "justify-self-start font-bold text-systeme-lueur underline underline-offset-2";

/** Nouveau mot de passe depuis le lien reçu par e-mail : lien incomplet ou expiré expliqué, même règle que l'API. */
export function Reinitialisation() {
  const parametres = useSearchParams();
  const token = parametres.get("token");
  const email = parametres.get("email");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [etat, setEtat] = useState<"saisie" | "expire" | "fait">(token && email ? "saisie" : "expire");

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    const trouvees: Record<string, string> = {};
    const verification = passwordSchema.safeParse(motDePasse);
    if (!verification.success) trouvees.password = verification.error.issues[0].message;
    if (motDePasse !== confirmation) trouvees.password_confirmation = "Les deux mots de passe ne sont pas identiques.";
    setErreurs(trouvees);
    if (trouvees.password || trouvees.password_confirmation) {
      document.getElementById(trouvees.password ? "password" : "password_confirmation")?.focus();
      return;
    }
    setEnvoi(true);
    try {
      await api.post("/reset-password", { token, email, password: motDePasse, password_confirmation: confirmation });
      setEtat("fait");
    } catch (err) {
      const refuses = statutErreur(err) === 422 ? champsRefuses(err) : [];
      // Laravel signale un jeton expiré ou déjà utilisé sur le champ email
      if (refuses.includes("email") || refuses.includes("token")) setEtat("expire");
      else if (refuses.includes("password")) setErreurs({ password: "Ce mot de passe n'est pas accepté. Suivez les règles ci-dessous." });
      else setErreurEnvoi(messageReseau(err, "Le mot de passe n'a pas pu être changé. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  const retour = { href: "/login", libelle: "Retour à la connexion" };

  if (etat === "expire") {
    return (
      <CadreEveil etiquette="Système" titre="Lien expiré ou incomplet" ton="alerte" retour={retour}>
        <p className="text-systeme-texte">Ce lien ne fonctionne plus : il a expiré (60 minutes), a déjà servi, ou a été coupé en le copiant.</p>
        <Link href="/forgot-password" className={LIEN}>
          Demander un nouveau lien
        </Link>
      </CadreEveil>
    );
  }

  if (etat === "fait") {
    return (
      <CadreEveil etiquette="Système" titre="Mot de passe changé" ton="recompense" retour={retour}>
        <p role="status" className="text-systeme-texte">
          Votre nouveau mot de passe est enregistré. Vous pouvez vous connecter.
        </p>
        <Link href="/login" className={LIEN}>
          Se connecter
        </Link>
      </CadreEveil>
    );
  }

  return (
    <CadreEveil etiquette="Système" titre="Nouveau mot de passe" retour={retour}>
      <form noValidate onSubmit={envoyer} className="grid gap-4">
        <p className="text-systeme-attenue">
          Pour le compte <strong className="break-all text-systeme-texte">{email}</strong>.
        </p>
        <ChampMotDePasse id="password" libelle="Nouveau mot de passe" autoComplete="new-password" valeur={motDePasse} erreur={erreurs.password} onChange={setMotDePasse} />
        <ReglesMotDePasse id="password-regles" valeur={motDePasse} />
        <ChampMotDePasse
          id="password_confirmation"
          libelle="Confirmez le mot de passe"
          autoComplete="new-password"
          valeur={confirmation}
          erreur={erreurs.password_confirmation}
          onChange={setConfirmation}
        />
        <Alerte message={erreurEnvoi} />
        <BoutonSysteme type="submit" chargement={envoi}>
          Enregistrer le mot de passe
        </BoutonSysteme>
      </form>
    </CadreEveil>
  );
}
