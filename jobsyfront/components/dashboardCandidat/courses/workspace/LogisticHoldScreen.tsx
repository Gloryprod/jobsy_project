"use client";

import { AttenteKit } from "../../boss/AttenteKit";

interface LogisticHoldScreenProps {
  enrollment_id: number;
  delivery_status: "pending" | "delivered";
  /** Toujours « kit » aujourd'hui (FormationLogistiqueDetail) ; la session en présentiel n'est pas encore en place */
  logistic_type: "kit" | "session";
  course_title: string;
  courseId?: string;
  onRefresh: () => unknown;
}

/** L'attente du kit de matériel, refaite au lot 3b-B de la refonte : voir components/dashboardCandidat/boss. */
export default function LogisticHoldScreen({ enrollment_id, delivery_status, course_title, courseId, onRefresh }: LogisticHoldScreenProps) {
  return (
    <AttenteKit
      courseId={courseId}
      courseTitle={course_title}
      enrollmentId={enrollment_id}
      deliveryStatus={delivery_status}
      onActualiser={async () => {
        await onRefresh();
      }}
    />
  );
}
