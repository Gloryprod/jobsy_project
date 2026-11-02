import { Check } from "lucide-react";
import type { QuestionQuiz } from "./types";

export type Reponses = Record<number, string[]>;

/** Choisit une option : remplace la réponse d'une question à choix unique, ajoute ou retire pour un choix multiple. */
export function basculerReponse(reponses: Reponses, questionId: number, option: string, multiple: boolean): Reponses {
  const actuelles = reponses[questionId] ?? [];
  if (!multiple) return { ...reponses, [questionId]: [option] };
  return { ...reponses, [questionId]: actuelles.includes(option) ? actuelles.filter((o) => o !== option) : [...actuelles, option] };
}

/** Questions auxquelles au moins une réponse est cochée (une question entièrement décochée ne compte pas). */
export const nombreRepondues = (questions: QuestionQuiz[], reponses: Reponses) => questions.filter((q) => (reponses[q.id]?.length ?? 0) > 0).length;

type Props = {
  questions: QuestionQuiz[];
  reponses: Reponses;
  onChange: (questionId: number, option: string, multiple: boolean) => void;
  /** Réponses figées (résultat affiché) */
  verrouille?: boolean;
  /** Bonnes réponses, montrées seulement après une réussite */
  corrections?: Record<number, { correct_answers?: string[] }>;
};

/**
 * Questions d'un combat ou de l'examen final : chaque question annonce un choix unique (boutons radio)
 * ou multiple (cases à cocher), car la notation en dépend.
 */
export function ListeQuestions({ questions, reponses, onChange, verrouille = false, corrections = {} }: Props) {
  return (
    <div className="grid gap-4">
      {questions.map((question, index) => {
        const multiple = !!question.is_multiple;
        const choisies = reponses[question.id] ?? [];
        const correction = corrections[question.id];
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
                      onChange={() => onChange(question.id, option, multiple)}
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
  );
}
