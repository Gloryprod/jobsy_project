// Lecture des erreurs renvoyées par l'API (axios) : code HTTP et message à afficher.

type ErreurApi = { response?: { status?: number; data?: { message?: unknown; errors?: Record<string, unknown> } } } | null;

/** Code HTTP de la réponse en erreur, ou null quand le serveur n'a pas répondu (réseau coupé). */
export function statutErreur(erreur: unknown): number | null {
  return (erreur as ErreurApi)?.response?.status ?? null;
}

/** Noms des champs refusés par la validation de l'API (réponse 422). Ses messages sont en anglais : le front affiche les siens. */
export function champsRefuses(erreur: unknown): string[] {
  return Object.keys((erreur as ErreurApi)?.response?.data?.errors ?? {});
}

/** Message de l'API s'il y en a un (rang, date limite, déjà postulé…), sinon un message utile. */
export function messageErreur(erreur: unknown, parDefaut: string): string {
  const reponse = (erreur as ErreurApi)?.response;
  if (!reponse) return "La connexion a été coupée. Vérifie ton réseau, puis réessaie.";
  const message = reponse.data?.message;
  return typeof message === "string" && message.trim() ? message : parDefaut;
}
