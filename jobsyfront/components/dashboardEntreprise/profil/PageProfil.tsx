"use client";

import { useState, type ChangeEvent } from "react";
import Image from "next/image";
import useSWR from "swr";
import api, { STORAGE_URL } from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { ErreurSection } from "@/components/dashboardCandidat/qg/CarteRealite";
import { messageGuilde } from "../guilde/regles";
import { BOUTON_CONTOUR, CarteChamps } from "./CarteChamps";
import { CarteMotDePasse } from "./CarteMotDePasse";
import { CartePresentation } from "./CartePresentation";
import { CHAMPS_CONTACT, CHAMPS_INFOS, RESEAUX, initiales, valeursDe, verifierLogo, type Champ, type ProfilEntreprise } from "./regles";

const LIEN = "font-semibold text-[#000080] underline underline-offset-2";

/** Une valeur renseignée en lecture : e-mail, téléphone et adresses deviennent des liens. */
function affichage(c: Champ, valeur: string) {
  if (c.type === "email")
    return (
      <a href={`mailto:${valeur}`} className={LIEN}>
        {valeur}
      </a>
    );
  if (c.type === "tel")
    return (
      <a href={`tel:${valeur.replace(/\s/g, "")}`} className={LIEN}>
        {valeur}
      </a>
    );
  if (c.type === "url")
    return (
      <a href={valeur} target="_blank" rel="noopener noreferrer" className={LIEN}>
        {valeur}
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    );
  return valeur;
}

/** Le profil de l'entreprise (lot 7e) : logo, informations, présentation, coordonnées et mot de passe. */
export function PageProfil() {
  const profil = useSWR<ProfilEntreprise>("/entreprise/contact", (url: string) => api.get(url).then((r) => r.data.data));
  const [messageLogo, setMessageLogo] = useState<{ texte: string; erreur?: boolean } | null>(null);
  const [envoiLogo, setEnvoiLogo] = useState(false);
  const p = profil.data;

  if (profil.isLoading)
    return (
      <div className="mx-auto grid max-w-5xl font-lisible">
        <p role="status">Chargement du profil…</p>
      </div>
    );
  if (profil.error || !p)
    return (
      <div className="mx-auto grid max-w-5xl gap-4 font-lisible">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Profil de l&apos;entreprise</h1>
        <ErreurSection texte="Le profil n'a pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => profil.mutate()} />
      </div>
    );

  const nom = p.nom_entreprise || "Votre entreprise";
  const reseaux = RESEAUX.filter((r) => p.contact_entreprise?.[r.cle]);

  const changerLogo = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    const refus = verifierLogo(fichier);
    if (refus) return setMessageLogo({ texte: refus, erreur: true });
    setMessageLogo(null);
    setEnvoiLogo(true);
    try {
      const donnees = new FormData();
      donnees.append("logo", fichier);
      await api.post(`/entreprise/infos/${p.id}`, donnees, { headers: { "Content-Type": "multipart/form-data" } });
      await profil.mutate();
      setMessageLogo({ texte: "Logo mis à jour." });
    } catch (err) {
      setMessageLogo({
        erreur: true,
        texte:
          statutErreur(err) === 422 && champsRefuses(err).includes("logo")
            ? "Le logo doit être une image JPG, PNG ou WebP de 2 Mo au plus."
            : messageGuilde(err, "Le logo n'a pas pu être envoyé. Réessayez dans quelques instants."),
      });
    } finally {
      setEnvoiLogo(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 font-lisible text-slate-900">
      <section aria-labelledby="profil-nom" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {p.logo ? (
              <Image src={`${STORAGE_URL}/${p.logo}`} alt={`Logo de ${nom}`} fill unoptimized className="object-cover" />
            ) : (
              <span aria-hidden="true" className="font-systeme text-2xl font-bold text-[#000080]">
                {initiales(p.nom_entreprise)}
              </span>
            )}
          </div>
          <div className="grid min-w-0 flex-1 gap-0.5">
            <p className="text-sm font-semibold text-slate-600">Profil de l&apos;entreprise</p>
            <h1 id="profil-nom" className="font-systeme text-3xl font-bold break-words text-[#000080]">
              {nom}
            </h1>
            <p className="text-slate-600">{[p.secteur_activite, p.localisation].filter(Boolean).join(", ") || "Secteur et ville non renseignés"}</p>
            {reseaux.length > 0 && (
              <ul className="flex flex-wrap gap-x-4 text-sm">
                {reseaux.map((r) => (
                  <li key={r.cle}>
                    <a href={p.contact_entreprise?.[r.cle] ?? undefined} target="_blank" rel="noopener noreferrer" className={LIEN}>
                      {r.nom}
                      <span className="sr-only"> (nouvel onglet)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="grid gap-1">
            <input
              id="profil-logo"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={changerLogo}
              disabled={envoiLogo}
              aria-describedby="profil-logo-aide"
              className="peer sr-only"
            />
            <label
              htmlFor="profil-logo"
              className={`${BOUTON_CONTOUR} peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#000080]`}
            >
              {envoiLogo ? "Envoi du logo…" : p.logo ? "Changer le logo" : "Ajouter un logo"}
            </label>
            <p id="profil-logo-aide" className="text-xs text-slate-600">
              JPG, PNG ou WebP, 2 Mo au plus.
            </p>
          </div>
        </div>
        <p role="status" className={`text-sm font-semibold empty:hidden ${messageLogo?.erreur ? "text-red-700" : "text-emerald-800"}`}>
          {messageLogo?.texte}
        </p>
      </section>

      <CarteChamps
        id="infos"
        titre="Informations de l'entreprise"
        champs={CHAMPS_INFOS}
        valeurs={valeursDe(p, CHAMPS_INFOS)}
        affichage={affichage}
        enregistrer={async (v) => {
          await api.post(`/entreprise/infos/${p.id}`, v);
          await profil.mutate();
          return v.nom_entreprise !== (p.nom_entreprise ?? "")
            ? "Informations enregistrées. Le nouveau nom apparaîtra dans l'en-tête au prochain chargement de la page."
            : "Informations enregistrées.";
        }}
      />

      <CartePresentation
        description={p.description}
        enregistrer={async (description) => {
          await api.post(`/entreprise/infos/${p.id}`, { description });
          await profil.mutate();
        }}
      />

      <CarteChamps
        id="contact"
        titre="Coordonnées"
        intro={<p className="text-sm text-slate-600">Elles permettent à l&apos;équipe Jobsy de vous joindre. Les réseaux sociaux renseignés s&apos;affichent en tête de profil.</p>}
        champs={CHAMPS_CONTACT}
        valeurs={valeursDe(p.contact_entreprise, CHAMPS_CONTACT)}
        affichage={affichage}
        enregistrer={async (v) => {
          await api.post(`/entreprise/contact/${p.id}`, v);
          await profil.mutate();
          return "Coordonnées enregistrées.";
        }}
      />

      <CarteMotDePasse />
    </div>
  );
}
