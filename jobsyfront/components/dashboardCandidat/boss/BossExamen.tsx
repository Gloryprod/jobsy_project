"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { BoutonSysteme, Echeance, FenetreSysteme, LienSysteme, LignesValeurs, useMaintenant } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { lienCarte, POURCENT } from "../donjons/regles";
import type { CarteFormation } from "../donjons/types";
import { basculerReponse, ListeQuestions, nombreRepondues, type Reponses } from "../salles/ListeQuestions";
import type { QuestionQuiz } from "../salles/types";

/** GET /final-exam-workspace/{id} (CourseWorkspaceController::showFinalExamQuestions) */
type ExamenServi = {
  status: "success" | "blocked";
  questions: QuestionQuiz[];
  can_retry: boolean;
  /** Fin du délai de 24 h, calculée à la réception (secondes restantes renvoyées par l'API) */
  fin: number | null;
};

const lireExamen = (url: string): Promise<ExamenServi> =>
  api.get(url).then((reponse) => {
    const corps = reponse.data;
    const restant = Number(corps.data?.time_remaining) || 0;
    return {
      status: corps.status,
      questions: corps.data?.questions ?? [],
      can_retry: corps.data?.can_retry !== false,
      fin: restant > 0 ? Date.now() + restant * 1000 : null,
    };
  });
const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

type Resultat = { reussi: boolean; score: number; prochaineTentative: number | null };

type Props = {
  courseId: string;
  courseTitle: string;
  /** Recharge l'espace de formation : il passe alors au certificat, ou au délai d'attente avec les salles */
  onTermine: () => unknown;
};

/**
 * Le boss d'un donjon Standard ou Logistique : l'examen final en QCM. Les règles réelles (seuil, délai)
 * viennent de la carte de la formation. Le résultat reste affiché jusqu'au clic du candidat.
 */
export function BossExamen({ courseId, courseTitle, onTermine }: Props) {
  const examen = useSWR<ExamenServi>(`/final-exam-workspace/${courseId}`, lireExamen, { revalidateOnFocus: false });
  // Même clé que la carte du donjon : souvent déjà en cache
  const carte = useSWR<CarteFormation>(`/get_modules/${courseId}`, lireDonnees);
  const maintenant = useMaintenant();

  const [commence, setCommence] = useState(false);
  const [reponses, setReponses] = useState<Reponses>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);
  const premier = useRef(true);

  const phase = resultat ? "resultat" : commence ? "questions" : "accueil";
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    titreRef.current?.focus();
  }, [phase]);

  const seuil = carte.data?.final_exam.passing_score ?? null;
  const delai = carte.data?.final_exam.retry_delay_hours ?? null;
  const questions = examen.data?.questions ?? [];
  const repondues = nombreRepondues(questions, reponses);

  const envoyer = async () => {
    if (repondues < questions.length) {
      setErreur(`Réponds à chaque question avant de valider (${repondues} sur ${questions.length}).`);
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await api.post(`/final-exam/${courseId}/submit`, { answers: reponses });
      // Pendant le délai, l'API répond 200 avec un statut « blocked » et sans résultat
      if (reponse.data.status === "blocked") {
        setErreur(reponse.data.message || "Le délai avant une nouvelle tentative n'est pas écoulé.");
        setCommence(false);
        void examen.mutate();
        return;
      }
      const donnees = reponse.data.data;
      setResultat({
        reussi: !!donnees.is_passed,
        score: Math.round(Number(donnees.score) || 0),
        prochaineTentative: !donnees.is_passed && delai ? Date.now() + delai * 3600 * 1000 : null,
      });
    } catch (e) {
      setErreur(messageErreur(e, "Tes réponses n'ont pas pu être envoyées. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const titre = (texte: string) => (
    <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte outline-none">
      {texte}
    </h2>
  );

  let contenu;
  const e = examen.data;
  if (examen.isLoading) {
    contenu = <p className="text-systeme-attenue">Le Système prépare le boss…</p>;
  } else if (examen.error || !e) {
    const pasPret = statutErreur(examen.error) === 403;
    contenu = (
      <>
        {titre(pasPret ? "Le boss n'est pas encore accessible" : "L'examen n'a pas pu se charger")}
        <p className="text-systeme-attenue">
          {pasPret ? "Franchis d'abord toutes les salles du donjon : le boss s'ouvre ensuite." : "Vérifie ta connexion internet, puis réessaie."}
        </p>
        {pasPret ? (
          <LienSysteme href={lienCarte(Number(courseId))} className="justify-self-start">
            Voir la carte du donjon
          </LienSysteme>
        ) : (
          <BoutonSysteme onClick={() => examen.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        )}
      </>
    );
  } else if (resultat) {
    contenu = (
      <>
        {titre(resultat.reussi ? `Boss vaincu : ${resultat.score}${POURCENT}` : `Score : ${resultat.score}${POURCENT}`)}
        <p className="text-systeme-attenue">
          {resultat.reussi
            ? "Tu as réussi l'examen final : ta certification est prête, avec son trésor."
            : `${seuil ? `Il faut ${seuil}${POURCENT} pour vaincre le boss. ` : ""}Revois les salles en attendant la prochaine tentative.`}
        </p>
        {resultat.prochaineTentative && maintenant !== null && (
          <p className="font-semibold text-systeme-alerte">
            Prochaine tentative : <Echeance date={new Date(resultat.prochaineTentative)} />
          </p>
        )}
        <BoutonSysteme onClick={() => onTermine()} className="justify-self-start">
          {resultat.reussi ? "Voir mon certificat" : "Revoir les salles"}
        </BoutonSysteme>
      </>
    );
  } else if (!e.can_retry && e.fin) {
    const ecoule = maintenant !== null && maintenant >= e.fin;
    contenu = (
      <>
        {titre(ecoule ? "Tu peux retenter le boss" : "Prochaine tentative bientôt")}
        <p className="text-systeme-attenue">
          {ecoule
            ? "Le délai est écoulé : recharge l'examen pour le repasser."
            : `Ta dernière tentative n'a pas atteint ${seuil ? `${seuil}${POURCENT}` : "le seuil"}. Revois les salles en attendant.`}
        </p>
        {!ecoule && maintenant !== null && (
          <p className="font-semibold text-systeme-alerte">
            <Echeance date={new Date(e.fin)} />
          </p>
        )}
        {ecoule && (
          <BoutonSysteme onClick={() => examen.mutate()} className="justify-self-start">
            Recharger l&apos;examen
          </BoutonSysteme>
        )}
        <Alerte message={erreur} />
      </>
    );
  } else if (questions.length === 0) {
    contenu = (
      <>
        {titre("L'examen final est en préparation")}
        <p className="text-systeme-attenue">L&apos;équipe Jobsy n&apos;a pas encore publié les questions de cet examen. Reviens bientôt.</p>
      </>
    );
  } else if (!commence) {
    contenu = (
      <>
        {titre("L'examen final")}
        <p className="text-systeme-attenue">Tu as franchi toutes les salles. Réussis l&apos;examen final pour décrocher la certification.</p>
        <LignesValeurs
          lignes={[
            { libelle: "Questions", valeur: String(questions.length) },
            ...(seuil ? [{ libelle: "Pour réussir", valeur: `${seuil}${POURCENT}` }] : []),
            ...(delai ? [{ libelle: "Après un échec", valeur: `nouvelle tentative ${delai} h plus tard`, ton: "alerte" as const }] : []),
            ...(carte.data?.course.reward_xp ? [{ libelle: "Trésor", valeur: `+${carte.data.course.reward_xp} XP`, ton: "or" as const }] : []),
            ...(carte.data?.course.reward_asset ? [{ libelle: "Badge", valeur: carte.data.course.reward_asset, ton: "or" as const }] : []),
          ]}
        />
        <Alerte message={erreur} />
        <BoutonSysteme onClick={() => setCommence(true)} className="justify-self-start">
          Affronter le boss
        </BoutonSysteme>
      </>
    );
  } else {
    contenu = (
      <>
        {titre("L'examen final")}
        <p className="text-systeme-attenue">
          {questions.length} question{questions.length > 1 ? "s" : ""}
          {seuil ? `, ${seuil}${POURCENT} de bonnes réponses pour réussir.` : "."}
        </p>
        <ListeQuestions questions={questions} reponses={reponses} onChange={(id, option, multiple) => setReponses((r) => basculerReponse(r, id, option, multiple))} />
        <Alerte message={erreur} />
        <div className="flex flex-wrap items-center gap-3">
          <BoutonSysteme onClick={envoyer} chargement={envoi}>
            Valider mes réponses
          </BoutonSysteme>
          <span className="text-sm text-systeme-attenue" aria-live="polite">
            {repondues} sur {questions.length} répondue{repondues > 1 ? "s" : ""}
          </span>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-2">
        <Link
          href={lienCarte(Number(courseId))}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Carte du donjon
        </Link>
        <p className="text-sm font-bold text-[#000080]">Le boss du donjon</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{courseTitle}</h1>
      </header>
      <FenetreSysteme etiquette="Boss" ton={resultat?.reussi ? "recompense" : resultat || (e && !e.can_retry) ? "alerte" : "info"} balayage={false} className="gap-4">
        {contenu}
      </FenetreSysteme>
    </div>
  );
}
