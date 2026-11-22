import { Echeance, FenetreSysteme, LienSysteme } from "@/components/systeme";
import type { Quete } from "./quetes";

/** Les prochaines actions réelles, dans l'ordre de priorité. null pendant le calcul. */
export function QuetesDuJour({ quetes }: { quetes: Quete[] | null }) {
  return (
    <FenetreSysteme etiquette="Système" titre="Quêtes du jour" niveauTitre={2}>
      {quetes === null ? (
        <div className="grid gap-3">
          <p className="text-systeme-attenue" aria-live="polite">
            Le Système prépare tes quêtes…
          </p>
          {/* Places réservées : la fenêtre garde à peu près sa hauteur à l'arrivée des quêtes, le bas de la page ne saute pas */}
          {[0, 1].map((i) => (
            <div key={i} aria-hidden="true" className="h-40 animate-pulse rounded-[3px] border border-systeme-lueur/15 bg-systeme-nuit/60 motion-reduce:animate-none" />
          ))}
        </div>
      ) : (
        <ol className="grid gap-3">
          {quetes.map((quete) => (
            <li key={quete.id} className="grid gap-2 rounded-[3px] border border-systeme-lueur/25 bg-systeme-nuit/60 p-3.5">
              <h3 className="font-systeme text-lg leading-snug font-bold text-balance">{quete.titre}</h3>
              <p className="text-sm text-systeme-attenue">{quete.detail}</p>
              {quete.recompense && (
                <p className="text-sm">
                  <span className="text-systeme-attenue">Récompense : </span>
                  <strong className="text-systeme-or">{quete.recompense}</strong>
                </p>
              )}
              {quete.echeance && <Echeance date={quete.echeance} className="text-sm font-semibold text-systeme-alerte" />}
              <LienSysteme href={quete.lien} className="justify-self-start">
                {quete.action}
              </LienSysteme>
            </li>
          ))}
        </ol>
      )}
    </FenetreSysteme>
  );
}
