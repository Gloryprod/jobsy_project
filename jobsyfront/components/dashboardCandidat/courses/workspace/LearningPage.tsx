"use client";

import { EcranSalle } from "../../salles/EcranSalle";
import type { Capsule, Section } from "../../salles/types";

interface LearningPageProps {
  courseId: string;
  courseTitle: string;
  progress_percentage: number;
  sections: Section[];
  capsuleCurrent: Capsule | null;
  allCapsulesOrdered: Capsule[];
  validation_mode: string;
  /** Seuil de réussite des quiz renvoyé par l'API */
  quiz_passing_score?: number | null;
  /** Affichée sous l'écran du boss, pendant le délai après un échec */
  revision?: boolean;
  onMutate: () => unknown;
}

/** Les salles d'une formation (leçons et quiz), refaites au lot 3b de la refonte : voir components/dashboardCandidat/salles. */
export default function LearningPage({
  capsuleCurrent,
  allCapsulesOrdered,
  courseId,
  onMutate,
  courseTitle,
  progress_percentage,
  sections,
  validation_mode,
  quiz_passing_score,
  revision,
}: LearningPageProps) {
  return (
    <EcranSalle
      courseId={courseId}
      courseTitle={courseTitle}
      validationMode={validation_mode}
      progression={progress_percentage}
      sections={sections}
      etapes={allCapsulesOrdered}
      etapeInitiale={capsuleCurrent}
      seuilQuiz={quiz_passing_score ?? null}
      revision={revision}
      onMiseAJour={async () => {
        await onMutate();
      }}
    />
  );
}
