"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { statutErreur } from "@/lib/erreurs";
import { BoutonSysteme } from "@/components/systeme";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { RenvoiConfirmation } from "@/components/forms/RenvoiConfirmation";
import { CadreEveil } from "./CadreEveil";
import { ChampAuth, ChampMotDePasse } from "./ChampsAuth";
import { emailValide, messageReseau } from "./regles";

const ACCUEIL_PAR_ROLE: Record<string, string> = {
  JEUNE: "/dashboard/candidats",
  ENTREPRISE: "/dashboard/entreprises",
  ADMIN: "/dashboard/admin",
};

/** La connexion : messages clairs (identifiants, compte non confirmé, tentatives), renvoi de la confirmation. */
export function Connexion() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [nonConfirme, setNonConfirme] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    setNonConfirme(null);
    const trouvees: Record<string, string> = {};
    if (!emailValide(email)) trouvees.email = "Indiquez une adresse e-mail valide.";
    if (!motDePasse) trouvees.password = "Indiquez votre mot de passe.";
    setErreurs(trouvees);
    if (trouvees.email || trouvees.password) {
      document.getElementById(trouvees.email ? "email" : "password")?.focus();
      return;
    }

    setEnvoi(true);
    try {
      // L'API pose les jetons en cookies httpOnly : rien à stocker côté navigateur
      const reponse = await api.post("/login", { email: email.trim(), password: motDePasse });
      // Rechargement complet : le contexte de l'utilisateur se reconstruit avec les nouveaux cookies
      window.location.href = ACCUEIL_PAR_ROLE[reponse.data.data.user.role] ?? "/";
    } catch (err) {
      const code = statutErreur(err);
      if (code === 403) {
        setNonConfirme(email.trim());
        setErreurEnvoi("Votre adresse n'est pas encore confirmée. Ouvrez le lien reçu par e-mail, ou demandez-en un nouveau.");
      } else if (code === 401 || code === 422) {
        setErreurEnvoi("E-mail ou mot de passe incorrect.");
      } else {
        setErreurEnvoi(messageReseau(err, "La connexion a échoué. Réessayez dans quelques instants."));
      }
      setEnvoi(false);
    }
  };

  return (
    <CadreEveil etiquette="Système" titre="Connexion" retour={{ href: "/", libelle: "Accueil" }}>
      <form noValidate onSubmit={envoyer} className="grid gap-4">
        <ChampAuth id="email" type="email" libelle="Adresse e-mail" autoComplete="email" valeur={email} erreur={erreurs.email} onChange={setEmail} />
        <ChampMotDePasse id="password" libelle="Mot de passe" autoComplete="current-password" valeur={motDePasse} erreur={erreurs.password} onChange={setMotDePasse} />
        <Link href="/forgot-password" className="justify-self-start text-sm font-bold text-systeme-lueur underline underline-offset-2">
          Mot de passe oublié ?
        </Link>
        <Alerte message={erreurEnvoi} />
        {nonConfirme && <RenvoiConfirmation email={nonConfirme} />}
        <BoutonSysteme type="submit" chargement={envoi}>
          Se connecter
        </BoutonSysteme>
        <p className="text-sm text-systeme-attenue">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-bold text-systeme-lueur underline underline-offset-2">
            S&apos;inscrire
          </Link>
        </p>
      </form>
    </CadreEveil>
  );
}
