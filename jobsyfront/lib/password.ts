import { isAxiosError } from "axios";

/**
 * Règle de mot de passe, identique à celle de l'API (jobsyback/app/Support/PasswordPolicy.php).
 * Tout caractère non alphanumérique compte comme spécial (#, -, ., _, espace...) : l'ancienne liste
 * blanche [@$!%*?&] refusait des mots de passe que l'API acceptait.
 */
export const PASSWORD_HINT = "8 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.";

// Les cinq règles, dans l'ordre d'affichage des messages. Sans zod : la bibliothèque pesait 64 Ko sur la page de connexion.
const REGLES: [(motDePasse: string) => boolean, string][] = [
  [(m) => m.length >= 8, "Le mot de passe doit contenir au moins 8 caractères."],
  [(m) => /[a-z]/.test(m), "Le mot de passe doit contenir une minuscule."],
  [(m) => /[A-Z]/.test(m), "Le mot de passe doit contenir une majuscule."],
  [(m) => /[0-9]/.test(m), "Le mot de passe doit contenir un chiffre."],
  [(m) => /[^a-zA-Z0-9]/.test(m), "Le mot de passe doit contenir un caractère spécial."],
];

/** Message de la première règle non respectée, ou null si le mot de passe convient. */
export function erreurMotDePasse(motDePasse: string): string | null {
  return REGLES.find(([respectee]) => !respectee(motDePasse))?.[1] ?? null;
}

/** Vérifie un changement de mot de passe (profil) avant l'appel à l'API : message d'erreur, ou null si tout est bon. */
export function passwordChangeError(current: string, next: string, confirmation: string): string | null {
  if (!current) return "Saisissez votre mot de passe actuel.";
  const erreur = erreurMotDePasse(next);
  if (erreur) return erreur;
  if (next !== confirmation) return "Les mots de passe ne correspondent pas.";
  return null;
}

/** Message à afficher pour une erreur d'API : la première erreur de champ (422) plutôt que « Erreur de validation ». */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;
  const data = error.response?.data as { errors?: Record<string, unknown>; message?: string } | undefined;
  if (data?.errors && typeof data.errors === "object") {
    const first = Object.values(data.errors).flat()[0];
    if (typeof first === "string") return first;
  }
  return data?.message || fallback;
}
