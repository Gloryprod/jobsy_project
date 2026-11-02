"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Check } from "lucide-react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { POURCENT } from "../donjons/regles";
import type { Capsule, ResultatQuiz } from "./types";

type Props = {
  capsule: Capsule;
  courseId: string;
  /** Seuil de réussite renvoyé par l'API (80 % aujourd'hui) */
  seuil: number | null;
  titreRef: RefObject<HTMLHeadingElement | null>;
  /**
   * Après une victoire : recharge l'espace de formation, puis ouvre l'étape suivante. Sans étape suivante,
   * la formation passe à l'examen final : on ne le fait qu'au clic, pour laisser lire la correction.
   */
  onContinuer: () => Promise<void>;
  /** Une autre étape suit ce combat (sinon, c'est le boss) */
  aUneSuite: boolean;
  /** Après une victoire qui n'est pas la dernière : recharge en arrière-plan, pour que le plan ouvre la suite */
  onVictoire?: () => void;
  /** Combat déjà gagné : passer à l'étape suivante */
  onSuivant: (() => void) | null;
};

/**
 * Le quiz d'un module, vu comme un combat : seuil annoncé avant, choix unique ou multiple pour chaque question.
 * Après un échec, seulement le score : l'API ne montre la correction qu'après une réussite.
 */
export function CombatQuiz({ capsule, courseId, seuil, titreRef, onContinuer, aUneSuite, onVictoire, onSuivant }: Props) {
  const questions = capsule.questions ?? [];
  const [reponses, setReponses] = useState<Record<number, string[]>>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [resultat, setResultat] = useState<ResultatQuiz | null>(null);
  const resultatRef = useRef<HTMLHeadingElement>(null);

  // Le résultat reçoit le focus : il remplace le bouton qui vient d'être utilisé
  useEffect(() => {
    if (resultat) resultatRef.current?.focus();
  }, [resultat]);

  const choisir = (questionId: number, option: string, multiple: boolean) => {
    setReponses((avant) => {
      const actuelles = avant[questionId] ?? [];
      if (!multiple) return { ...avant, [questionId]: [option] };
      return { ...avant, [questionId]: actuelles.includes(option) ? actuelles.filter((o) => o !== option) : [...actuelles, option] };
    });
  };

  const repondues = questions.filter((q) => (reponses[q.id]?.length ?? 0) > 0).length;

  const envoyer = async () => {
    if (repondues < questions.length) {
      setErreur(`Réponds à chaque question avant de valider (${repondues} sur ${questions.length}).`);
      return;
    }
    setEnvoi(true);
    setErreur(null);
    try {
      const reponse = await api.post(`/candidat/modules/${capsule.module_id}/submit-quiz`, { course_id: courseId, answers: reponses });
      const donnees = reponse.data.data as ResultatQuiz;
      setResultat(donnees);
      if (donnees.is_passed && aUneSuite) onVictoire?.();
    } catch (e) {
      setErreur(messageErreur(e, "Tes réponses n'ont pas pu être envoyées. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const continuer = async () => {
    setEnvoi(true);
    setErreur(null);
    try {
      await onContinuer();
    } catch (e) {
      setErreur(messageErreur(e, "La suite n'a pas pu se charger. Réessaie."));
    } finally {
      setEnvoi(false);
    }
  };

  const retenter = () => {
    setResultat(null);
    setReponses({});
    setErreur(null);
    titreRef.current?.focus();
  };

  const score = resultat ? Math.round(resultat.score) : 0;
  const corrections = resultat && !Array.isArray(resultat.corrections) ? resultat.corrections : {};

  // Combat déjà gagné : on ne le rejoue pas (un nouvel essai raté ferait perdre la salle)
  if (capsule.is_completed && !resultat) {
    return (
      <FenetreSysteme etiquette="Combat" ton="recompense" balayage={false}>
        <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl font-bold text-systeme-texte outline-none">
          {capsule.title}
        </h2>
        <p className="text-systeme-attenue">Combat gagné : ce quiz est validé.</p>
        {onSuivant && (
          <BoutonSysteme onClick={onSuivant} className="justify-self-start">
            Étape suivante
          </BoutonSysteme>
        )}
      </FenetreSysteme>
    );
  }

  return (
    <FenetreSysteme etiquette="Combat" ton={resultat?.is_passed ? "recompense" : resultat ? "alerte" : "info"} balayage={false} className="gap-5">
      <div className="grid gap-1">
        <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl font-bold text-balance text-systeme-texte outline-none">
          {capsule.title}
        </h2>
        <p className="text-systeme-attenue">
          {questions.length} question{questions.length > 1 ? "s" : ""}
          {seuil ? `. Il faut ${seuil}${POURCENT} de bonnes réponses pour gagner ce combat et ouvrir la suite.` : "."}
        </p>
      </div>

      {resultat && (
        <div className="grid gap-2 rounded-[3px] border border-systeme-lueur/25 bg-systeme-nuit/60 p-4">
          <h3 ref={resultatRef} tabIndex={-1} className="font-systeme text-lg font-bold text-systeme-texte outline-none">
            {resultat.is_passed ? `Combat gagné : ${score}${POURCENT}` : `Score : ${score}${POURCENT}`}
          </h3>
          <p className="text-systeme-attenue">
            {resultat.is_passed
              ? "La salle est validée. Voici la correction."
              : `${seuil ? `Il faut ${seuil}${POURCENT} pour gagner. ` : ""}Relis les leçons de la salle, puis retente le combat : tu peux réessayer autant de fois que nécessaire.`}
          </p>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {resultat.is_passed ? (
              <BoutonSysteme onClick={continuer} chargement={envoi}>
                {aUneSuite ? "Étape suivante" : "Affronter le boss"}
              </BoutonSysteme>
            ) : (
              <BoutonSysteme onClick={retenter}>Retenter le combat</BoutonSysteme>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {questions.map((question, index) => {
          const multiple = !!question.is_multiple;
          const choisies = reponses[question.id] ?? [];
          const correction = corrections[question.id];
          const verrouille = !!resultat;
          return (
            <fieldset key={question.id} className="grid gap-2 rounded-[3px] border border-systeme-lueur/25 p-4">
              <legend className="px-1 font-semibold text-systeme-texte">
                Question {index + 1} : {question.question_text}
              </legend>
              <p className="text-sm text-systeme-attenue">{multiple ? "Plusieurs réponses possibles." : "Une seule réponse."}</p>
              <div className="grid gap-2">
                {question.options.map((option) => {
                  const coche = choisies.includes(option);
                  const attendue = correction?.correct_answers?.includes(option);
                  return (
                    <label
                      key={option}
                      className={`flex min-h-11 items-center gap-3 rounded-[3px] border px-3 py-2 ${
                        coche ? "border-systeme-lueur bg-systeme-lueur/12" : "border-systeme-lueur/20"
                      } ${verrouille ? "cursor-default" : "cursor-pointer hover:bg-systeme-lueur/8"}`}
                    >
                      <input
                        type={multiple ? "checkbox" : "radio"}
                        name={`question-${question.id}`}
                        checked={coche}
                        disabled={verrouille}
                        onChange={() => choisir(question.id, option, multiple)}
                        className="size-4 shrink-0 accent-[#56D8FF]"
                      />
                      <span className="flex-1 text-systeme-texte">{option}</span>
                      {attendue && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-systeme-or">
                          <Check aria-hidden="true" className="size-3.5" />
                          Réponse attendue
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}
      </div>

      <Alerte message={erreur} />

      {!resultat && (
        <div className="flex flex-wrap items-center gap-3">
          <BoutonSysteme onClick={envoyer} chargement={envoi}>
            Valider mes réponses
          </BoutonSysteme>
          <span className="text-sm text-systeme-attenue" aria-live="polite">
            {repondues} sur {questions.length} répondue{repondues > 1 ? "s" : ""}
          </span>
        </div>
      )}
    </FenetreSysteme>
  );
}
