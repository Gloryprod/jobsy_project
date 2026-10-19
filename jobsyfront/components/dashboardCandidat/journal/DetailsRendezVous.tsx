import SafeHtml from "@/components/SafeHtml";
import { LignesValeurs, type LigneValeur } from "@/components/systeme";
import { formaterHeure, formaterJour } from "@/lib/formats";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import type { OffreDetaillee } from "./types";

/** Le rendez-vous fixé par l'entreprise dans l'offre : date, heure, lieu, contact et instructions. */
export function DetailsRendezVous({ offre, niveauTitre = 3 }: { offre: OffreDetaillee; niveauTitre?: 3 | 4 }) {
  const Titre = `h${niveauTitre}` as "h3" | "h4";
  const lignes = (
    [
      { libelle: "Date", valeur: formaterJour(offre.start_date) },
      { libelle: "Heure d'arrivée", valeur: formaterHeure(offre.start_time) ?? offre.start_time },
      { libelle: "Lieu du rendez-vous", valeur: offre.place },
      { libelle: "Contact sur place", valeur: offre.contact_person },
    ] as LigneValeur[]
  ).filter((ligne) => ligne.valeur);

  return (
    <div className="grid gap-3">
      <Titre className="font-systeme text-base font-bold text-systeme-texte">Rendez-vous</Titre>
      {lignes.length > 0 ? <LignesValeurs lignes={lignes} /> : <p className="text-systeme-attenue">L&apos;entreprise n&apos;a pas encore précisé le rendez-vous.</p>}
      {offre.onboarding_instructions?.trim() && (
        <div className="grid gap-1.5 rounded-[3px] border border-systeme-lueur/25 bg-systeme-nuit/60 p-3.5">
          <p className="text-sm text-systeme-attenue">Instructions de l&apos;entreprise</p>
          <SafeHtml
            as="div"
            className={`text-[0.98rem] leading-relaxed break-words text-systeme-texte/90 ${CLASSES_TEXTE_RICHE}`}
            html={offre.onboarding_instructions.replace(/\n/g, "<br />")}
          />
        </div>
      )}
    </div>
  );
}
