import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Lien saisi par un utilisateur, utilisable dans un href seulement s'il est en http(s).
 * Bloque javascript:, data:, vbscript:... qui exécuteraient du code au clic dans la session de celui qui clique.
 */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== "string") return null
  const url = value.trim()
  return /^https?:\/\//i.test(url) ? url : null
}
