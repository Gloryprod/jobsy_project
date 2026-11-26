"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { CarteRealite } from "@/components/dashboardCandidat/qg/CarteRealite";
import { messageGuilde } from "../guilde/regles";
import { preparer, refusChamp, verifier, type Champ, type Erreurs, type Valeurs } from "./regles";

export const BOUTON_PLEIN =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-[#000080] px-4 text-sm font-bold text-white hover:bg-[#000080]/85 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";
export const BOUTON_CONTOUR =
  "inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#000080] px-3 text-sm font-bold text-[#000080] hover:bg-blue-50 disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

type Props = {
  /** Préfixe des identifiants des champs */
  id: string;
  titre: string;
  intro?: ReactNode;
  champs: Champ[];
  /** Valeurs enregistrées (API) */
  valeurs: Valeurs;
  /** Affichage d'une valeur renseignée en lecture (lien, texte) */
  affichage?: (champ: Champ, valeur: string) => ReactNode;
  /** Enregistre puis recharge le profil ; renvoie le message de réussite. Lève l'erreur de l'API en cas de refus. */
  enregistrer: (v: Valeurs) => Promise<string>;
};

/**
 * Une carte du profil, en lecture puis en formulaire : règles de l'API vérifiées avant l'envoi,
 * formulaire fermé seulement après la réussite, refus affichés sous chaque champ.
 */
export function CarteChamps({ id, titre, intro, champs, valeurs, affichage, enregistrer }: Props) {
  const [edition, setEdition] = useState(false);
  const [v, setV] = useState<Valeurs>(valeurs);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);
  const boutonModifier = useRef<HTMLButtonElement>(null);
  const zoneReussite = useRef<HTMLParagraphElement>(null);
  // Après un envoi, React affiche le message plus tard que la prochaine image : le focus suit l'affichage
  useEffect(() => {
    if (reussite) zoneReussite.current?.focus();
  }, [reussite]);

  const champId = (cle: string) => `${id}-${cle}`;
  const signaler = (trouvees: Erreurs) => {
    setErreurs(trouvees);
    const premier = champs.find((c) => trouvees[c.cle]);
    if (premier) document.getElementById(champId(premier.cle))?.focus();
  };
  const ouvrir = () => {
    setV(valeurs);
    setErreurs({});
    setErreurEnvoi(null);
    setReussite(null);
    setEdition(true);
    requestAnimationFrame(() => document.getElementById(champId(champs[0].cle))?.focus());
  };
  const annuler = () => {
    setEdition(false);
    requestAnimationFrame(() => boutonModifier.current?.focus());
  };

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    const trouvees = verifier(v, champs);
    if (Object.keys(trouvees).length > 0) return signaler(trouvees);
    setErreurs({});
    setEnvoi(true);
    try {
      const message = await enregistrer(preparer(v, champs));
      setEdition(false);
      setReussite(message);
    } catch (err) {
      const refuses = statutErreur(err) === 422 ? champs.filter((c) => champsRefuses(err).includes(c.cle)) : [];
      if (refuses.length > 0) signaler(Object.fromEntries(refuses.map((c) => [c.cle, refusChamp(c)])));
      else setErreurEnvoi(messageGuilde(err, "L'enregistrement n'a pas abouti. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <CarteRealite titre={titre}>
      {intro}
      <p ref={zoneReussite} tabIndex={-1} role="status" className="text-sm font-semibold text-emerald-800 focus:outline-none empty:hidden">
        {reussite}
      </p>
      {edition ? (
        <form noValidate onSubmit={envoyer} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            {champs.map((c) => {
              const cid = champId(c.cle);
              const decrit = [c.aide ? `${cid}-aide` : null, erreurs[c.cle] ? `${cid}-erreur` : null].filter(Boolean).join(" ") || undefined;
              return (
                <div key={c.cle} className="grid content-start gap-1.5">
                  <label htmlFor={cid} className="font-semibold">
                    {c.libelle}
                    {c.requis && (
                      <span aria-hidden="true" className="text-red-700">
                        {" "}
                        *
                      </span>
                    )}
                  </label>
                  {c.aide && (
                    <p id={`${cid}-aide`} className="text-sm text-slate-600">
                      {c.aide}
                    </p>
                  )}
                  <input
                    id={cid}
                    name={c.cle}
                    type={c.type ?? "text"}
                    inputMode={c.type === "url" ? "url" : undefined}
                    autoComplete={c.autoComplete ?? "off"}
                    value={v[c.cle] ?? ""}
                    onChange={(e) => setV((actuelles) => ({ ...actuelles, [c.cle]: e.target.value }))}
                    required={c.requis}
                    aria-invalid={erreurs[c.cle] ? true : undefined}
                    aria-describedby={decrit}
                    className={CLASSES_SAISIE}
                  />
                  {erreurs[c.cle] && (
                    <p id={`${cid}-erreur`} className="text-sm font-semibold text-red-700">
                      {erreurs[c.cle]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {erreurEnvoi && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {erreurEnvoi}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            <button type="submit" disabled={envoi} aria-busy={envoi || undefined} className={BOUTON_PLEIN}>
              {envoi ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" disabled={envoi} onClick={annuler} className={BOUTON_CONTOUR}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <>
          <dl className="grid gap-x-6 gap-y-3 md:grid-cols-2">
            {champs.map((c) => (
              <div key={c.cle} className="grid gap-0.5">
                <dt className="text-sm text-slate-600">{c.libelle}</dt>
                <dd className="font-medium break-words">{valeurs[c.cle] ? (affichage?.(c, valeurs[c.cle]) ?? valeurs[c.cle]) : <span className="text-slate-500">Non renseigné</span>}</dd>
              </div>
            ))}
          </dl>
          <button ref={boutonModifier} type="button" onClick={ouvrir} className={`${BOUTON_CONTOUR} justify-self-start`}>
            Modifier<span className="sr-only"> : {titre}</span>
          </button>
        </>
      )}
    </CarteRealite>
  );
}
