import { Check, FileText, Lock, PlayCircle, Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Capsule, Section } from "./types";

type Props = {
  sections: Section[];
  courante: string | null;
  /** L'étape est ouverte : la première, une étape déjà faite, ou celle qui suit une étape faite */
  ouverte: (capsule: Capsule) => boolean;
  onChoisir: (capsule: Capsule) => void;
};

/** Durée d'une leçon, ou nombre de questions d'un quiz accordé (l'API écrit « 1 questions ») */
function duree(capsule: Capsule): string {
  if (capsule.type !== "qcm") return capsule.duration;
  const n = capsule.questions?.length ?? 0;
  return `${n} question${n > 1 ? "s" : ""}`;
}

function Icone({ capsule, ouverte }: { capsule: Capsule; ouverte: boolean }) {
  const classe = "size-4 shrink-0";
  if (capsule.is_completed) return <Check aria-hidden="true" className={cn(classe, "text-systeme-lueur")} />;
  if (!ouverte) return <Lock aria-hidden="true" className={cn(classe, "text-systeme-attenue")} />;
  if (capsule.type === "qcm") return <Swords aria-hidden="true" className={cn(classe, "text-systeme-or")} />;
  if (capsule.type === "video") return <PlayCircle aria-hidden="true" className={cn(classe, "text-systeme-texte")} />;
  return <FileText aria-hidden="true" className={cn(classe, "text-systeme-texte")} />;
}

/**
 * Le plan des salles à côté de la leçon : un bouton par étape, avec son état écrit en toutes lettres.
 * Une étape fermée reste atteignable au clavier : la choisir explique ce qu'il faut terminer avant.
 */
export function PlanSalles({ sections, courante, ouverte, onChoisir }: Props) {
  return (
    <nav aria-label="Plan des salles" className="grid gap-5 rounded-[4px] bg-systeme-nuit p-4 text-systeme-texte">
      {sections.map((section, index) => (
        <div key={section.id} className="grid gap-2">
          <h3 className="font-systeme text-sm font-bold text-systeme-lueur">
            Salle {index + 1} : {section.title}
          </h3>
          <ul className="grid gap-1">
            {section.capsules.map((capsule) => {
              const estOuverte = ouverte(capsule);
              const choisie = capsule.id === courante;
              const etat = capsule.is_completed ? "terminée" : estOuverte ? "ouverte" : "fermée";
              return (
                <li key={capsule.id}>
                  <button
                    type="button"
                    onClick={() => onChoisir(capsule)}
                    aria-current={choisie ? "step" : undefined}
                    aria-disabled={!estOuverte || undefined}
                    className={cn(
                      "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-[3px] border px-3 py-2 text-left text-sm transition-colors",
                      "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur",
                      choisie ? "border-systeme-lueur bg-systeme-lueur/15" : "border-transparent hover:bg-systeme-lueur/10",
                      !estOuverte && "cursor-not-allowed text-systeme-attenue",
                    )}
                  >
                    <Icone capsule={capsule} ouverte={estOuverte} />
                    <span className="min-w-0 flex-1 break-words">{capsule.type === "qcm" ? "Combat : le quiz" : capsule.title}</span>
                    <span className="shrink-0 text-xs text-systeme-attenue">{duree(capsule)}</span>
                    <span className="sr-only">, {etat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
