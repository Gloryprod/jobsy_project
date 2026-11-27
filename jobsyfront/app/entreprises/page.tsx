import type { Metadata } from "next";
import { PageEntreprises } from "@/components/public/PageEntreprises";

export const metadata: Metadata = { title: "Recruter avec Jobsy" };

// Page publique refaite au lot 8e : aucun chiffre, témoignage ni numéro inventé (D38)
export default function Page() {
  return <PageEntreprises />;
}
