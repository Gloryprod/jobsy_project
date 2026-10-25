import { AlertTriangle } from "lucide-react";

/** Erreur d'une étape, annoncée aux lecteurs d'écran, dans le style du Système. */
export function Alerte({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2.5 rounded-[3px] border border-systeme-alerte/60 bg-systeme-alerte/10 p-3 text-sm text-systeme-texte">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-systeme-alerte" />
      <span>{message}</span>
    </p>
  );
}
