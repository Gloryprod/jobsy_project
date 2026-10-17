/**
 * Progression d'un candidat vers le rang suivant, à partir de son XP réelle (candidats.score).
 *
 * Les seuils viennent de la table ranks. Il n'existe pas encore de route d'API qui les liste :
 * RANGS_PAR_DEFAUT recopie jobsyback/database/seeders/RankSeeder.php et doit rester identique.
 */

export type Rang = {
  rank: string;
  points: number;
  label?: string | null;
  code_hexa?: string | null;
};

export const RANGS_PAR_DEFAUT: readonly Rang[] = [
  { rank: "E", label: "Rang E - Débutant", points: 0, code_hexa: "#6B7280" },
  { rank: "D", label: "Rang D - Baccalauréat", points: 300, code_hexa: "#CA8A04" },
  { rank: "C", label: "Rang C - BTS / DUT", points: 800, code_hexa: "#16A34A" },
  { rank: "B", label: "Rang B - Licence", points: 1500, code_hexa: "#2563EB" },
  { rank: "A", label: "Rang A - Master", points: 3000, code_hexa: "#DC2626" },
  { rank: "S", label: "Rang S - Doctorat", points: 5000, code_hexa: "#7C3AED" },
];

export type Progression = {
  xp: number;
  actuel: Rang;
  /** null quand le rang S est atteint. */
  suivant: Rang | null;
  /** XP qui manque pour le rang suivant (0 au rang maximal). */
  manque: number;
  /** De 0 à 100, entre le seuil du rang actuel et celui du rang suivant. */
  pourcentage: number;
};

/**
 * @param xp score du candidat
 * @param rangActuel lettre du rang en base (il peut venir du diplôme du CV) ; à défaut, déduit de l'XP
 */
export function progressionVersRangSuivant(
  xp: number | null | undefined,
  rangActuel?: string | null,
  rangs: readonly Rang[] = RANGS_PAR_DEFAUT,
): Progression {
  const tries = [...rangs].sort((a, b) => a.points - b.points);
  const points = Number.isFinite(Number(xp)) ? Math.max(0, Number(xp)) : 0;

  const lettre = rangActuel?.trim().toUpperCase();
  const parLettre = lettre ? tries.find((r) => r.rank.toUpperCase() === lettre) : undefined;
  const parXp = [...tries].reverse().find((r) => points >= r.points) ?? tries[0];
  const actuel = parLettre ?? parXp;

  const suivant = tries[tries.indexOf(actuel) + 1] ?? null;
  if (!suivant) {
    return { xp: points, actuel, suivant: null, manque: 0, pourcentage: 100 };
  }

  const etendue = suivant.points - actuel.points;
  const pourcentage = etendue > 0 ? ((points - actuel.points) / etendue) * 100 : 100;

  return {
    xp: points,
    actuel,
    suivant,
    manque: Math.max(0, suivant.points - points),
    pourcentage: Math.min(100, Math.max(0, pourcentage)),
  };
}

/** 5200 → « 5 200 XP » (espaces insécables du français). */
export function formaterXp(xp: number): string {
  return `${Math.round(xp).toLocaleString("fr-FR")} XP`;
}
