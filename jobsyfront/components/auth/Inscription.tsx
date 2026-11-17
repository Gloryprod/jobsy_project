"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { passwordSchema } from "@/lib/password";
import { BoutonSysteme } from "@/components/systeme";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { RenvoiConfirmation } from "@/components/forms/RenvoiConfirmation";
import { CadreEveil } from "./CadreEveil";
import { ChampAuth, ChampMotDePasse, ReglesMotDePasse } from "./ChampsAuth";
import { emailValide, erreursApi, messageReseau } from "./regles";

type Champ = { nom: string; libelle: string; autoComplete?: string; obligatoire?: boolean };

const PROFILS = {
  JEUNE: {
    titre: "Créer votre compte candidat",
    champs: [
      { nom: "prenom", libelle: "Prénom", autoComplete: "given-name", obligatoire: true },
      { nom: "nom", libelle: "Nom", autoComplete: "family-name", obligatoire: true },
    ],
    suite: "connectez-vous et déposez votre CV : le Système en tire votre rang de départ.",
  },
  ENTREPRISE: {
    titre: "Créer le compte de votre entreprise",
    champs: [
      { nom: "nom_entreprise", libelle: "Nom de l'entreprise", autoComplete: "organization", obligatoire: true },
      { nom: "secteur_activite", libelle: "Secteur d'activité" },
    ],
    suite: "connectez-vous et publiez votre première mission.",
  },
} satisfies Record<string, { titre: string; champs: Champ[]; suite: string }>;

/** L'inscription (candidat ou entreprise) : champs complets, erreurs de l'API traduites, puis la suite en trois étapes. */
export function Inscription({ role }: { role: keyof typeof PROFILS }) {
  const profil = PROFILS[role];
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [adresseDejaPrise, setAdresseDejaPrise] = useState(false);
  const [cree, setCree] = useState<{ email: string; envoye: boolean } | null>(null);

  const v = (nom: string) => valeurs[nom] ?? "";
  const changer = (nom: string) => (valeur: string) => setValeurs((actuelles) => ({ ...actuelles, [nom]: valeur }));

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    setAdresseDejaPrise(false);
    const trouvees: Record<string, string> = {};
    for (const champ of profil.champs as Champ[]) if (champ.obligatoire && !v(champ.nom).trim()) trouvees[champ.nom] = "Ce champ est obligatoire.";
    if (!emailValide(v("email"))) trouvees.email = "Indiquez une adresse e-mail valide.";
    const mdp = passwordSchema.safeParse(v("password"));
    if (!mdp.success) trouvees.password = mdp.error.issues[0].message;
    if (v("password") !== v("password_confirmation")) trouvees.password_confirmation = "Les deux mots de passe ne sont pas identiques.";
    setErreurs(trouvees);
    const ordre = [...profil.champs.map((c) => c.nom), "email", "password", "password_confirmation"];
    const premier = ordre.find((nom) => trouvees[nom]);
    if (premier) {
      document.getElementById(premier)?.focus();
      return;
    }

    setEnvoi(true);
    try {
      const reponse = await api.post("/register", { ...valeurs, email: v("email").trim(), role });
      setCree({ email: v("email").trim(), envoye: reponse.data?.verification_email_sent !== false });
    } catch (err) {
      const parChamp = erreursApi(err);
      if (Object.keys(parChamp).length > 0) {
        setErreurs(parChamp);
        setAdresseDejaPrise(!!parChamp.email);
        document.getElementById(ordre.find((nom) => parChamp[nom]) ?? "email")?.focus();
      } else {
        setErreurEnvoi(messageReseau(err, "Le compte n'a pas pu être créé. Réessayez dans quelques instants."));
      }
    } finally {
      setEnvoi(false);
    }
  };

  if (cree) {
    return (
      <CadreEveil etiquette="Éveil" titre="Compte créé" ton="recompense" retour={{ href: "/", libelle: "Accueil" }}>
        <p className="text-systeme-texte" role="status">
          {cree.envoye ? (
            <>
              Un e-mail de confirmation vient de partir vers <strong className="break-all">{cree.email}</strong>. Pensez à regarder dans les courriers indésirables.
            </>
          ) : (
            <>
              Votre compte est créé, mais l&apos;e-mail de confirmation n&apos;a pas pu partir vers <strong className="break-all">{cree.email}</strong>. Demandez un nouvel envoi
              ci-dessous.
            </>
          )}
        </p>
        <ol className="grid gap-1.5 text-systeme-texte">
          <li>1. Compte créé.</li>
          <li>2. Confirmez votre adresse avec le lien reçu par e-mail.</li>
          <li>3. Ensuite, {profil.suite}</li>
        </ol>
        <RenvoiConfirmation email={cree.email} />
        <Link href="/login" className="justify-self-start font-bold text-systeme-lueur underline underline-offset-2">
          Aller à la connexion
        </Link>
      </CadreEveil>
    );
  }

  return (
    <CadreEveil etiquette="Éveil" titre={profil.titre} retour={{ href: "/register", libelle: "Choisir un autre profil" }}>
      <form noValidate onSubmit={envoyer} className="grid gap-4">
        {(profil.champs as Champ[]).map((champ) => (
          <ChampAuth
            key={champ.nom}
            id={champ.nom}
            libelle={champ.obligatoire ? champ.libelle : `${champ.libelle} (facultatif)`}
            autoComplete={champ.autoComplete}
            valeur={v(champ.nom)}
            erreur={erreurs[champ.nom]}
            onChange={changer(champ.nom)}
          />
        ))}
        <ChampAuth id="email" type="email" libelle="Adresse e-mail" autoComplete="email" valeur={v("email")} erreur={erreurs.email} onChange={changer("email")} />
        {adresseDejaPrise && emailValide(v("email")) && <RenvoiConfirmation email={v("email").trim()} />}
        <ChampMotDePasse id="password" libelle="Mot de passe" autoComplete="new-password" valeur={v("password")} erreur={erreurs.password} onChange={changer("password")} />
        <ReglesMotDePasse id="password-regles" valeur={v("password")} />
        <ChampMotDePasse
          id="password_confirmation"
          libelle="Confirmez le mot de passe"
          autoComplete="new-password"
          valeur={v("password_confirmation")}
          erreur={erreurs.password_confirmation}
          onChange={changer("password_confirmation")}
        />
        <Alerte message={erreurEnvoi} />
        <BoutonSysteme type="submit" chargement={envoi}>
          Créer mon compte
        </BoutonSysteme>
        <p className="text-sm text-systeme-attenue">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-systeme-lueur underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </form>
    </CadreEveil>
  );
}
