"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import api from "@/lib/api";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { BoutonDossier, CarteDossier, Champ, MessageErreurDossier, MessageReussite, type OptionChamp } from "./ElementsDossier";
import { messageEnvoi } from "./regles";

export type DefinitionChamp = {
  nom: string;
  libelle: string;
  type?: "text" | "email" | "url" | "tel" | "date";
  multiligne?: boolean;
  options?: OptionChamp[];
  aide?: string;
  autoComplete?: string;
  /** Vérification avant l'envoi : renvoie le message d'erreur, ou null */
  verifier?: (valeur: string) => string | null;
  /** Message affiché quand l'API refuse ce champ (ses messages de validation sont en anglais) */
  refus: string;
};

type Props = {
  id: string;
  titre: string;
  champs: DefinitionChamp[];
  valeurs: Record<string, string>;
  /** Route POST qui enregistre la carte */
  route: string;
  /** Lecture seule : ce que montre la carte hors modification */
  children: ReactNode;
  onEnregistre: () => Promise<unknown>;
};

/** Une carte du dossier qui se modifie sur place, avec « Annuler » et une erreur sous chaque champ. */
export function CarteModifiable({ id, titre, champs, valeurs, route, children, onEnregistre }: Props) {
  const [edition, setEdition] = useState(false);
  const [formulaire, setFormulaire] = useState(valeurs);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const boutonRef = useRef<HTMLButtonElement>(null);
  const premier = useRef(true);

  // Le focus suit le passage entre lecture et modification
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    if (edition) formRef.current?.querySelector<HTMLElement>("input, textarea, select")?.focus();
    else boutonRef.current?.focus();
  }, [edition]);

  const ouvrir = () => {
    setFormulaire(valeurs);
    setErreurs({});
    setErreurEnvoi(null);
    setReussite(null);
    setEdition(true);
  };

  const signalerErreurs = (trouvees: Record<string, string>) => {
    setErreurs(trouvees);
    const premiere = champs.find((champ) => trouvees[champ.nom]);
    if (premiere) document.getElementById(`${id}-${premiere.nom}`)?.focus();
  };

  const enregistrer = async (e: FormEvent) => {
    e.preventDefault();
    const trouvees: Record<string, string> = {};
    for (const champ of champs) {
      const message = formulaire[champ.nom]?.trim() ? champ.verifier?.(formulaire[champ.nom]) : null;
      if (message) trouvees[champ.nom] = message;
    }
    if (Object.keys(trouvees).length > 0) {
      setErreurEnvoi(null);
      signalerErreurs(trouvees);
      return;
    }

    setEnvoi(true);
    setErreurs({});
    setErreurEnvoi(null);
    try {
      await api.post(route, formulaire);
      await onEnregistre();
      setEdition(false);
      setReussite("Modifications enregistrées.");
    } catch (err) {
      const refuses = statutErreur(err) === 422 ? champs.filter((champ) => champsRefuses(err).includes(champ.nom)) : [];
      if (refuses.length > 0) {
        signalerErreurs(Object.fromEntries(refuses.map((champ) => [champ.nom, champ.refus])));
      } else {
        setErreurEnvoi(messageEnvoi(err, "Tes modifications n'ont pas pu être enregistrées. Réessaie."));
      }
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <CarteDossier
      id={id}
      titre={titre}
      action={
        !edition && (
          <BoutonDossier ref={boutonRef} variante="contour" onClick={ouvrir} aria-label={`Modifier : ${titre}`}>
            Modifier
          </BoutonDossier>
        )
      }
    >
      {edition ? (
        <form ref={formRef} noValidate onSubmit={enregistrer} className="grid gap-4">
          {champs.map((champ) => (
            <Champ
              key={champ.nom}
              id={`${id}-${champ.nom}`}
              name={champ.nom}
              libelle={champ.libelle}
              type={champ.type}
              multiligne={champ.multiligne}
              options={champ.options}
              aide={champ.aide}
              autoComplete={champ.autoComplete}
              valeur={formulaire[champ.nom] ?? ""}
              erreur={erreurs[champ.nom] ?? null}
              onChange={(valeur) => setFormulaire((actuel) => ({ ...actuel, [champ.nom]: valeur }))}
            />
          ))}
          <MessageErreurDossier message={erreurEnvoi} />
          <div className="flex flex-wrap gap-3">
            <BoutonDossier type="submit" chargement={envoi}>
              Enregistrer
            </BoutonDossier>
            <BoutonDossier variante="contour" disabled={envoi} onClick={() => setEdition(false)}>
              Annuler
            </BoutonDossier>
          </div>
        </form>
      ) : (
        children
      )}
      <MessageReussite message={edition ? null : reussite} />
    </CarteDossier>
  );
}
