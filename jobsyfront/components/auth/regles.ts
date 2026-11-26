// Messages des pages d'entrée (lot 6a) : l'API répond parfois en anglais, l'écran affiche les siens.
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { PASSWORD_HINT } from "@/lib/password";

export const emailValide = (valeur: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());

/** Refus de l'API champ par champ (422), en français. Les autres champs gardent un message générique. */
export function erreursApi(erreur: unknown): Record<string, string> {
  if (statutErreur(erreur) !== 422) return {};
  const messages: Record<string, string> = {};
  for (const champ of champsRefuses(erreur)) {
    if (champ === "email") messages.email = "Un compte existe déjà avec cette adresse, ou elle n'est pas valide.";
    else if (champ === "password") messages.password = PASSWORD_HINT;
    else messages[champ] = "Ce champ n'est pas accepté.";
  }
  return messages;
}

export function messageReseau(erreur: unknown, parDefaut: string): string {
  const code = statutErreur(erreur);
  if (code === null) return "Impossible de contacter le serveur. Vérifiez votre connexion, puis réessayez.";
  if (code === 429) return "Trop de tentatives. Patientez une minute, puis réessayez.";
  return parDefaut;
}
