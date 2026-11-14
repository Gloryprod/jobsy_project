"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import api, { STORAGE_URL } from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import type { Inscription } from "../qg/types";
import { CarteDossier } from "../statut/ElementsDossier";
import type { Dossier, TitreInventaire } from "../statut/types";
import { ListeTitres } from "./ListeTitres";
import { certificatsJobsy, classerTitres, formaterDateCertificat, MAX_TITRES_EQUIPES } from "./regles";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);
// Même clé et même lecture que la fenêtre de statut : le cache de SWR est partagé
const lireInventaire = (url: string): Promise<TitreInventaire[]> => api.get(url).then((reponse) => reponse.data);

const LIEN = "font-bold text-[#000080] underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

/**
 * L'inventaire : les titres (couche Système), puis les documents (couche réalité).
 * Les titres viennent de l'inventaire de l'API, les documents du profil et des formations (décision D33).
 */
export function Inventaire() {
  const { user } = useUser();
  const candidatId = user?.candidat?.id;
  const titres = useSWR<TitreInventaire[]>("/candidate/inventory", lireInventaire);
  const dossier = useSWR<Dossier>("/candidat/profile", lireDonnees);
  const inscriptions = useSWR<Inscription[]>(candidatId ? "/courses/my-learnings" : null, lireDonnees);

  const [enCours, setEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);
  // Après un changement, le titre passe dans une autre liste : le focus le suit
  const focusApres = useRef<string | null>(null);

  // Le bouton déplacé reste désactivé pendant l'envoi : le focus part une fois l'envoi terminé
  useEffect(() => {
    if (!focusApres.current || enCours) return;
    document.getElementById(focusApres.current)?.focus();
    focusApres.current = null;
  }, [titres.data, enCours]);

  const classes = titres.data ? classerTitres(titres.data) : null;

  const basculer = async (titre: TitreInventaire) => {
    setAnnonce(null);
    if (!titre.equipped && classes && classes.equipes.length >= MAX_TITRES_EQUIPES) {
      setErreur(`Tu as déjà ${MAX_TITRES_EQUIPES} titres équipés. Retires-en un pour équiper « ${titre.name} ».`);
      return;
    }
    setErreur(null);
    setEnCours(titre.id);
    try {
      await api.patch(`/candidate/inventory/${titre.id}/equip`, { equipped: !titre.equipped });
      focusApres.current = `titre-${titre.id}-action`;
      await titres.mutate();
      setAnnonce(titre.equipped ? `« ${titre.name} » retiré de ton profil.` : `« ${titre.name} » équipé : les entreprises le voient.`);
    } catch (e) {
      const code = statutErreur(e);
      setErreur(
        code === 422
          ? `Tu as déjà ${MAX_TITRES_EQUIPES} titres équipés. Retires-en un pour équiper « ${titre.name} ».`
          : code === 403
            ? "Ce titre n'est pas encore débloqué."
            : messageErreur(e, "Le changement n'a pas pu être enregistré. Réessaie."),
      );
    } finally {
      setEnCours(null);
    }
  };

  let fenetresTitres;
  if (titres.isLoading) {
    fenetresTitres = (
      <FenetreSysteme etiquette="Titres" balayage={false}>
        <p className="text-systeme-attenue">Le Système ouvre ton inventaire…</p>
      </FenetreSysteme>
    );
  } else if (titres.error || !classes) {
    fenetresTitres = (
      <FenetreSysteme etiquette="Système" titre="Tes titres n'ont pas pu se charger" ton="alerte" niveauTitre={2} balayage={false}>
        <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
        <BoutonSysteme onClick={() => titres.mutate()} className="justify-self-start">
          Réessayer
        </BoutonSysteme>
      </FenetreSysteme>
    );
  } else {
    fenetresTitres = (
      <>
        <FenetreSysteme etiquette="Titres" titre="Tes titres équipés" niveauTitre={2}>
          <p className="text-systeme-attenue">Les entreprises voient les titres que tu équipes, avec tes diplômes et tes certifications.</p>
          <p className="font-semibold text-systeme-texte">
            {classes.equipes.length} sur {MAX_TITRES_EQUIPES} équipés
          </p>
          <Alerte message={erreur} />
          <p role="status" className={annonce ? "text-sm text-systeme-lueur" : "sr-only"}>
            {annonce}
          </p>
          {classes.equipes.length > 0 ? (
            <ListeTitres titres={classes.equipes} enCours={enCours} onBasculer={basculer} />
          ) : (
            <p className="text-systeme-attenue">
              {classes.debloques.length > 0 ? "Aucun titre équipé : choisis-en parmi tes titres débloqués, juste en dessous." : "Aucun titre débloqué pour l'instant."}
            </p>
          )}
        </FenetreSysteme>

        {classes.debloques.length > 0 && (
          <FenetreSysteme etiquette="Titres" titre="Tes titres débloqués" niveauTitre={2} balayage={false}>
            <ListeTitres titres={classes.debloques} enCours={enCours} onBasculer={basculer} />
          </FenetreSysteme>
        )}

        {classes.aDebloquer.length > 0 && (
          <FenetreSysteme etiquette="Titres" titre="À débloquer" niveauTitre={2} balayage={false}>
            <p className="text-systeme-attenue">Chaque titre se débloque tout seul quand sa condition est remplie.</p>
            <ListeTitres titres={classes.aDebloquer} enCours={enCours} />
          </FenetreSysteme>
        )}
      </>
    );
  }

  const d = dossier.data;
  const certificats = inscriptions.data ? certificatsJobsy(inscriptions.data) : null;
  const diplomes = d?.diplomes ?? [];
  const externes = d?.formations ?? [];

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <p className="text-sm font-bold text-[#000080]">Ton inventaire</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">Tes titres et tes documents</h1>
      </header>

      {fenetresTitres}

      <CarteDossier id="documents" titre="Tes documents">
        {dossier.error && !d ? (
          <p role="alert" className="text-red-800">
            Tes documents n&apos;ont pas pu se charger. Vérifie ta connexion, puis recharge la page.
          </p>
        ) : (
          <>
            <div className="grid gap-2">
              <h3 className="font-bold text-slate-900">Certificats Jobsy</h3>
              {certificats === null ? (
                <p className="text-slate-600">Chargement…</p>
              ) : certificats.length === 0 ? (
                <p className="text-slate-600">Termine une formation Jobsy pour obtenir ton premier certificat.</p>
              ) : (
                <ul className="grid gap-2">
                  {certificats.map((certificat) => {
                    const date = formaterDateCertificat(certificat.certified_at);
                    const xp = Number(certificat.course?.reward_xp) || 0;
                    return (
                      <li key={certificat.id} className="grid gap-1 rounded-lg border border-slate-200 p-3">
                        <p className="font-semibold text-slate-900">{certificat.course?.title}</p>
                        <p className="text-sm text-slate-600">
                          {[date ? `Obtenu le ${date}` : null, xp > 0 ? `+${xp} XP` : null].filter(Boolean).join(" · ")}
                        </p>
                        <Link href={`/verify/${certificat.certificate_hash}`} className={`justify-self-start text-sm ${LIEN}`}>
                          Vérifier le certificat<span className="sr-only"> : {certificat.course?.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="grid gap-2">
              <h3 className="font-bold text-slate-900">Diplômes</h3>
              {!d ? (
                <p className="text-slate-600">Chargement…</p>
              ) : diplomes.length === 0 ? (
                <p className="text-slate-600">Aucun diplôme dans ton dossier.</p>
              ) : (
                <ul className="grid gap-2">
                  {diplomes.map((diplome) => (
                    <li key={diplome.id} className="grid gap-1 rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold break-words text-slate-900">{diplome.intitule}</p>
                      {diplome.fichier && (
                        <a href={`${STORAGE_URL}/${diplome.fichier}`} target="_blank" rel="noreferrer" className={`justify-self-start text-sm ${LIEN}`}>
                          Voir le fichier<span className="sr-only"> : {diplome.intitule}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-2">
              <h3 className="font-bold text-slate-900">Certifications externes</h3>
              {!d ? (
                <p className="text-slate-600">Chargement…</p>
              ) : externes.length === 0 ? (
                <p className="text-slate-600">Aucune certification externe dans ton dossier.</p>
              ) : (
                <ul className="grid gap-2">
                  {externes.map((formation) => (
                    <li key={formation.id} className="grid gap-1 rounded-lg border border-slate-200 p-3">
                      <p className="font-semibold break-words text-slate-900">{formation.titre}</p>
                      {formation.organisme && <p className="text-sm text-slate-600">{formation.organisme}</p>}
                      {formation.certificat && (
                        <a href={`${STORAGE_URL}/${formation.certificat}`} target="_blank" rel="noreferrer" className={`justify-self-start text-sm ${LIEN}`}>
                          Voir le fichier<span className="sr-only"> : {formation.titre}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link href="/dashboard/candidats/profile" className={`justify-self-start ${LIEN}`}>
              Ajouter ou supprimer des documents dans mon profil
            </Link>
          </>
        )}
      </CarteDossier>
    </div>
  );
}
