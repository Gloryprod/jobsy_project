import type { Metadata } from "next";
import {
  BarreProgression,
  BoutonSysteme,
  EmblemeRang,
  FenetreSysteme,
  LienSysteme,
  LignesValeurs,
  MessageSysteme,
} from "@/components/systeme";
import { RANGS_PAR_DEFAUT, formaterXp, progressionVersRangSuivant } from "@/lib/progression";
import { ExempleInvitation } from "./ExempleInvitation";

export const metadata: Metadata = {
  title: "Kit du Système | Jobsy",
  robots: { index: false, follow: false },
};

const fcfa = (montant: number) => `${montant.toLocaleString("fr-FR")} FCFA`;

// Scores d'exemple passés au vrai calcul de lib/progression.ts
const EXEMPLES_PROGRESSION: [number, string][] = [
  [0, "E"],
  [460, "D"],
  [2999, "B"],
  [5200, "S"],
];

function Section({ titre, description, children }: { titre: string; description: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-1">
        <h2 className="font-systeme text-2xl font-bold text-[#000080]">{titre}</h2>
        <p className="max-w-[65ch] text-[#545A78]">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function KitSystemePage() {
  const ayaba = progressionVersRangSuivant(460, "D");

  return (
    <main className="min-h-dvh bg-[#F4F5FA] px-4 py-10 font-lisible text-[#151936] sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-14">
        <header className="grid gap-3">
          <h1 className="font-systeme text-4xl font-extrabold text-[#000080] sm:text-5xl">Kit du Système</h1>
          <p className="max-w-[65ch] text-lg text-[#545A78]">
            Page interne de la refonte gamifiée : chaque composant, rempli d&apos;exemples fictifs. Le plan est dans{" "}
            <code className="rounded bg-[#E6E8F3] px-1.5 py-0.5 text-[0.9em]">plans/pending/refonte-gamifiee.md</code>. Cette page n&apos;est pas
            indexée par les moteurs de recherche.
          </p>
        </header>

        <Section
          titre="Fenêtre de statut"
          description="Une composition du kit : emblème de rang, progression vers le rang suivant et chiffres d'activité. Sur le vrai tableau de bord, chaque valeur viendra de l'API."
        >
          <div className="max-w-xl">
            <FenetreSysteme etiquette="Statut">
              <div className="flex items-center gap-4">
                <EmblemeRang rang={ayaba.actuel.rank} couleur={ayaba.actuel.code_hexa} taille="lg" />
                <div className="min-w-0">
                  <p className="font-systeme text-xl font-bold">Ayaba H.</p>
                  <p className="text-systeme-attenue">Classe : logistique et inventaire</p>
                </div>
              </div>
              {ayaba.suivant && (
                <BarreProgression
                  libelle={`Vers le rang ${ayaba.suivant.rank}`}
                  valeur={ayaba.xp}
                  min={ayaba.actuel.points}
                  max={ayaba.suivant.points}
                  detail={`${formaterXp(ayaba.xp)} sur ${formaterXp(ayaba.suivant.points)}`}
                />
              )}
              <LignesValeurs
                lignes={[
                  { libelle: "Missions validées", valeur: 2 },
                  { libelle: "Formations certifiées", valeur: 1 },
                  { libelle: "Jours actifs de suite", valeur: 4 },
                ]}
              />
            </FenetreSysteme>
          </div>
        </Section>

        <Section
          titre="Progression vers le rang suivant"
          description="Le calcul réel de lib/progression.ts, appliqué à quatre scores. La barre mesure la distance entre le seuil du rang actuel et celui du rang suivant."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {EXEMPLES_PROGRESSION.map(([xp, rang]) => {
              const p = progressionVersRangSuivant(xp, rang);
              return (
                <FenetreSysteme key={xp} etiquette={`Score ${formaterXp(xp)}`} balayage={false} className="p-4">
                  <div className="flex items-center gap-3">
                    <EmblemeRang rang={p.actuel.rank} couleur={p.actuel.code_hexa} taille="sm" />
                    <BarreProgression
                      className="min-w-0 flex-1"
                      libelle={p.suivant ? `Vers le rang ${p.suivant.rank}` : "Rang maximal atteint"}
                      valeur={p.xp}
                      min={p.actuel.points}
                      max={p.suivant?.points ?? p.actuel.points}
                      detail={p.suivant ? `il manque ${formaterXp(p.manque)}` : formaterXp(p.xp)}
                    />
                  </div>
                </FenetreSysteme>
              );
            })}
          </div>
        </Section>

        <Section
          titre="Emblèmes de rang"
          description="Les six rangs et leurs seuils, tels qu'ils sont en base. La couleur vient de ranks.code_hexa quand l'API la fournit."
        >
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {RANGS_PAR_DEFAUT.map((rang) => (
              <li key={rang.rank} className="grid justify-items-center gap-2 rounded-xl border border-[#D9DCEA] bg-white px-2 py-4 text-center">
                <EmblemeRang rang={rang.rank} couleur={rang.code_hexa} />
                <span className="font-semibold tabular-nums">{formaterXp(rang.points)}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          titre="Messages du Système"
          description="Trois tons : information, récompense, alerte. Le compte à rebours n'apparaît que pour un vrai délai venant de l'API."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <ExempleInvitation />
            <MessageSysteme etiquette="Récompense" ton="recompense" titre="Récompense libérée">
              <p>
                La guilde a validé ta quête : <strong className="text-systeme-or">{fcfa(45000)}</strong> et{" "}
                <strong className="text-systeme-or">+250 XP</strong> sont ajoutés à ton trésor.
              </p>
            </MessageSysteme>
            <MessageSysteme
              etiquette="Vitalité"
              ton="alerte"
              titre="Ta vitalité baisse"
              actions={<LienSysteme href="#" variante="contour">Faire la révision</LienSysteme>}
            >
              <p>
                Ta vitalité est à 60. Une révision de 5 questions la remet à 100. Elle ne bloque aucune de tes candidatures.
              </p>
            </MessageSysteme>
          </div>
        </Section>

        <Section titre="Boutons" description="44 pixels de haut au minimum. Le bouton en chargement se désactive pour éviter un double envoi.">
          <div className="max-w-xl">
            <FenetreSysteme etiquette="Actions" balayage={false}>
              <div className="flex flex-wrap gap-3">
                <BoutonSysteme>Accepter la quête</BoutonSysteme>
                <BoutonSysteme variante="contour">Voir le détail</BoutonSysteme>
                <BoutonSysteme chargement>Envoi en cours</BoutonSysteme>
                <BoutonSysteme disabled>Portail verrouillé</BoutonSysteme>
              </div>
            </FenetreSysteme>
          </div>
        </Section>
      </div>
    </main>
  );
}
