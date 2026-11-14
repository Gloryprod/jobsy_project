"use client";

import { useRef, useState, type FormEvent } from "react";
import api, { STORAGE_URL } from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { ConfirmationRefus } from "../commun/ConfirmationRefus";
import { BoutonDossier, BoutonFichier, CarteDossier, Champ, MessageErreurDossier, MessageReussite } from "./ElementsDossier";
import { FICHIER_PREUVE, messageEnvoi, verifierFichier } from "./regles";

export type DocumentAffiche = { id: number; titre: string; detail?: string | null; fichier?: string | null };

export type ChampDocument = { nom: string; libelle: string; refusDoublon?: string };

type Props = {
  id: string;
  titre: string;
  explication: string;
  /** « un diplôme », « une certification » */
  nomUn: string;
  /** « Diplôme », « Certification » */
  nomCourt: string;
  /** « ajouté », « ajoutée » */
  accordAjoute: string;
  documents: DocumentAffiche[];
  champs: ChampDocument[];
  /** Nom du fichier attendu par l'API : fichier ou certificat */
  champFichier: string;
  routeAjout: string;
  routeSuppression: (id: number) => string;
  onChange: () => Promise<unknown>;
};

/** Diplômes ou certifications : liste, ajout avec le justificatif, suppression avec confirmation. */
export function SectionDocuments({ id, titre, explication, nomUn, nomCourt, accordAjoute, documents, champs, champFichier, routeAjout, routeSuppression, onChange }: Props) {
  const [valeurs, setValeurs] = useState<Record<string, string>>({});
  const [fichier, setFichier] = useState<File | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);
  const [aSupprimer, setASupprimer] = useState<DocumentAffiche | null>(null);
  const [suppression, setSuppression] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const choisirFichier = (choisi: File) => {
    const refus = verifierFichier(choisi, FICHIER_PREUVE);
    setErreurFichier(refus);
    setFichier(refus ? null : choisi);
  };

  const ajouter = async (e: FormEvent) => {
    e.preventDefault();
    setReussite(null);
    setErreurEnvoi(null);
    const manquants = Object.fromEntries(champs.filter((champ) => !valeurs[champ.nom]?.trim()).map((champ) => [champ.nom, "Ce champ est obligatoire."]));
    setErreurs(manquants);
    setErreurFichier(fichier ? null : "Ajoute le fichier qui le prouve.");
    const premier = champs.find((champ) => manquants[champ.nom]);
    if (premier) {
      document.getElementById(`${id}-champ-${premier.nom}`)?.focus();
      return;
    }
    if (!fichier) {
      document.getElementById(`${id}-fichier`)?.focus();
      return;
    }

    setEnvoi(true);
    try {
      const corps = new FormData();
      for (const champ of champs) corps.append(champ.nom, valeurs[champ.nom].trim());
      corps.append(champFichier, fichier);
      await api.post(routeAjout, corps, { headers: { "Content-Type": "multipart/form-data" } });
      await onChange();
      setValeurs({});
      setFichier(null);
      setReussite(`${nomCourt} ${accordAjoute}.`);
    } catch (err) {
      const refuses = statutErreur(err) === 422 ? champsRefuses(err) : [];
      const doublon = champs.find((champ) => champ.refusDoublon && refuses.includes(champ.nom));
      if (doublon) {
        setErreurs({ [doublon.nom]: doublon.refusDoublon! });
        document.getElementById(`${id}-champ-${doublon.nom}`)?.focus();
      } else if (refuses.includes(champFichier)) {
        setErreurFichier(`${FICHIER_PREUVE.refus} 2 Mo au plus.`);
      } else {
        setErreurEnvoi(messageEnvoi(err, `Impossible d'ajouter ${nomUn}. Réessaie.`));
      }
    } finally {
      setEnvoi(false);
    }
  };

  const supprimer = async () => {
    if (!aSupprimer) return;
    setSuppression(true);
    setErreurSuppression(null);
    try {
      await api.delete(routeSuppression(aSupprimer.id));
      await onChange();
      setASupprimer(null);
      setReussite(`« ${aSupprimer.titre} » supprimé du dossier.`);
    } catch (e) {
      setErreurSuppression(messageEnvoi(e, "La suppression n'a pas abouti. Réessaie."));
    } finally {
      setSuppression(false);
    }
  };

  const idFichier = `${id}-fichier`;
  const decritFichier = [`${id}-fichier-aide`, erreurFichier ? `${id}-fichier-erreur` : null].filter(Boolean).join(" ");

  return (
    <CarteDossier id={id} titre={titre} titreRef={titreRef}>
      <p className="text-slate-700">{explication}</p>
      {documents.length === 0 ? (
        <p className="text-slate-600">Rien pour l&apos;instant.</p>
      ) : (
        <ul className="grid gap-2">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-3">
              <div className="grid min-w-0 gap-0.5">
                <p className="font-semibold break-words text-slate-900">{document.titre}</p>
                {document.detail && <p className="text-sm text-slate-600">{document.detail}</p>}
                {document.fichier && (
                  <a href={`${STORAGE_URL}/${document.fichier}`} target="_blank" rel="noreferrer" className="justify-self-start text-sm font-bold text-[#000080] underline underline-offset-2">
                    Voir le fichier<span className="sr-only"> : {document.titre}</span>
                  </a>
                )}
              </div>
              <BoutonDossier variante="danger" onClick={() => setASupprimer(document)} aria-label={`Supprimer : ${document.titre}`}>
                Supprimer
              </BoutonDossier>
            </li>
          ))}
        </ul>
      )}

      <form noValidate onSubmit={ajouter} className="grid gap-4 border-t border-slate-100 pt-4">
        <h3 className="font-bold text-slate-900">Ajouter {nomUn}</h3>
        {champs.map((champ) => (
          <Champ
            key={champ.nom}
            id={`${id}-champ-${champ.nom}`}
            libelle={champ.libelle}
            valeur={valeurs[champ.nom] ?? ""}
            erreur={erreurs[champ.nom] ?? null}
            onChange={(valeur) => setValeurs((actuelles) => ({ ...actuelles, [champ.nom]: valeur }))}
          />
        ))}
        <div className="grid gap-1.5">
          <p id={`${id}-fichier-aide`} className="text-sm text-slate-600">
            Justificatif : {FICHIER_PREUVE.aide}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <BoutonFichier id={idFichier} libelle={fichier ? "Changer de fichier" : "Choisir le fichier"} accept={FICHIER_PREUVE.accept} decritPar={decritFichier} invalide={!!erreurFichier} desactive={envoi} onChoix={choisirFichier} />
            {fichier && <span className="min-w-0 text-sm break-all text-slate-700">{fichier.name}</span>}
          </div>
          {erreurFichier && (
            <p id={`${id}-fichier-erreur`} className="text-sm font-semibold text-red-700">
              {erreurFichier}
            </p>
          )}
        </div>
        <MessageErreurDossier message={erreurEnvoi} />
        <BoutonDossier type="submit" chargement={envoi} className="justify-self-start">
          Ajouter
        </BoutonDossier>
      </form>
      <MessageReussite message={reussite} />

      <ConfirmationRefus
        ouvert={aSupprimer !== null}
        titre="Supprimer ce document ?"
        description={aSupprimer ? `« ${aSupprimer.titre} » sera retiré de ton dossier, avec son fichier.` : ""}
        libelleConfirmer="Supprimer"
        chargement={suppression}
        erreur={erreurSuppression}
        onConfirmer={() => void supprimer()}
        onFermer={() => {
          setASupprimer(null);
          setErreurSuppression(null);
        }}
        cibleFocus={() => titreRef.current}
      />
    </CarteDossier>
  );
}
