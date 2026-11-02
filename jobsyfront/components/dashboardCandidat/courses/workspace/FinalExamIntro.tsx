"use client";

import { BossExamen } from "../../boss/BossExamen";

interface IntroProps {
  courseId: string;
  courseTitle: string;
  onExamFinished: () => unknown;
}

/** L'examen final en QCM, refait au lot 3b-B de la refonte : voir components/dashboardCandidat/boss. */
export default function FinalExamIntro({ courseId, courseTitle, onExamFinished }: IntroProps) {
  return <BossExamen courseId={courseId} courseTitle={courseTitle} onTermine={onExamFinished} />;
}
