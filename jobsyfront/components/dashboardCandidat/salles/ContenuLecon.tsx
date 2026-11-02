import { Download, ExternalLink } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import { STORAGE_URL } from "@/lib/api";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import type { Capsule } from "./types";

const lienFichier = (chemin: string) => `${STORAGE_URL}/${chemin}`;

/** Le contenu d'une leçon : texte, vidéo ou PDF, sur fond clair pour la lecture. */
export function ContenuLecon({ capsule }: { capsule: Capsule }) {
  if (capsule.type === "text") {
    const contenu = capsule.content_text ?? "";
    // Saisies en texte brut dans l'administration (on garde les retours à la ligne) ; un contenu plus ancien
    // en HTML passe par le filtre de SafeHtml au lieu d'afficher ses balises
    if (/<[a-z][^>]*>/i.test(contenu)) {
      return <SafeHtml as="div" className={`max-w-prose text-base leading-relaxed text-slate-800 ${CLASSES_TEXTE_RICHE}`} html={contenu} />;
    }
    return <div className="max-w-prose text-base leading-relaxed whitespace-pre-line text-slate-800">{contenu || "Cette leçon n'a pas encore de contenu."}</div>;
  }

  if (capsule.type === "video" && capsule.video_url) {
    return (
      <div className="grid gap-2">
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-950">
          <video src={lienFichier(capsule.video_url)} controls controlsList="nodownload" preload="metadata" className="size-full object-contain">
            Ton navigateur ne peut pas lire cette vidéo.
          </video>
        </div>
        <p className="text-sm text-slate-500">Durée : {capsule.duration}</p>
      </div>
    );
  }

  if (capsule.type === "pdf" && capsule.pdf_url) {
    const lien = lienFichier(capsule.pdf_url);
    return (
      <div className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          {/* Sur téléphone, le PDF intégré ne s'affiche souvent pas : l'ouvrir dans un onglet est la voie sûre */}
          <a
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#000080] px-4 text-sm font-bold text-white hover:bg-[#000080]/85 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
          >
            <ExternalLink aria-hidden="true" className="size-4" />
            Ouvrir le PDF<span className="sr-only"> (nouvel onglet)</span>
          </a>
          <a
            href={lien}
            download
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
          >
            <Download aria-hidden="true" className="size-4" />
            Télécharger
          </a>
        </div>
        <iframe src={`${lien}#toolbar=1`} title={capsule.title} className="hidden h-[70vh] w-full rounded-xl border border-slate-200 md:block" />
        <p className="text-sm text-slate-500">Temps de lecture estimé : {capsule.duration}</p>
      </div>
    );
  }

  return <p className="text-slate-600">Le contenu de cette leçon n&apos;est pas disponible pour l&apos;instant.</p>;
}
