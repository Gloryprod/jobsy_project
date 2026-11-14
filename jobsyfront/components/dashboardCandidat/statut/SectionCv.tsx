"use client";

import { useRef, useState } from "react";
import api, { STORAGE_URL } from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { ConfirmationRefus } from "../commun/ConfirmationRefus";
import { BoutonDossier, BoutonFichier, CarteDossier, MessageErreurDossier, MessageReussite } from "./ElementsDossier";
import { FICHIER_CV, messageEnvoi, verifierFichier } from "./regles";
import type { Cv } from "./types";

type Props = { cv: Cv | null | undefined; onChange: () => Promise<unknown> };

/** Le CV : envoyé dès le choix du fichier, remplaçable directement (l'API remplace l'ancien). */
export function SectionCv({ cv, onChange }: Props) {
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [reussite, setReussite] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [suppression, setSuppression] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const envoyer = async (fichier: File) => {
    setReussite(null);
    const refus = verifierFichier(fichier, FICHIER_CV);
    if (refus) {
      setErreur(refus);
      return;
    }
    setErreur(null);
    setEnvoi(true);
    try {
      const corps = new FormData();
      corps.append("fichier", fichier);
      await api.post("/candidat/cv", corps, { headers: { "Content-Type": "multipart/form-data" } });
      await onChange();
      setReussite("CV reçu. Le Système l'analyse : ton rang et tes compétences se mettront à jour d'ici quelques minutes.");
    } catch (e) {
      setErreur(statutErreur(e) === 422 && champsRefuses(e).includes("fichier") ? "Ton CV doit être un PDF de 2 Mo au plus." : messageEnvoi(e, "Ton CV n'a pas pu être envoyé. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    setSuppression(true);
    setErreurSuppression(null);
    try {
      await api.delete("/candidat/cv");
      await onChange();
      setConfirmation(false);
      setReussite("CV supprimé.");
    } catch (e) {
      setErreurSuppression(messageEnvoi(e, "Ton CV n'a pas pu être supprimé. Réessaie."));
    } finally {
      setSuppression(false);
    }
  };

  return (
    <CarteDossier id="cv" titre="Mon CV" titreRef={titreRef}>
      <p className="text-slate-700">Le Système lit ton CV pour fixer ton rang de départ et repérer tes compétences.</p>
      {cv ? (
        <a href={`${STORAGE_URL}/${cv.fichier}`} target="_blank" rel="noreferrer" className="justify-self-start font-bold text-[#000080] underline underline-offset-2">
          Voir mon CV
        </a>
      ) : (
        <p className="text-slate-600">Tu n&apos;as pas encore déposé de CV.</p>
      )}
      <p id="cv-aide" className="text-sm text-slate-600">
        {FICHIER_CV.aide}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <BoutonFichier id="cv-fichier" libelle={cv ? "Remplacer mon CV" : "Déposer mon CV"} accept={FICHIER_CV.accept} decritPar="cv-aide" invalide={!!erreur} desactive={envoi} onChoix={envoyer} />
        {cv && (
          <BoutonDossier variante="danger" disabled={envoi} onClick={() => setConfirmation(true)}>
            Supprimer mon CV
          </BoutonDossier>
        )}
      </div>
      {envoi && <p role="status" className="text-sm text-slate-700">Envoi de ton CV…</p>}
      <MessageErreurDossier message={erreur} />
      <MessageReussite message={reussite} />
      <ConfirmationRefus
        ouvert={confirmation}
        titre="Supprimer ton CV ?"
        description="Il sera retiré de ton profil. Tu pourras en déposer un autre à tout moment."
        libelleConfirmer="Supprimer mon CV"
        chargement={suppression}
        erreur={erreurSuppression}
        onConfirmer={() => void supprimer()}
        onFermer={() => {
          setConfirmation(false);
          setErreurSuppression(null);
        }}
        cibleFocus={() => titreRef.current}
      />
    </CarteDossier>
  );
}
