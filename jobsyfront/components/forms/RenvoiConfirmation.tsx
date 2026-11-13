"use client";

import { useState } from "react";
import api from "@/lib/api";

type Props = {
  /** Adresse saisie dans le formulaire : le lien de confirmation y est renvoyé */
  email: string;
};

/**
 * Renvoi de l'e-mail de confirmation (POST /auth/resend-verification), sur les pages de connexion et d'inscription.
 * Sans lui, un compte dont l'e-mail n'était pas arrivé restait bloqué : connexion refusée, adresse déjà prise.
 */
export function RenvoiConfirmation({ email }: Props) {
  const [envoi, setEnvoi] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const renvoyer = async () => {
    setEnvoi(true);
    setMessage(null);
    setErreur(null);
    try {
      await api.post("/auth/resend-verification", { email });
      setMessage("Si ce compte attend sa confirmation, un nouveau lien vient de partir. Pensez à regarder dans les courriers indésirables.");
    } catch (e) {
      const reponse = (e as { response?: { status?: number; data?: { message?: string } } }).response;
      setErreur(
        !reponse
          ? "Impossible de contacter le serveur. Vérifiez votre connexion, puis réessayez."
          : reponse.status === 429
            ? "Trop de demandes. Patientez une minute, puis réessayez."
            : reponse.data?.message || "L'e-mail n'a pas pu être renvoyé. Réessayez dans quelques minutes.",
      );
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="mb-4 grid gap-2 rounded-2xl border border-white/30 bg-white/10 p-4 text-center text-white">
      <p className="text-sm">Vous n&apos;avez pas reçu l&apos;e-mail de confirmation pour {email} ?</p>
      <button
        type="button"
        onClick={renvoyer}
        disabled={envoi}
        className="mx-auto min-h-11 rounded-2xl bg-white px-4 font-bold text-[#000080] hover:bg-white/90 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {envoi ? "Envoi…" : "Renvoyer l'e-mail de confirmation"}
      </button>
      <p role="status" className={message ? "text-sm text-[#F0E68C]" : "sr-only"}>
        {message}
      </p>
      {erreur && (
        <p role="alert" className="text-sm font-semibold text-red-200">
          {erreur}
        </p>
      )}
    </div>
  );
}
