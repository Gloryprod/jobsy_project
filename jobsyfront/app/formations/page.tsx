import type { Metadata } from "next";
import { CadrePublic } from "@/components/public/CadrePublic";
import { FormationsPubliques } from "@/components/public/FormationsPubliques";

export const metadata: Metadata = { title: "Formations | Jobsy" };

// Page publique refaite au lot 8e : contenu réel (API), aucun chiffre inventé (D38)
export default function Page() {
  return (
    <CadrePublic
      etiquette="Donjons"
      titre="Les formations"
      intro={<p className="text-lg text-systeme-texte">Des formations en ligne et gratuites pour apprendre un métier et monter en rang. Chacune se termine par un examen ou un projet, et donne un certificat que les entreprises vérifient sur Jobsy.</p>}
    >
      <FormationsPubliques />
    </CadrePublic>
  );
}
