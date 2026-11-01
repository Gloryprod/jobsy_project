"use client";

import { Certificat } from "../../boss/Certificat";

interface CertifiedScreenProps {
  courseId: string;
  courseTitle: string;
  certificateHash: string;
}

/** Le certificat d'une formation réussie, refait au lot 3b-B de la refonte : voir components/dashboardCandidat/boss. */
export default function CertifiedScreen({ courseId, courseTitle, certificateHash }: CertifiedScreenProps) {
  return <Certificat courseId={courseId} courseTitle={courseTitle} certificateHash={certificateHash} />;
}
