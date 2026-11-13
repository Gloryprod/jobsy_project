"use client";

import type { ButtonHTMLAttributes, ChangeEvent, ReactNode, Ref } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLASSES_SAISIE } from "../commun/saisie";

const CONTOUR_FOCUS = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

type PropsBouton = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "plein" | "contour" | "danger";
  chargement?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

/** Bouton de la couche réalité (cartes blanches du dossier). */
export function BoutonDossier({ variante = "plein", chargement = false, className, children, disabled, type = "button", ...reste }: PropsBouton) {
  return (
    <button
      type={type}
      disabled={disabled || chargement}
      aria-busy={chargement || undefined}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 font-bold disabled:cursor-not-allowed disabled:opacity-60",
        CONTOUR_FOCUS,
        variante === "plein" && "bg-[#000080] text-white hover:bg-[#000060]",
        variante === "contour" && "border border-[#000080] text-[#000080] hover:bg-[#000080]/5",
        variante === "danger" && "text-red-700 hover:bg-red-50",
        className,
      )}
      {...reste}
    >
      {chargement && <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />}
      {children}
    </button>
  );
}

type PropsCarte = { id: string; titre: string; action?: ReactNode; titreRef?: Ref<HTMLHeadingElement>; children: ReactNode };

/** Une carte blanche du dossier, avec son titre et son action éventuelle. */
export function CarteDossier({ id, titre, action, titreRef, children }: PropsCarte) {
  return (
    <section aria-labelledby={`${id}-titre`} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id={`${id}-titre`} ref={titreRef} tabIndex={-1} className="font-systeme text-lg font-bold text-slate-900 outline-none">
          {titre}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export type OptionChamp = { valeur: string; libelle: string };

type PropsChamp = {
  id: string;
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  erreur?: string | null;
  aide?: string;
  type?: "text" | "email" | "url" | "tel" | "date" | "password";
  multiligne?: boolean;
  options?: OptionChamp[];
  autoComplete?: string;
  name?: string;
};

/** Un champ de formulaire : étiquette liée, aide et erreur annoncées avec le champ. */
export function Champ({ id, libelle, valeur, onChange, erreur, aide, type = "text", multiligne, options, autoComplete, name }: PropsChamp) {
  const decrit = [aide ? `${id}-aide` : null, erreur ? `${id}-erreur` : null].filter(Boolean).join(" ") || undefined;
  const commun = { id, name, value: valeur, autoComplete, "aria-invalid": erreur ? true : undefined, "aria-describedby": decrit, className: CLASSES_SAISIE };

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="font-semibold text-slate-900">
        {libelle}
      </label>
      {aide && (
        <p id={`${id}-aide`} className="text-sm text-slate-600">
          {aide}
        </p>
      )}
      {options ? (
        <select {...commun} onChange={(e) => onChange(e.target.value)}>
          {options.map((option) => (
            <option key={option.valeur} value={option.valeur}>
              {option.libelle}
            </option>
          ))}
        </select>
      ) : multiligne ? (
        <textarea {...commun} rows={4} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input {...commun} type={type} onChange={(e) => onChange(e.target.value)} />
      )}
      {erreur && (
        <p id={`${id}-erreur`} className="text-sm font-semibold text-red-700">
          {erreur}
        </p>
      )}
    </div>
  );
}

type PropsFichier = {
  id: string;
  libelle: string;
  accept: string;
  decritPar?: string;
  invalide?: boolean;
  desactive?: boolean;
  onChoix: (fichier: File) => void;
};

/** Choix d'un fichier : champ natif masqué, dont l'étiquette visible sert de bouton (atteint au clavier). */
export function BoutonFichier({ id, libelle, accept, decritPar, invalide, desactive, onChoix }: PropsFichier) {
  const choisir = (e: ChangeEvent<HTMLInputElement>) => {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (fichier) onChoix(fichier);
  };

  return (
    <div className="grid justify-items-start">
      <input id={id} type="file" accept={accept} disabled={desactive} aria-invalid={invalide ? true : undefined} aria-describedby={decritPar} onChange={choisir} className="peer sr-only" />
      <label
        htmlFor={id}
        className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#000080] px-4 font-bold text-[#000080] hover:bg-[#000080]/5 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#000080] peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
      >
        {libelle}
      </label>
    </div>
  );
}

/** Confirmation d'une action réussie, annoncée aux lecteurs d'écran. */
export function MessageReussite({ message }: { message: string | null }) {
  return (
    <p role="status" className={message ? "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900" : "sr-only"}>
      {message}
    </p>
  );
}

export function MessageErreurDossier({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      {message}
    </p>
  );
}
