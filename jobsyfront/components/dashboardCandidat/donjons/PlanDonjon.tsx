import type { ReactNode } from "react";
import { Check, Package, Swords, Trophy, X } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import { cn } from "@/lib/utils";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import { etatBoss, etatsSalles, formaterDuree, POURCENT, typeDonjon, type EtatSalle } from "./regles";
import type { CarteFormation, ExamenFinal } from "./types";

type Marque = "faite" | "courante" | "a_venir" | "neutre" | "echec";

const PASTILLES: Record<Marque, string> = {
  faite: "border-systeme-lueur bg-systeme-lueur text-systeme-nuit",
  courante: "border-systeme-or text-systeme-or shadow-[0_0_10px_rgba(240,230,140,0.45)]",
  a_venir: "border-systeme-attenue/50 text-systeme-attenue",
  neutre: "border-systeme-lueur/60 text-systeme-lueur",
  echec: "border-systeme-alerte text-systeme-alerte",
};

const MARQUE_SALLE: Record<EtatSalle, Marque> = { franchie: "faite", en_cours: "courante", a_venir: "a_venir", a_explorer: "neutre" };
const ETAT_SALLE: Record<EtatSalle, string | null> = { franchie: "Franchie", en_cours: "Salle en cours", a_venir: "À venir", a_explorer: null };

function Etape({
  marque,
  repere,
  titre,
  etat,
  courante,
  derniere,
  children,
}: {
  marque: Marque;
  repere: ReactNode;
  titre: string;
  etat: string | null;
  courante?: boolean;
  /** Dernière étape : pas de trait vers la suivante */
  derniere?: boolean;
  children?: ReactNode;
}) {
  return (
    <li aria-current={courante ? "step" : undefined} className="relative flex gap-3 pb-6 last:pb-0">
      {!derniere && <span aria-hidden="true" className="absolute top-8 bottom-1 left-[15px] w-px bg-systeme-lueur/30" />}
      <span aria-hidden="true" className={cn("grid size-8 shrink-0 place-items-center rounded-full border-2 font-systeme text-xs font-bold", PASTILLES[marque])}>
        {marque === "faite" ? <Check className="size-4" /> : marque === "echec" ? <X className="size-4" /> : repere}
      </span>
      <div className="grid min-w-0 flex-1 gap-1 pt-1">
        <h3 className={cn("leading-snug font-semibold text-balance", marque === "a_venir" ? "text-systeme-attenue" : "text-systeme-texte")}>{titre}</h3>
        {etat && (
          <p
            className={cn(
              "text-sm font-semibold",
              marque === "courante" ? "text-systeme-or" : marque === "echec" ? "text-systeme-alerte" : marque === "a_venir" ? "text-systeme-attenue" : "text-systeme-lueur",
            )}
          >
            {etat}
          </p>
        )}
        {children}
      </div>
    </li>
  );
}

function reglesBoss(examen: ExamenFinal): string {
  if (examen.type === "project") {
    const duree = formaterDuree(examen.time_limit_minutes);
    return [
      `Projet pratique${duree ? ` à rendre en ${duree}` : ""}${examen.passing_score ? `, note minimale de ${examen.passing_score}` : ""}.`,
      examen.max_attempts ? `${examen.max_attempts} tentatives au plus, avec ${examen.retry_delay_hours} h d'écart.` : null,
    ]
      .filter(Boolean)
      .join(" ");
  }
  const details = [
    examen.questions_count ? `${examen.questions_count} question${examen.questions_count > 1 ? "s" : ""}` : null,
    examen.passing_score ? `${examen.passing_score}${POURCENT} de bonnes réponses pour réussir` : null,
  ].filter(Boolean);
  return `Examen final en QCM${details.length ? ` : ${details.join(", ")}` : ""}. Après un échec, nouvelle tentative ${examen.retry_delay_hours} h plus tard.`;
}

const ETAT_BOSS = {
  a_explorer: { texte: null, marque: "neutre" },
  verrouille: { texte: "Se débloque quand toutes les salles sont franchies", marque: "a_venir" },
  pret: { texte: "Prêt à affronter", marque: "courante" },
  correction: { texte: "Projet rendu, en correction", marque: "courante" },
  vaincu: { texte: "Vaincu", marque: "faite" },
  echec: { texte: "Pas encore vaincu : l'espace de formation indique la suite", marque: "echec" },
} as const;

/**
 * Le plan du donjon : l'entrée (kit de matériel s'il y en a un), les salles (modules) dans l'ordre,
 * le boss (examen final ou projet) et le trésor. Tout vient de la carte renvoyée par l'API.
 */
export function PlanDonjon({ carte }: { carte: CarteFormation }) {
  const { course, enrollment, modules, final_exam: examen } = carte;
  const type = typeDonjon(course);
  const etats = etatsSalles(modules, enrollment);
  const boss = ETAT_BOSS[etatBoss(enrollment)];
  const kitEnAttente = enrollment?.status === "waiting_kit";

  return (
    <ol className="grid">
      {type.avecKit && (
        <Etape
          marque={!enrollment ? "neutre" : kitEnAttente ? "courante" : "faite"}
          repere={<Package className="size-4" />}
          titre="Entrée : le kit de matériel"
          etat={!enrollment ? null : kitEnAttente ? "En cours de livraison" : "Kit livré"}
          courante={kitEnAttente}
        >
          <p className="text-sm text-systeme-attenue">
            Jobsy prépare ton matériel et te contacte pour la livraison. Les salles s&apos;ouvrent une fois le kit livré.
          </p>
        </Etape>
      )}

      {modules.map((module, index) => {
        const etat = etats[index];
        const duree = formaterDuree(module.duration_minutes);
        const details = [
          `${module.lessons_count} leçon${module.lessons_count > 1 ? "s" : ""}`,
          duree,
          module.quiz_questions_count > 0
            ? `quiz de ${module.quiz_questions_count} question${module.quiz_questions_count > 1 ? "s" : ""} (${carte.quiz_passing_score}${POURCENT} pour réussir)`
            : "sans quiz",
        ].filter(Boolean);
        // Avancement détaillé de la salle en cours seulement : « 1/2 leçons terminées, quiz à réussir »
        const avancement =
          etat === "en_cours" && module.lessons_completed !== null
            ? [
                `${module.lessons_completed}/${module.lessons_count} leçon${module.lessons_count > 1 ? "s terminées" : " terminée"}`,
                module.quiz_passed === true ? "quiz réussi" : module.quiz_questions_count > 0 ? "quiz à réussir" : null,
              ].filter(Boolean)
            : [];

        return (
          <Etape
            key={module.id}
            marque={MARQUE_SALLE[etat]}
            repere={index + 1}
            titre={`Salle ${index + 1} : ${module.title}`}
            etat={ETAT_SALLE[etat]}
            courante={etat === "en_cours"}
          >
            <p className="text-sm text-systeme-attenue">{details.join(" · ")}</p>
            {avancement.length > 0 && <p className="text-sm text-systeme-texte">{avancement.join(", ")}</p>}
            {module.description && (
              <SafeHtml as="div" className={cn("line-clamp-3 text-sm leading-relaxed text-systeme-attenue", CLASSES_TEXTE_RICHE)} html={module.description} />
            )}
          </Etape>
        );
      })}

      <Etape
        marque={boss.marque}
        repere={<Swords className="size-4" />}
        titre={type.boss === "project" ? "Boss : le projet pratique" : "Boss : l'examen final"}
        etat={boss.texte}
        courante={boss.marque === "courante"}
      >
        <p className="text-sm text-systeme-attenue">{reglesBoss(examen)}</p>
      </Etape>

      <Etape
        marque={enrollment?.status === "certified" ? "faite" : "neutre"}
        repere={<Trophy className="size-4" />}
        titre="Trésor"
        derniere
        etat={enrollment?.status === "certified" ? "Obtenu" : null}
      >
        <p className="text-sm text-systeme-attenue">
          <strong className="text-systeme-or">+{course.reward_xp ?? 0} XP</strong>
          {course.reward_asset ? (
            <>
              , {/^badge\b/i.test(course.reward_asset) ? "" : "le badge "}
              <strong className="text-systeme-or">{course.reward_asset}</strong>
            </>
          ) : null}{" "}
          et un certificat vérifiable en ligne.
        </p>
      </Etape>
    </ol>
  );
}
