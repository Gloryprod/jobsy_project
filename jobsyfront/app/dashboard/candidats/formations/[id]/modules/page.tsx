"use client";

import { use } from "react";
import { CarteDonjon } from "@/components/dashboardCandidat/donjons/CarteDonjon";

// La carte du donjon : salles (modules), boss et trésor d'une formation (refonte gamifiée, lot 3a).
export default function ModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CarteDonjon formationId={id} />;
}
