/**
 * Noms accessibles de la barre d'outils de l'éditeur de texte (Quill, via PrimeReact Editor).
 * Ses menus (titre, couleurs, alignement) n'ont pas de nom et ses boutons sont nommés en anglais.
 * À appeler dans le onLoad de l'Editor : nommerBarreEditeur(quill).
 */
const MENUS: Record<string, string> = {
  "ql-header": "Titre",
  "ql-font": "Police",
  "ql-size": "Taille du texte",
  "ql-color": "Couleur du texte",
  "ql-background": "Couleur de fond",
  "ql-align": "Alignement",
};

const BOUTONS: Record<string, string> = {
  "ql-bold": "Gras",
  "ql-italic": "Italique",
  "ql-underline": "Souligné",
  "ql-strike": "Barré",
  "ql-link": "Lien",
  "ql-image": "Image",
  "ql-blockquote": "Citation",
  "ql-code-block": "Bloc de code",
  "ql-clean": "Effacer la mise en forme",
};

const VALEURS: Record<string, string> = {
  ordered: "Liste numérotée",
  bullet: "Liste à puces",
  check: "Liste de cases à cocher",
  center: "Centré",
  right: "Aligné à droite",
  justify: "Justifié",
  "-1": "Diminuer le retrait",
  "+1": "Augmenter le retrait",
  sub: "Indice",
  super: "Exposant",
};

type Quill = { getModule?: (nom: string) => { container?: HTMLElement } | undefined } | null | undefined;

function nomOption(menu: string, valeur: string | null): string {
  if (menu === "ql-header") return valeur ? `Titre ${valeur}` : "Texte normal";
  if (menu === "ql-align") return valeur ? (VALEURS[valeur] ?? valeur) : "Aligné à gauche";
  return valeur ? `${MENUS[menu]} ${valeur}` : `${MENUS[menu]} par défaut`;
}

export function nommerBarreEditeur(quill: Quill): void {
  const barre = quill?.getModule?.("toolbar")?.container;
  if (!barre) return;
  for (const menu of barre.querySelectorAll<HTMLElement>(".ql-picker")) {
    const cle = Object.keys(MENUS).find((c) => menu.classList.contains(c));
    if (!cle) continue;
    menu.querySelector(".ql-picker-label")?.setAttribute("aria-label", MENUS[cle]);
    for (const option of menu.querySelectorAll<HTMLElement>(".ql-picker-item")) option.setAttribute("aria-label", nomOption(cle, option.getAttribute("data-value")));
  }
  for (const bouton of barre.querySelectorAll<HTMLButtonElement>("button")) {
    const cle = Object.keys(BOUTONS).find((c) => bouton.classList.contains(c));
    const valeur = bouton.getAttribute("value");
    const nom = cle ? BOUTONS[cle] : valeur ? VALEURS[valeur] : undefined;
    if (nom) bouton.setAttribute("aria-label", nom);
  }
}
