import type { Ref } from "react";
import { BoutonSysteme } from "@/components/systeme";
import { Alerte } from "./Alerte";
import { LONGUEUR_MAX_MOTIVATION, LONGUEUR_MIN_MOTIVATION, type QuestionEpreuve, type Reponses } from "./types";

type Props = {
  questions: QuestionEpreuve[];
  reponses: Reponses;
  onChange: (id: number, texte: string) => void;
  onEnvoyer: () => void;
  /** Texte d'attente pendant l'envoi, null sinon */
  envoi: string | null;
  erreur: string | null;
  /** Ce que fait le bouton : « Envoyer ma candidature » ou « Passer aux questions techniques » */
  libelleEnvoi: string;
  titreRef: Ref<HTMLHeadingElement>;
};

const nombre = (n: number) => n.toLocaleString("fr-FR");

export function QuestionsMotivation({ questions, reponses, onChange, onEnvoyer, envoi, erreur, libelleEnvoi, titreRef }: Props) {
  const longueur = (id: number) => (reponses[id] ?? "").trim().length;
  const incompletes = questions.filter((q) => longueur(q.id) < LONGUEUR_MIN_MOTIVATION).length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl font-bold text-systeme-texte focus:outline-none">
          Tes motivations
        </h2>
        <p className="text-sm text-systeme-attenue">Réponds simplement, avec tes mots. L&apos;IA cherche à voir si tu as compris la mission et si tu es disponible.</p>
      </div>

      <div className="grid gap-6">
        {questions.map((question, index) => {
          const champ = `motivation-${question.id}`;
          const n = longueur(question.id);
          return (
            <div key={question.id} className="grid gap-2">
              <label htmlFor={champ} className="font-bold text-systeme-texte">
                {index + 1}. {question.label}
              </label>
              {question.context_hint && (
                <p id={`${champ}-conseil`} className="text-sm text-systeme-attenue">
                  <span className="font-semibold text-systeme-or">Conseil : </span>
                  {question.context_hint}
                </p>
              )}
              <textarea
                id={champ}
                rows={4}
                maxLength={LONGUEUR_MAX_MOTIVATION}
                readOnly={!!envoi}
                value={reponses[question.id] ?? ""}
                onChange={(e) => onChange(question.id, e.target.value)}
                aria-describedby={`${question.context_hint ? `${champ}-conseil ` : ""}${champ}-compteur`}
                className="w-full rounded-[3px] border border-systeme-lueur/40 bg-white p-3 text-base text-slate-900 focus:border-systeme-lueur focus:ring-2 focus:ring-systeme-lueur/40 focus:outline-none read-only:opacity-70"
              />
              <p id={`${champ}-compteur`} className="text-xs text-systeme-attenue tabular-nums">
                {nombre(n)} / {nombre(LONGUEUR_MAX_MOTIVATION)} caractères
                {n < LONGUEUR_MIN_MOTIVATION ? `, ${LONGUEUR_MIN_MOTIVATION} au minimum` : ""}
              </p>
            </div>
          );
        })}
      </div>

      <Alerte message={erreur} />
      {envoi && (
        <p className="text-sm text-systeme-lueur" aria-live="polite">
          {envoi}
        </p>
      )}

      <div className="grid gap-2">
        <BoutonSysteme onClick={onEnvoyer} disabled={incompletes > 0} chargement={!!envoi} className="justify-self-start">
          {libelleEnvoi}
        </BoutonSysteme>
        {incompletes > 0 && (
          <p className="text-sm text-systeme-attenue">
            Encore {incompletes} réponse{incompletes > 1 ? "s" : ""} à compléter ({LONGUEUR_MIN_MOTIVATION} caractères au minimum).
          </p>
        )}
      </div>
    </div>
  );
}
