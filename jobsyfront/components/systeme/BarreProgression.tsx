import { cn } from "@/lib/utils";

type Props = {
  /** Ce que mesure la barre, lu aussi par les lecteurs d'écran : « Vers le rang C ». */
  libelle: string;
  valeur: number;
  min?: number;
  max: number;
  /** Texte affiché à droite, par exemple « 460 / 800 XP ». */
  detail?: string;
  className?: string;
};

export function BarreProgression({ libelle, valeur, min = 0, max, detail, className }: Props) {
  const etendue = max - min;
  const borne = Math.min(max, Math.max(min, valeur));
  const ratio = etendue > 0 ? (borne - min) / etendue : 1;

  return (
    <div className={cn("grid gap-1.5", className)}>
      <div className="flex justify-between gap-3 text-sm text-systeme-attenue">
        <span>{libelle}</span>
        {detail && <b className="font-semibold text-systeme-texte tabular-nums">{detail}</b>}
      </div>
      <div
        role="progressbar"
        aria-label={libelle}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={borne}
        aria-valuetext={detail}
        className="h-2.5 overflow-hidden rounded-[2px] border border-systeme-lueur/35 bg-systeme-lueur/12"
      >
        {/* scaleX plutôt que width : l'animation ne recalcule pas la mise en page */}
        <div
          className="h-full w-full origin-left bg-[linear-gradient(90deg,var(--color-systeme-lueur),#B5F0FF)] shadow-[0_0_12px_var(--color-systeme-lueur)] transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>
    </div>
  );
}
