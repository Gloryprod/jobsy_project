"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate as mettreAJourCache } from "swr";
import { ArrowLeft } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { BarreProgression, BoutonSysteme, FenetreSysteme, LienSysteme, LignesValeurs } from "@/components/systeme";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import { Alerte } from "../epreuve/Alerte";
import { PastilleStatut } from "../qg/CarteRealite";
import { ICONES_TYPE } from "./CarteDonjonCatalogue";
import { PlanDonjon } from "./PlanDonjon";
import { actionDonjon, etatDonjon, formaterDuree, lienEspace, POURCENT, salleFranchie, typeDonjon } from "./regles";
import type { CarteFormation } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

/**
 * La carte d'un donjon (formation) : ce qu'il demande, ce qu'il rapporte, le plan des salles et du boss,
 * et l'action utile. Entrer inscrit le candidat puis l'emmène dans l'espace de formation.
 */
export function CarteDonjon({ formationId }: { formationId: string }) {
  const router = useRouter();
  const carte = useSWR<CarteFormation>(`/get_modules/${formationId}`, lireDonnees);
  const [entree, setEntree] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const retour = (
    <Link
      href="/dashboard/candidats/formations"
      className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Retour aux formations
    </Link>
  );

  if (carte.isLoading) return <SqueletteCarte />;

  const c = carte.data;
  if (carte.error || !c) {
    const introuvable = statutErreur(carte.error) === 404;
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
        {retour}
        <FenetreSysteme etiquette="Système" titre={introuvable ? "Formation introuvable" : "La formation n'a pas pu se charger"} ton="alerte" balayage={false}>
          <p className="text-systeme-attenue">
            {introuvable ? "Cette formation n'existe pas ou n'est plus proposée." : "Vérifie ta connexion internet, puis réessaie."}
          </p>
          {introuvable ? (
            <LienSysteme href="/dashboard/candidats/formations" className="justify-self-start">
              Voir les formations
            </LienSysteme>
          ) : (
            <BoutonSysteme onClick={() => carte.mutate()} className="justify-self-start">
              Réessayer
            </BoutonSysteme>
          )}
        </FenetreSysteme>
      </div>
    );
  }

  const { course, enrollment, modules } = c;
  const type = typeDonjon(course);
  const etat = etatDonjon(enrollment);
  const action = actionDonjon(enrollment);
  const Icone = ICONES_TYPE[type.cle];
  const duree = formaterDuree(modules.reduce((total, m) => total + m.duration_minutes, 0));
  const franchies = modules.filter(salleFranchie).length;
  // Une formation désactivée reste visible pour ses inscrits, mais on ne peut plus y entrer
  const fermee = !enrollment && !course.is_active;

  const entrer = async () => {
    setEntree(true);
    setErreur(null);
    try {
      await api.post(`/candidat/formations/${course.id}/enroll`);
      // Le catalogue et le QG affichent aussitôt la nouvelle inscription
      void mettreAJourCache("/open/courses");
      void mettreAJourCache("/courses/my-learnings");
      router.push(lienEspace(course.id));
    } catch (e) {
      setErreur(messageErreur(e, "L'inscription n'a pas pu être enregistrée. Réessaie."));
      setEntree(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      {retour}

      <header className="grid gap-1">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[#000080]">
          <Icone aria-hidden="true" className="size-4" />
          Donjon {type.nom}
        </p>
        <h1 className="font-systeme text-3xl leading-tight font-bold text-balance text-[#000080]">{course.title}</h1>
        <p className="text-slate-600">{type.explication}</p>
      </header>

      <FenetreSysteme etiquette={`Donjon ${type.nom}`} titre={enrollment ? "Ton avancement" : "Avant d'entrer"} niveauTitre={2} className="gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <PastilleStatut ton={etat.ton}>{etat.libelle}</PastilleStatut>
          {enrollment && modules.length > 0 && (
            <span className="text-sm text-systeme-attenue">
              Salles franchies : {franchies} sur {modules.length}
            </span>
          )}
        </div>

        {etat.cle === "en_cours" && etat.progression !== null && (
          <BarreProgression libelle="Progression dans le donjon" valeur={etat.progression} max={100} detail={`${etat.progression}${POURCENT}`} />
        )}

        <LignesValeurs
          lignes={[
            { libelle: "Salles", valeur: String(modules.length) },
            ...(duree ? [{ libelle: "Durée des leçons", valeur: duree }] : []),
            { libelle: "Boss", valeur: type.boss === "project" ? "Projet pratique" : "Examen final" },
            { libelle: "Récompense", valeur: `+${course.reward_xp ?? 0} XP`, ton: "or" as const },
            ...(course.reward_asset ? [{ libelle: "Badge", valeur: course.reward_asset, ton: "or" as const }] : []),
          ]}
        />

        {!enrollment && type.avecKit && !fermee && (
          <p className="text-systeme-attenue">
            Ce donjon demande un kit de matériel : en entrant, tu lances sa préparation. Les salles s&apos;ouvrent une fois le kit livré.
          </p>
        )}
        {fermee && <p className="text-systeme-attenue">Cette formation n&apos;accepte plus de nouvelles inscriptions.</p>}

        <Alerte message={erreur} />

        {!fermee &&
          (action.inscription ? (
            <BoutonSysteme onClick={entrer} chargement={entree} className="justify-self-start">
              {action.libelle}
            </BoutonSysteme>
          ) : (
            <LienSysteme href={lienEspace(course.id)} className="justify-self-start">
              {action.libelle}
            </LienSysteme>
          ))}
      </FenetreSysteme>

      <section aria-labelledby="plan-du-donjon" className="grid gap-4">
        <h2 id="plan-du-donjon" className="font-systeme text-xl font-bold text-[#000080]">
          Plan du donjon
        </h2>
        <div className="rounded-[4px] bg-systeme-nuit p-5 text-systeme-texte">
          {modules.length === 0 ? (
            <p className="text-systeme-attenue">Les salles de ce donjon sont en préparation.</p>
          ) : (
            <PlanDonjon carte={c} />
          )}
        </div>
      </section>

      {((course.delivered_skills?.length ?? 0) > 0 || course.description) && (
        <section aria-labelledby="a-propos" className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="a-propos" className="font-systeme text-xl font-bold text-[#000080]">
            À propos de cette formation
          </h2>
          {course.description && <SafeHtml as="div" className={`leading-relaxed text-slate-700 ${CLASSES_TEXTE_RICHE}`} html={course.description} />}
          {(course.delivered_skills?.length ?? 0) > 0 && (
            <div className="grid gap-2">
              <h3 className="font-bold">Compétences validées par le certificat</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {course.delivered_skills!.map((competence) => (
                  <li key={competence} className="rounded-md bg-slate-100 px-2 py-1">
                    {competence}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SqueletteCarte() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement de la formation">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-56 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
      <div className="h-80 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
    </div>
  );
}
