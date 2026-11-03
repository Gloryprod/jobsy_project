"use client";

import { useState, type ChangeEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { safeHttpUrl } from "@/lib/utils";
import { FICHIER_ACCEPTE, LONGUEUR_MIN_TEXTE, verifierFichier } from "./regles";
import type { ChampProjet } from "./types";

type Props = {
  champ: ChampProjet;
  valeur: string;
  erreur: string | null;
  /** Temps écoulé ou envoi en cours : le livrable ne se modifie plus */
  fige: boolean;
  onChange: (valeur: string) => void;
};

const CLASSES_SAISIE =
  "w-full rounded-lg border border-slate-300 bg-white p-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/30 focus:outline-none aria-invalid:border-red-600 read-only:bg-slate-50 disabled:bg-slate-50";

/** Un livrable du projet : texte, lien ou fichier, avec son étiquette, son aide et son erreur. */
export function ChampLivrable({ champ, valeur, erreur, fige, onChange }: Props) {
  const id = `livrable-${champ.key}`;
  const [envoiFichier, setEnvoiFichier] = useState(false);
  const [erreurFichier, setErreurFichier] = useState<string | null>(null);
  const erreurAffichee = erreurFichier ?? erreur;

  const aide =
    champ.type === "url"
      ? "Lien complet, qui commence par https://"
      : champ.type === "file"
        ? "PDF, ZIP, RAR, PNG ou JPG, 20 Mo au plus."
        : `${LONGUEUR_MIN_TEXTE} caractères au moins.`;
  const decrit = [`${id}-aide`, erreurAffichee ? `${id}-erreur` : null].filter(Boolean).join(" ");

  const choisirFichier = async (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    const refus = verifierFichier(fichier);
    if (refus) {
      setErreurFichier(refus);
      return;
    }
    setErreurFichier(null);
    setEnvoiFichier(true);
    try {
      const corps = new FormData();
      corps.append("file", fichier);
      const reponse = await api.post("/upload-temp-file", corps, { headers: { "Content-Type": "multipart/form-data" } });
      onChange(String(reponse.data.url ?? ""));
    } catch (err) {
      setErreurFichier(messageErreur(err, "Le fichier n'a pas pu être envoyé. Réessaie."));
    } finally {
      setEnvoiFichier(false);
    }
  };

  const lienFichier = champ.type === "file" ? safeHttpUrl(valeur) : null;

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-base font-semibold text-slate-900">
        {champ.label}
        {champ.required ? <span className="font-normal text-slate-600"> (obligatoire)</span> : <span className="font-normal text-slate-600"> (facultatif)</span>}
      </label>
      <p id={`${id}-aide`} className="text-sm text-slate-600">
        {aide}
      </p>

      {champ.type === "textarea" && (
        <textarea
          id={id}
          rows={7}
          value={valeur}
          readOnly={fige}
          placeholder={champ.placeholder || undefined}
          aria-invalid={erreurAffichee ? true : undefined}
          aria-describedby={decrit}
          onChange={(e) => onChange(e.target.value)}
          className={CLASSES_SAISIE}
        />
      )}

      {champ.type === "url" && (
        <input
          id={id}
          type="url"
          inputMode="url"
          autoComplete="url"
          value={valeur}
          readOnly={fige}
          placeholder={champ.placeholder || "https://"}
          aria-invalid={erreurAffichee ? true : undefined}
          aria-describedby={decrit}
          onChange={(e) => onChange(e.target.value.trim())}
          className={CLASSES_SAISIE}
        />
      )}

      {champ.type === "file" && (
        <div className="grid gap-2">
          {lienFichier && (
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
              <span className="font-semibold">Fichier envoyé.</span>
              <a href={lienFichier} target="_blank" rel="noreferrer" className="font-bold text-[#000080] underline underline-offset-2">
                Voir le fichier
              </a>
            </p>
          )}
          {/* Champ natif masqué (son texte « Aucun fichier choisi » se tronque sur téléphone) : le bouton visible est une étiquette du champ */}
          <input
            id={id}
            type="file"
            accept={FICHIER_ACCEPTE}
            disabled={fige || envoiFichier}
            aria-invalid={erreurAffichee ? true : undefined}
            aria-describedby={decrit}
            onChange={choisirFichier}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            className="inline-flex min-h-11 cursor-pointer items-center justify-self-start rounded-lg bg-[#000080] px-4 font-bold text-white hover:bg-[#000060] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#000080] peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
          >
            {lienFichier ? "Remplacer le fichier" : "Choisir un fichier"}
          </label>
          {envoiFichier && (
            <p role="status" className="flex items-center gap-2 text-sm text-slate-700">
              <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
              Envoi du fichier…
            </p>
          )}
        </div>
      )}

      {erreurAffichee && (
        <p id={`${id}-erreur`} className="text-sm font-semibold text-red-700">
          {erreurAffichee}
        </p>
      )}
    </div>
  );
}
