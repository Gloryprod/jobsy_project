"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft, Copy, Download, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { BoutonSysteme, FenetreSysteme, LignesValeurs } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { lienCarte } from "../donjons/regles";
import type { CarteFormation } from "../donjons/types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

type Props = {
  courseId: string;
  courseTitle: string;
  certificateHash: string;
};

/**
 * Le trésor d'un donjon vaincu : l'XP et le badge gagnés, le certificat en PDF et son lien de vérification public.
 */
export function Certificat({ courseId, courseTitle, certificateHash }: Props) {
  const carte = useSWR<CarteFormation>(`/get_modules/${courseId}`, lireDonnees);
  const [telechargement, setTelechargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);

  const cheminVerification = `/verify/${certificateHash}`;
  const lienVerification = typeof window === "undefined" ? cheminVerification : `${window.location.origin}${cheminVerification}`;

  const copier = async () => {
    setAnnonce(null);
    try {
      await navigator.clipboard.writeText(lienVerification);
      setAnnonce("Lien copié : tu peux le coller dans un message ou sur ton CV.");
    } catch {
      // Presse-papiers refusé (navigateur ou réglage) : le lien reste sélectionnable dans le champ
      setAnnonce("La copie n'a pas pu se faire. Sélectionne le lien dans le champ ci-dessus pour le copier.");
    }
  };

  const telecharger = async () => {
    setTelechargement(true);
    setErreur(null);
    try {
      const reponse = await api.get(`/courses/${courseId}/${certificateHash}/certificate/download`, { responseType: "blob" });
      const url = URL.createObjectURL(new Blob([reponse.data], { type: "application/pdf" }));
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = `certificat-jobsy-${courseTitle.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.pdf`;
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setErreur("Le certificat n'a pas pu être téléchargé. Réessaie dans un instant.");
    } finally {
      setTelechargement(false);
    }
  };

  const course = carte.data?.course;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-2">
        <Link
          href="/dashboard/candidats/formations"
          className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Retour aux formations
        </Link>
        <p className="text-sm font-bold text-[#000080]">Donjon vaincu</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{courseTitle}</h1>
      </header>

      <FenetreSysteme etiquette="Trésor" titre="Tu es certifié pour cette formation" niveauTitre={2} ton="recompense" className="gap-4">
        <p className="text-systeme-attenue">Ta réussite est enregistrée sur Jobsy : les entreprises peuvent vérifier ton certificat en ligne.</p>

        {course && (
          <LignesValeurs
            lignes={[
              { libelle: "XP gagnée", valeur: `+${course.reward_xp ?? 0} XP`, ton: "or" as const },
              ...(course.reward_asset ? [{ libelle: "Badge", valeur: course.reward_asset, ton: "or" as const }] : []),
              ...((course.delivered_skills?.length ?? 0) > 0 ? [{ libelle: "Compétences", valeur: course.delivered_skills!.join(", ") }] : []),
            ]}
          />
        )}

        <div className="grid gap-2">
          <label htmlFor="lien-verification" className="text-sm text-systeme-attenue">
            Lien de vérification public
          </label>
          <input
            id="lien-verification"
            readOnly
            value={lienVerification}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 w-full rounded-[3px] border border-systeme-lueur/40 bg-systeme-nuit px-3 font-mono text-sm text-systeme-texte"
          />
          <p role="status" className={annonce ? "text-sm text-systeme-lueur" : "sr-only"}>
            {annonce}
          </p>
        </div>

        <Alerte message={erreur} />

        <div className="flex flex-wrap gap-2.5">
          <BoutonSysteme onClick={telecharger} chargement={telechargement}>
            <Download aria-hidden="true" className="size-4" />
            Télécharger mon certificat (PDF)
          </BoutonSysteme>
          <BoutonSysteme variante="contour" onClick={copier}>
            <Copy aria-hidden="true" className="size-4" />
            Copier le lien
          </BoutonSysteme>
          <a
            href={cheminVerification}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-[3px] px-2 font-bold text-systeme-lueur underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Voir la page de vérification<span className="sr-only"> (nouvel onglet)</span>
          </a>
        </div>
      </FenetreSysteme>

      <Link href={lienCarte(Number(courseId))} className="justify-self-start text-sm font-bold text-[#000080] underline-offset-4 hover:underline">
        Revoir la carte du donjon
      </Link>
    </div>
  );
}
