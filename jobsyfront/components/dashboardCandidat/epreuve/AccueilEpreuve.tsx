import type { Ref } from "react";
import { BoutonSysteme, LienSysteme, LignesValeurs, type LigneValeur } from "@/components/systeme";
import { formaterDateCourte, formaterFcfa } from "@/lib/formats";
import { formaterXp } from "@/lib/progression";
import type { TonStatut } from "../qg/CarteRealite";
import type { EtatPortail } from "../portails/regles";
import { Alerte } from "./Alerte";
import type { MissionEpreuve } from "./types";

/** court : rangs E et D (motivation seule) ; ponctuelle : rang C et plus, reçue dès la motivation ; complet : CDD ou CDI, envoyée à la fin */
export type Parcours = "court" | "ponctuelle" | "complet";

type Props = {
  mission: MissionEpreuve;
  etat: EtatPortail;
  rangCandidat: string;
  parcours: Parcours;
  /** Candidature déjà envoyée (statut autre que brouillon) */
  statutExistant: { libelle: string; ton: TonStatut; lien?: string; action?: string } | null;
  /** Un brouillon existe : l'épreuve se reprend */
  reprise: boolean;
  ouverte: boolean;
  fermee: boolean;
  stockage: boolean;
  chargement: boolean;
  erreur: string | null;
  onCommencer: () => void;
  titreRef: Ref<HTMLHeadingElement>;
};

const DEROULEMENT: Record<Parcours, string> = {
  court: "Tu réponds à quelques questions de motivation. Ta candidature est envoyée dès que tu as répondu.",
  ponctuelle:
    "Tu réponds à quelques questions de motivation, puis à quelques questions techniques. Ta candidature est reçue dès la motivation : les questions techniques affinent ta note.",
  complet:
    "Tu réponds à quelques questions de motivation, puis à quelques questions techniques. Ta candidature est envoyée à la fin des questions techniques.",
};

export function AccueilEpreuve(props: Props) {
  const { mission, etat, rangCandidat, parcours, statutExistant, reprise, ouverte, fermee, stockage, chargement, erreur, onCommencer, titreRef } = props;

  const lignes: LigneValeur[] = [
    { libelle: "Récompense", valeur: formaterFcfa(mission.reward) ?? "Non précisée", ton: "or" },
    { libelle: "Expérience", valeur: "+250 XP à la validation", ton: "or" },
    { libelle: "Contrat", valeur: mission.type_contrat },
  ];
  const jusquau = formaterDateCourte(mission.deadline);
  if (jusquau) lignes.push({ libelle: "Ouverte jusqu'au", valeur: jusquau });

  const titre = (texte: string) => (
    <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte focus:outline-none">
      {texte}
    </h2>
  );

  // Les refus d'avance, du plus définitif au plus temporaire
  if (fermee) {
    return (
      <div className="grid gap-4">
        {titre("Cette mission est fermée")}
        <p className="text-systeme-attenue">L&apos;entreprise ne prend plus de candidatures pour cette mission.</p>
        <LienSysteme href="/dashboard/candidats/missions" className="justify-self-start">
          Voir les missions ouvertes
        </LienSysteme>
      </div>
    );
  }

  if (statutExistant) {
    return (
      <div className="grid gap-4">
        {titre("Tu as déjà postulé à cette mission")}
        <p className="text-systeme-attenue">
          État de ta candidature : <strong className="text-systeme-texte">{statutExistant.libelle}</strong>.
        </p>
        <div className="flex flex-wrap gap-3">
          {statutExistant.lien && statutExistant.action && <LienSysteme href={statutExistant.lien}>{statutExistant.action}</LienSysteme>}
          <LienSysteme href="/dashboard/candidats" variante="contour">
            Voir mon QG
          </LienSysteme>
        </div>
      </div>
    );
  }

  if (!ouverte) {
    return (
      <div className="grid gap-4">
        {titre("La date limite est passée")}
        <p className="text-systeme-attenue">Cette mission n&apos;accepte plus de candidatures depuis le {jusquau}.</p>
        <LienSysteme href="/dashboard/candidats/missions" className="justify-self-start">
          Voir les missions ouvertes
        </LienSysteme>
      </div>
    );
  }

  if (!etat.ouvert) {
    return (
      <div className="grid gap-4">
        {titre("Portail verrouillé")}
        <p className="text-systeme-attenue">
          Cette mission demande le rang {etat.requis.rank}. Ton rang : {rangCandidat}.
          {etat.manque > 0
            ? ` Il te manque ${formaterXp(etat.manque)} : chaque mission validée et chaque formation certifiée t'en rapportent.`
            : " Ton rang sera réévalué à ton prochain gain d'XP."}
        </p>
        <LienSysteme href="/dashboard/candidats/formations" className="justify-self-start">
          Voir les formations
        </LienSysteme>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {titre(reprise ? "Reprends ta candidature" : "Prêt pour l'épreuve ?")}
      <LignesValeurs lignes={lignes} />
      <div className="grid gap-2 text-systeme-attenue">
        <p>{DEROULEMENT[parcours]}</p>
        <p>L&apos;IA analyse tes réponses et l&apos;entreprise voit ton résultat. Prévois 5 à 10 minutes, au calme.</p>
        <p>
          {stockage
            ? "Si tu t'arrêtes avant d'envoyer, tes réponses restent sur cet appareil et tu pourras reprendre."
            : "Si tu t'arrêtes avant d'envoyer, tes réponses non envoyées seront perdues, mais tu pourras reprendre la candidature."}
        </p>
      </div>
      <Alerte message={erreur} />
      <BoutonSysteme onClick={onCommencer} chargement={chargement} className="justify-self-start">
        {reprise ? "Reprendre l'épreuve" : "Commencer l'épreuve"}
      </BoutonSysteme>
    </div>
  );
}
