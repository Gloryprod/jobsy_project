import type { CritereProjet } from "./types";

/**
 * Ce que le jury note, avec les points de chaque critère (décision D27).
 * `clair` : dans une carte blanche, sous l'énoncé ; sinon dans une fenêtre du Système.
 */
export function CriteresJury({ criteres, clair = false }: { criteres: CritereProjet[] | null | undefined; clair?: boolean }) {
  const liste = (criteres ?? []).filter((critere) => critere?.name);
  if (liste.length === 0) return null;

  const titre = <span className={clair ? "font-systeme text-lg font-bold text-slate-900" : "font-semibold text-systeme-texte"}>Ce que le jury note</span>;
  const lignes = (
    <ul className="grid gap-1.5">
      {liste.map((critere, index) => (
        <li key={`${critere.name}-${index}`} className={`flex justify-between gap-4 ${clair ? "text-slate-800" : "text-systeme-texte"}`}>
          <span>{critere.name}</span>
          <span className={`shrink-0 font-semibold tabular-nums ${clair ? "text-slate-900" : ""}`}>
            {critere.max_points} pt{Number(critere.max_points) > 1 ? "s" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
  const note = (
    <p className={`text-sm ${clair ? "text-slate-600" : "text-systeme-attenue"}`}>
      Le jury s&apos;appuie sur ces critères pour donner une note sur 20.
    </p>
  );

  if (clair) {
    return (
      <section className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3>{titre}</h3>
        {lignes}
        {note}
      </section>
    );
  }
  return (
    <div className="grid gap-2">
      <h3>{titre}</h3>
      {lignes}
      {note}
    </div>
  );
}
