import { CheckCircle2, Circle } from "lucide-react";
import { FenetreSysteme, LienSysteme, LignesValeurs, type LigneValeur } from "@/components/systeme";
import { BlocRang } from "../qg/BlocRang";
import type { ProfilCandidat } from "../qg/types";
import { formaterMoyenne, pluriel, type Statistiques } from "./regles";
import type { TitreInventaire } from "./types";

type Props = {
  profil: ProfilCandidat;
  /** null tant que les missions ne sont pas chargées : les lignes ne sont alors pas affichées */
  statistiques: Statistiques | null;
  formationsCertifiees: number | null;
  /** null tant que l'inventaire n'est pas chargé, ou s'il n'a pas pu l'être */
  titres: TitreInventaire[] | null;
};

/** La fenêtre de statut : rang, statistiques calculées sur des données réelles, compétences et titres équipés. */
export function FenetrePersonnage({ profil, statistiques, formationsCertifiees, titres }: Props) {
  const lignes: LigneValeur[] = [];
  if (statistiques) {
    const { missionsValidees, reputation, ponctualite } = statistiques;
    lignes.push({ libelle: "Missions validées", valeur: missionsValidees });
    lignes.push({ libelle: "Réputation", valeur: reputation ? `${formaterMoyenne(reputation.moyenne)} / 5 (${pluriel(reputation.notes, "note")})` : "Pas encore de note" });
    lignes.push({ libelle: "Ponctualité", valeur: ponctualite ? `À l'heure ${ponctualite.aLHeure} fois sur ${ponctualite.total}` : "Pas encore de mission" });
  }
  if (formationsCertifiees !== null) lignes.push({ libelle: "Savoir", valeur: `${formationsCertifiees} formation${formationsCertifiees > 1 ? "s" : ""} certifiée${formationsCertifiees > 1 ? "s" : ""}` });
  if (typeof profil.streak_count === "number") lignes.push({ libelle: "Série d'activité", valeur: pluriel(profil.streak_count, "jour") });
  if (typeof profil.vitality === "number") lignes.push({ libelle: "Vitalité", valeur: `${profil.vitality} / 100`, ton: profil.vitality < 50 ? "alerte" : "normal" });

  const competences = profil.skills ?? [];

  return (
    <FenetreSysteme etiquette="Statut" titre="Ta fenêtre de statut" niveauTitre={2}>
      <BlocRang profil={profil} />

      {lignes.length > 0 && (
        <div className="grid gap-2">
          <LignesValeurs lignes={lignes} />
          <p className="text-sm text-systeme-attenue">Ces chiffres viennent de tes vraies missions et formations.</p>
        </div>
      )}

      <div className="grid gap-2">
        <h3 className="font-semibold text-systeme-texte">Compétences</h3>
        {competences.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {competences.map((competence) => (
              <li key={competence.id} className="rounded-[3px] border border-systeme-lueur/40 px-2 py-1 text-sm text-systeme-texte">
                {competence.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-systeme-attenue">Dépose ton CV ou termine une formation pour révéler tes compétences.</p>
        )}
      </div>

      {titres && (
        <div className="grid gap-2">
          <h3 className="font-semibold text-systeme-texte">Titres équipés</h3>
          {titres.length > 0 ? (
            <ul className="grid gap-1.5">
              {titres.map((titre) => (
                <li key={titre.id} className="flex justify-between gap-3 text-systeme-texte">
                  <span className="font-semibold text-systeme-or">{titre.name}</span>
                  <span className="shrink-0 text-sm text-systeme-attenue capitalize">{titre.rarity}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-systeme-attenue">Aucun titre équipé pour l&apos;instant.</p>
          )}
          <LienSysteme href="/dashboard/candidats/inventaire" variante="contour" className="justify-self-start">
            Voir mon inventaire
          </LienSysteme>
        </div>
      )}
    </FenetreSysteme>
  );
}

type PropsReconnaissance = { valide: boolean; aCv: boolean; aDiplome: boolean };

/** La validation du profil par l'équipe : dite telle qu'elle est, avec les étapes qui restent. */
export function Reconnaissance({ valide, aCv, aDiplome }: PropsReconnaissance) {
  if (valide) {
    return (
      <FenetreSysteme etiquette="Reconnaissance" titre="Profil validé par l'équipe Jobsy" ton="recompense" niveauTitre={2} balayage={false}>
        <p className="text-systeme-attenue">Ton dossier a été vérifié.</p>
      </FenetreSysteme>
    );
  }

  const etapes = [
    { libelle: "CV déposé", fait: aCv },
    { libelle: "Diplôme ajouté avec son justificatif", fait: aDiplome },
    { libelle: "Vérification par l'équipe Jobsy", fait: false },
  ];
  const complet = aCv && aDiplome;

  return (
    <FenetreSysteme etiquette="Reconnaissance" titre={complet ? "L'équipe Jobsy vérifie ton dossier" : "Complète ton dossier"} niveauTitre={2} balayage={false}>
      <p className="text-systeme-attenue">
        {complet ? "Ton dossier est complet. Ton rang sera mis à jour après sa validation." : "Une fois ton dossier complet, l'équipe Jobsy le vérifie et met ton rang à jour."}
      </p>
      <ul className="grid gap-1.5">
        {etapes.map((etape) => (
          <li key={etape.libelle} className="flex items-center gap-2 text-systeme-texte">
            {etape.fait ? <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 text-systeme-lueur" /> : <Circle aria-hidden="true" className="size-4 shrink-0 text-systeme-attenue" />}
            <span>
              {etape.libelle}
              <span className="sr-only">{etape.fait ? " : fait" : " : à venir"}</span>
            </span>
          </li>
        ))}
      </ul>
    </FenetreSysteme>
  );
}
