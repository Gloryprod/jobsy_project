'use client';

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /** Icône décorative à gauche, positionnée en absolu (le champ prévoit alors son padding gauche). */
  icon?: ReactNode;
  wrapperClassName?: string;
  toggleClassName?: string;
};

/**
 * Champ mot de passe avec un bouton « Afficher / Masquer » : l'utilisateur peut relire sa saisie avant l'envoi.
 * Chaque champ a son propre bouton ; le texte redevient masqué au rechargement de la page.
 */
export function PasswordInput({ icon, wrapperClassName, toggleClassName, className, id, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const label = visible ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <div className={cn("relative", wrapperClassName)}>
      {icon}
      <input
        {...props}
        id={inputId}
        type={visible ? "text" : "password"}
        className={cn("block", className, "pr-12")}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        aria-controls={inputId}
        className={cn(
          // Cible de 32 px (24 px au minimum, WCAG 2.5.8)
          "absolute right-2 top-1/2 -translate-y-1/2 inline-flex size-8 items-center justify-center rounded cursor-pointer text-slate-500 hover:text-[#000080]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#000080]",
          toggleClassName
        )}
      >
        {visible ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
      </button>
    </div>
  );
}
