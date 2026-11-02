import Link from "next/link";
import { GraduationCap, Package, Swords, Trophy } from "lucide-react";
import SafeHtml from "@/components/SafeHtml";
import { PastilleStatut } from "../qg/CarteRealite";
import { etatDonjon, lienCarte, typeDonjon, type CleType } from "./regles";
import type { EntreeCatalogue } from "./types";

export const ICONES_TYPE: Record<CleType, typeof GraduationCap> = {
  standard: GraduationCap,
  logistique: Package,
  expert: Swords,
};

/**
 * Une formation vue comme un donjon : bandeau du Système (type et état), puis les informations réelles
 * (ce qu'elle demande, ce qu'elle rapporte) sur fond clair.
 */
export function CarteDonjonCatalogue({ entree }: { entree: EntreeCatalogue }) {
  const { course } = entree;
  const type = typeDonjon(course);
  const etat = etatDonjon(entree.enrollment);
  const Icone = ICONES_TYPE[type.cle];
  const salles = course.modules?.length ?? 0;

  const faits = [
    `${salles} salle${salles > 1 ? "s" : ""}`,
    type.avecKit ? "Kit de matériel livré" : null,
    type.boss === "project" ? "Projet pratique final" : "Examen final",
  ].filter(Boolean) as string[];

  return (
    <article className="grid content-start overflow-hidden rounded-2xl border border-slate-200 bg-white font-lisible text-slate-900">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-systeme-nuit px-4 py-2.5 text-systeme-texte">
        <Icone aria-hidden="true" className="size-4 text-systeme-lueur" />
        <p className="font-systeme text-sm font-bold">Donjon {type.nom}</p>
        <PastilleStatut ton={etat.ton} className="ml-auto">
          {etat.libelle}
        </PastilleStatut>
      </div>

      <div className="grid gap-3 p-5">
        <h3 className="text-lg leading-snug font-bold text-balance break-words">{course.title}</h3>
        {course.description && <SafeHtml as="div" className="line-clamp-3 text-sm leading-relaxed text-slate-600" html={course.description} />}

        <ul className="flex flex-wrap gap-2 text-xs">
          {faits.map((fait) => (
            <li key={fait} className="rounded-md bg-slate-100 px-2 py-1 text-slate-700">
              {fait}
            </li>
          ))}
        </ul>

        <div className="grid gap-0.5">
          <p className="text-xs text-slate-500">Trésor à la certification</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 font-bold">
            <span className="text-xl text-[#000080] tabular-nums">+{course.reward_xp ?? 0} XP</span>
            {course.reward_asset && (
              <span className="inline-flex items-center gap-1 text-sm text-[#6B5F00]">
                <Trophy aria-hidden="true" className="size-4" />
                {course.reward_asset}
              </span>
            )}
          </p>
        </div>

        {etat.progression !== null && etat.cle === "en_cours" && (
          <div
            role="progressbar"
            aria-label={`Progression : ${course.title}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={etat.progression}
            className="h-2 overflow-hidden rounded-full bg-slate-200"
          >
            <div className="h-full rounded-full bg-[#000080]" style={{ width: `${etat.progression}%` }} />
          </div>
        )}

        <Link
          href={lienCarte(course.id)}
          className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-lg border border-[#000080] px-4 text-sm font-bold text-[#000080] transition-colors hover:bg-[#000080] hover:text-white focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          Voir le donjon<span className="sr-only"> : {course.title}</span>
        </Link>
      </div>
    </article>
  );
}
