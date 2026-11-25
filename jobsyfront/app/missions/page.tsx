import type { Metadata } from "next";
import { CadrePublic } from "@/components/public/CadrePublic";
import { MissionsPubliques } from "@/components/public/MissionsPubliques";

export const metadata: Metadata = { title: "Missions ouvertes | Jobsy" };

// Page publique refaite au lot 8e : contenu réel (API), aucun chiffre inventé (D38)
export default function Page() {
  return (
    <CadrePublic
      etiquette="Portails"
      titre="Les missions ouvertes"
      intro={<p className="text-lg text-systeme-texte">Les dernières missions publiées par les entreprises. Pour postuler, créez votre compte : votre rang et une courte épreuve d&apos;entrée vous ouvrent les missions. Une fois connecté, vous voyez toutes celles de votre rang.</p>}
    >
      <MissionsPubliques />
    </CadrePublic>
  );
}
