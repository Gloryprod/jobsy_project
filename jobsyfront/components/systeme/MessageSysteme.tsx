import type { ReactNode } from "react";
import { FenetreSysteme, type TonSysteme } from "./FenetreSysteme";
import { Echeance } from "./Echeance";

type Props = {
  /** Origine du message : « Système », « Invitation de guilde », « Récompense »… */
  etiquette: string;
  titre: ReactNode;
  children?: ReactNode;
  /** Date limite réelle (expires_at). Sans délai réel, pas de compte à rebours. */
  echeance?: string | Date | null;
  /** Boutons d'action (BoutonSysteme, LienSysteme). */
  actions?: ReactNode;
  ton?: TonSysteme;
  niveauTitre?: 2 | 3 | 4;
};

/** Message du Système : notification, invitation, récompense. Version compacte de la fenêtre, sans balayage. */
export function MessageSysteme({ etiquette, titre, children, echeance, actions, ton = "info", niveauTitre = 3 }: Props) {
  return (
    <FenetreSysteme etiquette={etiquette} titre={titre} niveauTitre={niveauTitre} ton={ton} balayage={false} className="gap-3 p-4">
      {children && <div className="text-[0.98rem] text-systeme-attenue">{children}</div>}
      {echeance && (
        <p className="text-sm font-semibold text-systeme-alerte">
          <Echeance date={echeance} />
        </p>
      )}
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </FenetreSysteme>
  );
}
