"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { CarteRealite, ErreurSection, LienDiscret, LienRealite, PastilleStatut, type TonStatut } from "./CarteRealite";
import type { Inscription } from "./types";

const NOMBRE_AFFICHE = 3;

const STATUTS: Record<string, { libelle: string; ton: TonStatut; ordre: number }> = {
  evaluation_ready: { libelle: "Examen prêt", ton: "action", ordre: 0 },
  learning: { libelle: "En cours", ton: "action", ordre: 1 },
  enrolled: { libelle: "En cours", ton: "action", ordre: 1 },
  waiting_kit: { libelle: "Kit en attente", ton: "attente", ordre: 2 },
  pending_review: { libelle: "En correction", ton: "attente", ordre: 3 },
  certified: { libelle: "Certifiée", ton: "succes", ordre: 4 },
  failed: { libelle: "Non validée", ton: "echec", ordre: 5 },
};

const statutDe = (inscription: Inscription) => STATUTS[inscription.status] ?? { libelle: inscription.status, ton: "neutre" as TonStatut, ordre: 9 };

type Props = {
  inscriptions: Inscription[] | undefined;
  erreur: boolean;
  reessayer: () => void;
};

/** Formations du candidat : les plus urgentes d'abord, avec l'action utile. */
export function Donjons({ inscriptions, erreur, reessayer }: Props) {
  const [telechargement, setTelechargement] = useState<string | null>(null);

  const telechargerCertificat = async (inscription: Inscription) => {
    if (!inscription.course || !inscription.certificate_hash) return;
    try {
      setTelechargement(inscription.certificate_hash);
      const reponse = await api.get(`/courses/${inscription.course.id}/${inscription.certificate_hash}/certificate/download`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([reponse.data]));
      const lien = document.createElement("a");
      lien.href = url;
      lien.setAttribute("download", `Certificat-${inscription.course.title.replace(/\s+/g, "_")}.pdf`);
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Le certificat n'a pas pu être téléchargé. Réessaie dans un instant.");
    } finally {
      setTelechargement(null);
    }
  };

  const triees = inscriptions ? [...inscriptions].sort((a, b) => statutDe(a).ordre - statutDe(b).ordre) : [];

  return (
    <CarteRealite
      titre="Mes formations"
      lienPied={triees.length ? <LienDiscret href="/dashboard/candidats/formations">Voir toutes les formations</LienDiscret> : undefined}
    >
      {erreur ? (
        <ErreurSection texte="Tes formations n'ont pas pu être chargées." reessayer={reessayer} />
      ) : !inscriptions ? (
        <p className="text-slate-500">Chargement de tes formations…</p>
      ) : triees.length === 0 ? (
        <div className="grid gap-3">
          <p className="text-slate-600">Aucune formation suivie. Une formation certifiée rapporte de l&apos;XP et te rapproche du rang suivant.</p>
          <LienRealite href="/dashboard/candidats/formations" className="justify-self-start">
            Voir les formations
          </LienRealite>
        </div>
      ) : (
        <ul className="grid gap-3">
          {triees.slice(0, NOMBRE_AFFICHE).map((inscription) => {
            const statut = statutDe(inscription);
            const progression = Math.min(100, Math.max(0, Math.round(inscription.progress_percentage ?? 0)));
            const espace = `/dashboard/candidats/formations/${inscription.course?.id ?? inscription.course_id}/workspace`;
            const enCours = inscription.status === "learning" || inscription.status === "enrolled";
            return (
              <li key={inscription.id} className="grid gap-2 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold break-words">{inscription.course?.title ?? "Formation"}</p>
                    {inscription.course?.reward_xp ? <p className="text-sm text-slate-500">+{inscription.course.reward_xp} XP à la certification</p> : null}
                  </div>
                  <PastilleStatut ton={statut.ton}>{statut.libelle}</PastilleStatut>
                </div>

                {inscription.status !== "certified" && (
                  <div className="grid gap-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Progression</span>
                      <span className="tabular-nums">{progression} %</span>
                    </div>
                    <div
                      role="progressbar"
                      aria-label={`Progression : ${inscription.course?.title ?? "formation"}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progression}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                    >
                      <div className="h-full w-full origin-left bg-[#000080]" style={{ transform: `scaleX(${progression / 100})` }} />
                    </div>
                  </div>
                )}

                {inscription.status === "evaluation_ready" && (
                  <LienDiscret href={espace} className="justify-self-start">
                    Passer l&apos;examen final
                  </LienDiscret>
                )}
                {enCours && (
                  <LienDiscret href={espace} className="justify-self-start">
                    Continuer
                  </LienDiscret>
                )}
                {inscription.status === "certified" && inscription.certificate_hash && (
                  <button
                    type="button"
                    onClick={() => telechargerCertificat(inscription)}
                    disabled={telechargement === inscription.certificate_hash}
                    className="inline-flex min-h-11 cursor-pointer items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline disabled:cursor-wait disabled:opacity-60"
                  >
                    {telechargement === inscription.certificate_hash ? (
                      <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Download aria-hidden="true" className="size-4" />
                    )}
                    Télécharger le certificat
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </CarteRealite>
  );
}
