import Link from "next/link";
import { EmblemeRang, FenetreSysteme, LienSysteme } from "@/components/systeme";
import { RANGS_PAR_DEFAUT, formaterXp } from "@/lib/progression";
import { DernieresMissions } from "./DernieresMissions";

// Chaque étape décrit ce que l'application fait déjà : aucun chiffre ni promesse qui ne vienne pas du code (décision D38).
const ETAPES = [
  {
    nom: "L'Éveil",
    texte: "Créez votre compte et déposez votre CV. Le Système l'analyse et vous attribue votre rang de départ.",
  },
  {
    nom: "Les donjons",
    texte: "Suivez des formations en ligne : leçons, quiz, puis examen final. Chaque formation réussie rapporte de l'XP et un certificat vérifiable.",
  },
  {
    nom: "Les portails",
    texte: "Postulez aux missions ouvertes à votre rang. Une courte épreuve d'entrée montre à l'entreprise ce que vous savez faire.",
  },
  {
    nom: "Le Trésor",
    texte: "L'entreprise met la récompense sous séquestre. Elle vous est versée quand la mission est validée, puis vous la retirez par Mobile Money.",
  },
];

// Partagé avec la page publique des entreprises (lot 8e)
export const ETAPES_ENTREPRISE = [
  "Publiez une mission : récompense, durée et rang minimum.",
  "Recevez des candidats classés par rang et par score à l'épreuve d'entrée.",
  "Invitez directement les profils qui vous intéressent.",
  "Déposez la récompense par KkiaPay : elle n'est versée qu'à la validation de la mission.",
];

const SECTION = "mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6";
const TITRE_SECTION = "font-systeme text-2xl font-bold text-balance sm:text-3xl";

/** L'accueil public (lot 6b) : « Le Système recrute », le jeu en quatre étapes, les rangs, les missions ouvertes et l'entrée entreprise. */
export function Accueil() {
  return (
    <main id="contenu" tabIndex={-1} className="focus:outline-none bg-systeme-nuit bg-[radial-gradient(ellipse_at_top,rgba(86,216,255,0.12),transparent_55%)] pt-20 font-lisible text-systeme-texte">
      <section aria-labelledby="accueil-titre" className="mx-auto grid max-w-3xl px-4 py-12 sm:px-6 sm:py-20">
        <FenetreSysteme etiquette="Système" className="gap-5 p-6 sm:p-8">
          <h1 id="accueil-titre" className="font-systeme text-4xl font-black text-balance sm:text-5xl">
            Le Système recrute.
          </h1>
          <p className="text-lg text-systeme-texte">
            Jobsy aide les jeunes du Bénin à décrocher leurs premières missions rémunérées. Formez-vous, montez en rang, et les entreprises peuvent vous
            inviter sur leurs missions.
          </p>
          <div className="flex flex-wrap gap-3">
            <LienSysteme href="/register/candidats">Je cherche des missions</LienSysteme>
            <LienSysteme href="/register/entreprises" variante="contour">
              Je recrute
            </LienSysteme>
          </div>
          <p className="text-sm text-systeme-attenue">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-bold text-systeme-lueur underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </FenetreSysteme>
      </section>

      <section aria-labelledby="accueil-etapes" className={SECTION}>
        <h2 id="accueil-etapes" className={TITRE_SECTION}>
          Comment ça marche
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES.map((etape, i) => (
            <li key={etape.nom} className="grid">
              <FenetreSysteme etiquette={`Étape ${i + 1}`} titre={etape.nom} niveauTitre={3} balayage={false}>
                <p className="text-systeme-texte">{etape.texte}</p>
              </FenetreSysteme>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="accueil-rangs" className={SECTION}>
        <div className="grid gap-2">
          <h2 id="accueil-rangs" className={TITRE_SECTION}>
            Six rangs, de E à S
          </h2>
          <p className="max-w-3xl text-systeme-attenue">
            Votre diplôme fixe votre rang de départ. Ensuite, l&apos;XP gagnée en formation et en mission vous fait monter. Plus votre rang est haut,
            plus de portails s&apos;ouvrent.
          </p>
        </div>
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {RANGS_PAR_DEFAUT.map((rang) => (
            <li key={rang.rank} className="flex items-center gap-3 rounded-lg border border-white/10 bg-systeme-panneau p-3">
              <EmblemeRang rang={rang.rank} couleur={rang.code_hexa} />
              <span className="grid text-sm">
                <span className="font-bold">{rang.label?.split(" - ")[1] ?? `Rang ${rang.rank}`}</span>
                <span className="text-systeme-attenue">{rang.points === 0 ? "Départ" : `Dès ${formaterXp(rang.points)}`}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="accueil-missions" className={SECTION}>
        <h2 id="accueil-missions" className={TITRE_SECTION}>
          Les dernières missions ouvertes
        </h2>
        <DernieresMissions />
      </section>

      <section className={`${SECTION} pb-20`}>
        <FenetreSysteme etiquette="Guilde" titre="Vous recrutez ?" niveauTitre={2} balayage={false} className="gap-4 p-6 sm:p-8">
          <ul className="grid gap-2 text-systeme-texte">
            {ETAPES_ENTREPRISE.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden="true" className="text-systeme-lueur">
                  ▸
                </span>
                {point}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <LienSysteme href="/register/entreprises">Créer le compte de votre entreprise</LienSysteme>
            <LienSysteme href="/entreprises" variante="contour">
              En savoir plus
            </LienSysteme>
          </div>
        </FenetreSysteme>
      </section>
    </main>
  );
}
