import { FenetreSysteme, LienSysteme } from "@/components/systeme";
import { ETAPES_ENTREPRISE } from "@/components/accueil/Accueil";
import { CadrePublic, SECTION, TITRE_SECTION } from "./CadrePublic";

// Chaque phrase décrit ce que l'application fait déjà (WalletService, MissionTrackingController) : rien d'inventé (D38)
const COUT = [
  "La création du compte et la publication des missions sont gratuites.",
  "Vous fixez la récompense de chaque mission. Avant la prise de service, elle est bloquée sur votre solde Jobsy, rechargé par KkiaPay (Mobile Money ou carte).",
  "À la validation du travail, le candidat reçoit la récompense, moins 10 % de commission retenue par Jobsy.",
];

const GARANTIES = [
  "Tant que vous n'avez pas validé le travail, la récompense reste bloquée : elle n'est pas versée.",
  "Si vous ne retenez pas le candidat à sa prise de service, la récompense bloquée revient sur votre solde.",
  "Vous voyez le rang de chaque candidat, son score à l'épreuve d'entrée et ses compétences. Ses coordonnées s'affichent dès qu'il postule ou accepte votre invitation.",
];

/** La page publique des entreprises (lot 8e) : le fonctionnement, le coût et les garanties tels que le code les applique. */
export function PageEntreprises() {
  return (
    <CadrePublic
      etiquette="Guilde"
      titre="Recrutez des jeunes formés, mission par mission."
      intro={
        <>
          <p className="text-lg text-systeme-texte">
            Publiez une mission, recevez des candidats classés par rang et par épreuve d&apos;entrée, et ne versez la récompense qu&apos;une fois le
            travail validé.
          </p>
          <div className="flex flex-wrap gap-3">
            <LienSysteme href="/register/entreprises">Créer un compte entreprise</LienSysteme>
            <LienSysteme href="/login" variante="contour">
              Se connecter
            </LienSysteme>
          </div>
        </>
      }
    >
      <section aria-labelledby="entreprises-etapes" className={SECTION}>
        <h2 id="entreprises-etapes" className={TITRE_SECTION}>
          Comment ça marche
        </h2>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES_ENTREPRISE.map((etape, i) => (
            <li key={etape} className="grid">
              <FenetreSysteme etiquette={`Étape ${i + 1}`} balayage={false}>
                <p className="text-systeme-texte">{etape}</p>
              </FenetreSysteme>
            </li>
          ))}
        </ol>
      </section>

      <div className={`${SECTION} md:grid-cols-2`}>
        {[
          { id: "entreprises-cout", titre: "Ce que ça coûte", points: COUT },
          { id: "entreprises-garanties", titre: "Vos garanties", points: GARANTIES },
        ].map((bloc) => (
          <section key={bloc.id} aria-labelledby={bloc.id} className="grid content-start gap-4">
            <h2 id={bloc.id} className={TITRE_SECTION}>
              {bloc.titre}
            </h2>
            <ul className="grid gap-3">
              {bloc.points.map((point) => (
                <li key={point} className="rounded-2xl border border-systeme-lueur/30 bg-white p-4 text-slate-900">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <section aria-labelledby="entreprises-fin" className={`${SECTION} pb-20`}>
        <h2 id="entreprises-fin" className={TITRE_SECTION}>
          Prêt à publier votre première mission ?
        </h2>
        <div className="flex flex-wrap gap-3">
          <LienSysteme href="/register/entreprises">Créer un compte entreprise</LienSysteme>
          <LienSysteme href="/contact" variante="contour">
            Une question ?
          </LienSysteme>
        </div>
      </section>
    </CadrePublic>
  );
}
