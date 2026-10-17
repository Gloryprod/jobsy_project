import { cn } from "@/lib/utils";

const COULEURS_PAR_RANG: Record<string, string> = {
  S: "var(--color-rang-s)",
  A: "var(--color-rang-a)",
  B: "var(--color-rang-b)",
  C: "var(--color-rang-c)",
  D: "var(--color-rang-d)",
  E: "var(--color-rang-e)",
};

const TAILLES = {
  sm: "w-10 text-lg",
  md: "w-16 text-3xl",
  lg: "w-24 text-5xl",
};

const HEXAGONE = "[clip-path:polygon(50%_0,100%_25%,100%_75%,50%_100%,0_75%,0_25%)]";

type Props = {
  /** Lettre du rang : E, D, C, B, A ou S. */
  rang: string;
  /** ranks.code_hexa venant de l'API ; à défaut, la couleur du thème pour cette lettre. */
  couleur?: string | null;
  taille?: keyof typeof TAILLES;
  className?: string;
};

/** Emblème hexagonal du rang : bord à la couleur du rang, lettre blanche sur la nuit du Système. */
export function EmblemeRang({ rang, couleur, taille = "md", className }: Props) {
  const lettre = (rang || "E").trim().toUpperCase().slice(0, 1);
  // Seule une couleur hexadécimale est acceptée dans le style en ligne
  const fond = couleur && /^#[0-9a-f]{3,8}$/i.test(couleur) ? couleur : COULEURS_PAR_RANG[lettre] ?? COULEURS_PAR_RANG.E;

  return (
    <span
      role="img"
      aria-label={`Rang ${lettre}`}
      className={cn("grid aspect-[1/1.1] shrink-0 place-items-center", HEXAGONE, TAILLES[taille], className)}
      style={{ backgroundColor: fond }}
    >
      <span
        aria-hidden="true"
        className={cn("grid h-[calc(100%-6px)] w-[calc(100%-6px)] place-items-center bg-systeme-nuit font-systeme font-extrabold text-white", HEXAGONE)}
      >
        {lettre}
      </span>
    </span>
  );
}
