import Link from "next/link";
import type { ReactNode } from "react";
import { FenetreSysteme } from "@/components/systeme";
import { CadrePublic, SECTION, TITRE_SECTION } from "./CadrePublic";

const LIEN = "font-bold text-systeme-lueur underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-systeme-lueur";
// Sur le fond blanc des questions, le cyan manquerait de contraste
const LIEN_CLAIR = "font-bold text-[#000080] underline underline-offset-2 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

// Réponses tirées du fonctionnement réel de l'application (inscription, WalletService, retraits) : rien d'inventé (D38)
const QUESTIONS: { question: string; reponse: ReactNode }[] = [
  {
    question: "Comment créer un compte ?",
    reponse: (
      <>
        Choisissez{" "}
        <Link href="/register" className={LIEN_CLAIR}>
          « Je cherche des missions » ou « Je recrute »
        </Link>
        , puis indiquez votre nom, votre adresse e-mail et un mot de passe. Un e-mail de confirmation active votre compte.
      </>
    ),
  },
  {
    question: "Combien coûte Jobsy ?",
    reponse: "Rien pour les jeunes : l'inscription et les formations sont gratuites. Les entreprises fixent la récompense de chaque mission, et Jobsy en retient 10 % au moment du paiement.",
  },
  {
    question: "Comment suis-je payé après une mission ?",
    reponse:
      "L'entreprise bloque la récompense avant votre prise de service. Une fois votre travail validé, elle arrive dans votre Trésor, moins 10 % de commission. Vous la retirez ensuite par Mobile Money.",
  },
  {
    question: "Je n'ai pas d'expérience. Puis-je postuler ?",
    reponse:
      "Oui. Votre rang de départ vient de votre CV, et les missions ouvertes à tous les rangs vous sont accessibles dès le début. Chaque formation réussie et chaque mission validée vous font monter en rang.",
  },
  {
    question: "J'ai oublié mon mot de passe.",
    reponse: (
      <>
        Demandez un{" "}
        <Link href="/forgot-password" className={LIEN_CLAIR}>
          lien de réinitialisation
        </Link>{" "}
        : il arrive par e-mail.
      </>
    ),
  },
];

/** La page Contact (lot 8e) : aucune coordonnée tant que l'équipe n'a pas fourni les vraies (D38), et les réponses aux questions fréquentes. */
export function PageContact() {
  return (
    <CadrePublic
      etiquette="Système"
      titre="Nous contacter"
      intro={<p className="text-lg text-systeme-texte">Une question sur Jobsy ? Les réponses aux questions les plus fréquentes sont ci-dessous.</p>}
    >
      <section aria-labelledby="contact-equipe" className={SECTION}>
        <h2 id="contact-equipe" className={TITRE_SECTION}>
          Joindre l&apos;équipe
        </h2>
        <FenetreSysteme etiquette="Bientôt" balayage={false} className="max-w-3xl">
          <p className="text-systeme-texte">Les coordonnées de l&apos;équipe Jobsy (téléphone, WhatsApp, adresse) seront publiées ici dès qu&apos;elles seront confirmées.</p>
          <p className="text-systeme-texte">
            En attendant, vous pouvez{" "}
            <Link href="/register" className={LIEN}>
              créer un compte
            </Link>
            ,{" "}
            <Link href="/login" className={LIEN}>
              vous connecter
            </Link>{" "}
            ou découvrir{" "}
            <Link href="/entreprises" className={LIEN}>
              comment recruter avec Jobsy
            </Link>
            .
          </p>
        </FenetreSysteme>
      </section>

      <section aria-labelledby="contact-questions" className={`${SECTION} pb-20`}>
        <h2 id="contact-questions" className={TITRE_SECTION}>
          Questions fréquentes
        </h2>
        <div className="grid max-w-3xl gap-3">
          {QUESTIONS.map((q) => (
            <details key={q.question} className="group rounded-2xl border border-systeme-lueur/30 bg-white px-5 text-slate-900">
              <summary className="flex min-h-12 cursor-pointer items-center justify-between gap-3 py-3 font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]">
                {q.question}
                <span aria-hidden="true" className="text-[#000080] transition-transform group-open:rotate-180 motion-reduce:transition-none">
                  ▾
                </span>
              </summary>
              <p className="pb-4 text-slate-700">{q.reponse}</p>
            </details>
          ))}
        </div>
      </section>
    </CadrePublic>
  );
}
