"use client";

import { ProjetPratique } from "../../projet/ProjetPratique";

interface FinalExamProjectPlayProps {
  courseId: string;
  courseTitle?: string;
  can_retry: boolean;
  time_remaining: number | 0;
  attempts_count: number | 0;
  is_permanently_blocked: boolean;
  onBackToCourse?: () => void;
  onMutate?: () => unknown;
}

/** Le projet pratique des formations Expert, refait au lot 3b-B2 de la refonte : voir components/dashboardCandidat/projet. */
export default function FinalExamProjectPlay({ courseId, courseTitle, can_retry, is_permanently_blocked, onMutate }: FinalExamProjectPlayProps) {
  return <ProjetPratique courseId={courseId} courseTitle={courseTitle} peutRetenter={can_retry} bloque={is_permanently_blocked} onMiseAJour={onMutate} />;
}
