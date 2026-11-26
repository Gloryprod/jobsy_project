// Les pages de l'espace candidat (lot 8a) : une seule liste pour la barre latérale, la barre du bas et le panneau « Plus ».
// Les intitulés restent ceux de la couche réalité (D9).
import { Backpack, Bell, BookOpen, CheckCheck, Home, Mail, Sword, User, Wallet, type LucideIcon } from "lucide-react";

export type PageCandidat = {
  id: string;
  nom: string;
  /** Intitulé de la barre du bas, quand le nom est trop long */
  court?: string;
  href: string;
  icone: LucideIcon;
  /** Autres adresses rattachées à l'entrée (une offre de mission relève des missions confirmées) */
  aussi?: string[];
};

const RACINE = "/dashboard/candidats";

export const GROUPES_CANDIDAT: { titre: string | null; pages: PageCandidat[] }[] = [
  { titre: null, pages: [{ id: "qg", nom: "Tableau de bord", court: "Accueil", href: RACINE, icone: Home }] },
  {
    titre: "Missions",
    pages: [
      { id: "missions", nom: "Missions", href: `${RACINE}/missions`, icone: Sword },
      { id: "confirmees", nom: "Missions confirmées", href: `${RACINE}/missions/en_cours`, icone: CheckCheck, aussi: [`${RACINE}/missions/offers`] },
      { id: "invitations", nom: "Invitations", href: `${RACINE}/invitations`, icone: Mail },
    ],
  },
  {
    titre: "Progression",
    pages: [
      { id: "formations", nom: "Formations", href: `${RACINE}/formations`, icone: BookOpen },
      { id: "inventaire", nom: "Inventaire", href: `${RACINE}/inventaire`, icone: Backpack },
    ],
  },
  {
    titre: "Compte",
    pages: [
      { id: "tresor", nom: "Trésor", href: `${RACINE}/loot`, icone: Wallet },
      { id: "profil", nom: "Profil", href: `${RACINE}/profile`, icone: User },
      { id: "messages", nom: "Messages", href: `${RACINE}/notifications`, icone: Bell },
    ],
  },
];

export const PAGES_CANDIDAT = GROUPES_CANDIDAT.flatMap((g) => g.pages);

/** La boucle principale, dans la barre du bas ; le reste est dans « Plus » (D41). */
export const BARRE_DU_BAS = ["qg", "missions", "formations", "tresor"].map((id) => PAGES_CANDIDAT.find((p) => p.id === id)!);

/** L'entrée de la page en cours : l'adresse exacte ou l'une de ses sous-pages, la plus précise l'emportant. */
export function pageActive(chemin: string): string | null {
  let trouvee: { id: string; longueur: number } | null = null;
  for (const page of PAGES_CANDIDAT) {
    for (const base of [page.href, ...(page.aussi ?? [])]) {
      // Le tableau de bord n'est actif que sur sa propre adresse : toutes les pages commencent par lui
      const correspond = chemin === base || (base !== RACINE && chemin.startsWith(`${base}/`));
      if (correspond && (!trouvee || base.length > trouvee.longueur)) trouvee = { id: page.id, longueur: base.length };
    }
  }
  return trouvee?.id ?? null;
}
