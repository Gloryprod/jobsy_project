"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Editor } from "primereact/editor";
import SafeHtml from "@/components/SafeHtml";
import { nommerBarreEditeur } from "@/lib/editeur";
import { CarteRealite } from "@/components/dashboardCandidat/qg/CarteRealite";
import { messageGuilde } from "../guilde/regles";
import { BOUTON_CONTOUR, BOUTON_PLEIN } from "./CarteChamps";

type Props = {
  description: string | null | undefined;
  /** Enregistre puis recharge le profil. Lève l'erreur de l'API en cas de refus. */
  enregistrer: (description: string | null) => Promise<void>;
};

/** La présentation de l'entreprise : affichée mise en forme (l'éditeur l'enregistre en HTML, nettoyé par l'API). */
export function CartePresentation({ description, enregistrer }: Props) {
  const [edition, setEdition] = useState(false);
  const [html, setHtml] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [reussite, setReussite] = useState<string | null>(null);
  const boutonModifier = useRef<HTMLButtonElement>(null);
  const zoneReussite = useRef<HTMLParagraphElement>(null);
  // Après un envoi, React affiche le message plus tard que la prochaine image : le focus suit l'affichage
  useEffect(() => {
    if (reussite) zoneReussite.current?.focus();
  }, [reussite]);

  const fermer = () => {
    setEdition(false);
    requestAnimationFrame(() => boutonModifier.current?.focus());
  };

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    try {
      // Un éditeur vidé renvoie « <p><br></p> » : c'est une présentation effacée
      const texte = html.replace(/<[^>]*>/g, "").trim();
      await enregistrer(texte ? html : null);
      setEdition(false);
      setReussite("Présentation enregistrée.");
    } catch (err) {
      setErreur(messageGuilde(err, "La présentation n'a pas pu être enregistrée. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <CarteRealite titre="Présentation">
      <p ref={zoneReussite} tabIndex={-1} role="status" className="text-sm font-semibold text-emerald-800 focus:outline-none empty:hidden">
        {reussite}
      </p>
      {edition ? (
        <form noValidate onSubmit={envoyer} className="grid gap-3">
          <p id="presentation-libelle" className="font-semibold">
            Présentation de l&apos;entreprise
          </p>
          <p id="presentation-aide" className="text-sm text-slate-600">
            Votre activité, vos valeurs, ce qu&apos;un candidat doit savoir avant de travailler avec vous.
          </p>
          <Editor
            value={html}
            onTextChange={(e) => setHtml(e.htmlValue ?? "")}
            onLoad={(quill) => {
              const zone = quill?.root as HTMLElement | undefined;
              zone?.setAttribute("role", "textbox");
              zone?.setAttribute("aria-multiline", "true");
              zone?.setAttribute("aria-labelledby", "presentation-libelle");
              zone?.setAttribute("aria-describedby", "presentation-aide");
              nommerBarreEditeur(quill);
              zone?.focus();
            }}
            style={{ height: "240px" }}
          />
          {erreur && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {erreur}
            </p>
          )}
          <div className="flex flex-wrap gap-2.5">
            <button type="submit" disabled={envoi} aria-busy={envoi || undefined} className={BOUTON_PLEIN}>
              {envoi ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" disabled={envoi} onClick={fermer} className={BOUTON_CONTOUR}>
              Annuler
            </button>
          </div>
        </form>
      ) : (
        <>
          {description ? (
            <SafeHtml
              as="div"
              html={description}
              className="grid gap-2 break-words whitespace-pre-line [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
            />
          ) : (
            <p className="text-slate-600">Aucune présentation pour le moment. Elle aide les candidats à vous connaître.</p>
          )}
          <button
            ref={boutonModifier}
            type="button"
            onClick={() => {
              setHtml(description ?? "");
              setErreur(null);
              setReussite(null);
              setEdition(true);
            }}
            className={`${BOUTON_CONTOUR} justify-self-start`}
          >
            Modifier<span className="sr-only"> : présentation</span>
          </button>
        </>
      )}
    </CarteRealite>
  );
}
