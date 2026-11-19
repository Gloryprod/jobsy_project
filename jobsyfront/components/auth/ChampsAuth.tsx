"use client";

import { Check, Circle } from "lucide-react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";

type PropsChamp = {
  id: string;
  libelle: string;
  valeur: string;
  onChange: (valeur: string) => void;
  erreur?: string | null;
  aide?: string;
  type?: "text" | "email";
  autoComplete?: string;
};

const decritPar = (id: string, aide?: string, erreur?: string | null) =>
  [aide ? `${id}-aide` : null, erreur ? `${id}-erreur` : null].filter(Boolean).join(" ") || undefined;

function Libelles({ id, libelle, aide }: { id: string; libelle: string; aide?: string }) {
  return (
    <>
      <label htmlFor={id} className="font-semibold text-systeme-texte">
        {libelle}
      </label>
      {aide && (
        <p id={`${id}-aide`} className="text-sm text-systeme-attenue">
          {aide}
        </p>
      )}
    </>
  );
}

function Erreur({ id, erreur }: { id: string; erreur?: string | null }) {
  if (!erreur) return null;
  return (
    <p id={`${id}-erreur`} className="text-sm font-semibold text-systeme-alerte">
      {erreur}
    </p>
  );
}

/** Champ des pages d'entrée : étiquette visible, aide et erreur liées au champ. */
export function ChampAuth({ id, libelle, valeur, onChange, erreur, aide, type = "text", autoComplete }: PropsChamp) {
  return (
    <div className="grid gap-1.5">
      <Libelles id={id} libelle={libelle} aide={aide} />
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decritPar(id, aide, erreur)}
        className={CLASSES_SAISIE}
      />
      <Erreur id={id} erreur={erreur} />
    </div>
  );
}

/** Champ de mot de passe : bouton pour afficher la saisie (PasswordInput). */
export function ChampMotDePasse({ id, libelle, valeur, onChange, erreur, aide, autoComplete }: Omit<PropsChamp, "type">) {
  return (
    <div className="grid gap-1.5">
      <Libelles id={id} libelle={libelle} aide={aide} />
      <PasswordInput
        id={id}
        name={id}
        autoComplete={autoComplete}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={erreur ? true : undefined}
        aria-describedby={decritPar(id, aide, erreur)}
        className={CLASSES_SAISIE}
      />
      <Erreur id={id} erreur={erreur} />
    </div>
  );
}

const REGLES: [string, (v: string) => boolean][] = [
  ["8 caractères au moins", (v) => v.length >= 8],
  ["Une minuscule", (v) => /[a-z]/.test(v)],
  ["Une majuscule", (v) => /[A-Z]/.test(v)],
  ["Un chiffre", (v) => /[0-9]/.test(v)],
  ["Un caractère spécial (# . - @ !…)", (v) => /[^a-zA-Z0-9]/.test(v)],
];

/** Règles du mot de passe (les mêmes que lib/password.ts et l'API), cochées pendant la saisie. */
export function ReglesMotDePasse({ valeur, id }: { valeur: string; id: string }) {
  return (
    <ul id={id} className="grid gap-1 text-sm">
      {REGLES.map(([libelle, test]) => {
        const ok = test(valeur);
        return (
          <li key={libelle} className={`flex items-center gap-2 ${ok ? "text-systeme-lueur" : "text-systeme-attenue"}`}>
            {ok ? <Check aria-hidden="true" className="size-4 shrink-0" /> : <Circle aria-hidden="true" className="size-4 shrink-0" />}
            <span>
              {libelle}
              <span className="sr-only">{ok ? " : respecté" : " : à faire"}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
