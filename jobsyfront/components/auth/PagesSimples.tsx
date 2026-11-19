"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Building2, UserRound } from "lucide-react";
import api from "@/lib/api";
import { BoutonSysteme } from "@/components/systeme";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CadreEveil } from "./CadreEveil";
import { ChampAuth } from "./ChampsAuth";
import { emailValide, messageReseau } from "./regles";

const CARTE =
  "grid gap-1 rounded-[3px] border border-systeme-lueur/40 p-4 text-left hover:border-systeme-lueur hover:bg-systeme-lueur/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur";

/** Le choix du profil, chacun expliqué en une phrase. */
export function ChoixProfil() {
  return (
    <CadreEveil etiquette="Éveil" titre="Créer un compte" retour={{ href: "/", libelle: "Accueil" }}>
      <p className="text-systeme-attenue">Qui êtes-vous ?</p>
      <Link href="/register/candidats" className={CARTE}>
        <span className="flex items-center gap-2 font-systeme text-lg font-bold text-systeme-texte">
          <UserRound aria-hidden="true" className="size-5 text-systeme-or" />
          Je cherche des missions
        </span>
        <span className="text-sm text-systeme-attenue">Jeune diplômé ou en formation : des missions payées, des formations et un rang qui monte avec l&apos;expérience.</span>
      </Link>
      <Link href="/register/entreprises" className={CARTE}>
        <span className="flex items-center gap-2 font-systeme text-lg font-bold text-systeme-texte">
          <Building2 aria-hidden="true" className="size-5 text-systeme-or" />
          Je recrute
        </span>
        <span className="text-sm text-systeme-attenue">Entreprise : publiez une mission et trouvez des jeunes au profil vérifié.</span>
      </Link>
      <p className="text-sm text-systeme-attenue">
        Déjà un compte ?{" "}
        <Link href="/login" className="font-bold text-systeme-lueur underline underline-offset-2">
          Se connecter
        </Link>
      </p>
    </CadreEveil>
  );
}

/** Mot de passe oublié : le résultat s'affiche dans la page, sans révéler si l'adresse est inscrite. */
export function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    if (!emailValide(email)) {
      setErreur("Indiquez une adresse e-mail valide.");
      document.getElementById("email")?.focus();
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      await api.post("/forgot-password", { email: email.trim() });
      setEnvoye(true);
    } catch (err) {
      setErreurEnvoi(messageReseau(err, "La demande n'a pas pu être envoyée. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <CadreEveil etiquette="Système" titre="Mot de passe oublié" retour={{ href: "/login", libelle: "Retour à la connexion" }}>
      {envoye ? (
        <p role="status" className="text-systeme-texte">
          Si un compte correspond à <strong className="break-all">{email.trim()}</strong>, un lien pour choisir un nouveau mot de passe vient de partir. Il est valable 60 minutes.
          Pensez à regarder dans les courriers indésirables.
        </p>
      ) : (
        <form noValidate onSubmit={envoyer} className="grid gap-4">
          <p className="text-systeme-attenue">Indiquez l&apos;adresse de votre compte : vous recevrez un lien pour choisir un nouveau mot de passe.</p>
          <ChampAuth id="email" type="email" libelle="Adresse e-mail" autoComplete="email" valeur={email} erreur={erreur} onChange={setEmail} />
          <Alerte message={erreurEnvoi} />
          <BoutonSysteme type="submit" chargement={envoi}>
            Recevoir le lien
          </BoutonSysteme>
        </form>
      )}
    </CadreEveil>
  );
}

/** L'adresse est confirmée : les prochaines étapes. */
export function AdresseConfirmee() {
  return (
    <CadreEveil etiquette="Éveil" titre="Adresse confirmée" ton="recompense" retour={{ href: "/", libelle: "Accueil" }}>
      <p className="text-systeme-texte">Votre compte est activé. Prochaines étapes :</p>
      <ol className="grid gap-1.5 text-systeme-texte">
        <li>1. Connectez-vous.</li>
        <li>2. Candidat : déposez votre CV, le Système en tire votre rang de départ. Entreprise : publiez votre première mission.</li>
      </ol>
      <Link
        href="/login"
        className="inline-flex min-h-11 items-center justify-center rounded-[3px] bg-systeme-lueur px-4 font-bold text-systeme-nuit hover:brightness-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
      >
        Se connecter
      </Link>
    </CadreEveil>
  );
}
