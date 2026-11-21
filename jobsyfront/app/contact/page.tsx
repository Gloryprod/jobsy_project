import type { Metadata } from "next";
import { PageContact } from "@/components/public/PageContact";

export const metadata: Metadata = { title: "Nous contacter | Jobsy" };

// Page publique refaite au lot 8e : aucun chiffre, témoignage ni numéro inventé (D38)
export default function Page() {
  return <PageContact />;
}
