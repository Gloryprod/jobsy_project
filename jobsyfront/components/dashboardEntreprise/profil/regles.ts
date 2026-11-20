// Règles du profil de l'entreprise (lot 7e). Fonctions pures, sans appel réseau.
import { isValidPhoneNumber } from "react-phone-number-input";

type Texte = string | null | undefined;

// GET /entreprise/contact (EntrepriseController::index) : l'entreprise et ses coordonnées
export type ProfilEntreprise = {
  id: number;
  nom_entreprise?: Texte;
  nom_officiel?: Texte;
  secteur_activite?: Texte;
  localisation?: Texte;
  taille?: Texte;
  site_web?: Texte;
  description?: Texte;
  logo?: Texte;
  contact_entreprise?: Partial<Record<CleContact, Texte>> | null;
};

export type Valeurs = Record<string, string>;
export type Erreurs = Record<string, string>;
export type Champ = { cle: string; libelle: string; type?: "text" | "email" | "tel" | "url"; aide?: string; requis?: boolean; autoComplete?: string };

export const CHAMPS_INFOS: Champ[] = [
  { cle: "nom_entreprise", libelle: "Nom de l'entreprise", requis: true, autoComplete: "organization", aide: "Il s'affiche sur vos missions et dans vos invitations." },
  { cle: "nom_officiel", libelle: "Raison sociale" },
  { cle: "secteur_activite", libelle: "Secteur d'activité" },
  { cle: "localisation", libelle: "Ville ou adresse", autoComplete: "street-address" },
  { cle: "taille", libelle: "Taille", aide: "Par exemple : 1 à 10 salariés." },
  { cle: "site_web", libelle: "Site web", type: "url", aide: "Par exemple : https://monentreprise.bj" },
];

export type CleContact = "nom_promoteur" | "email" | "telephone" | "linkedin" | "facebook" | "instagram" | "twitter";
export const RESEAUX: { cle: CleContact; nom: string }[] = [
  { cle: "linkedin", nom: "LinkedIn" },
  { cle: "facebook", nom: "Facebook" },
  { cle: "instagram", nom: "Instagram" },
  { cle: "twitter", nom: "X (Twitter)" },
];
export const CHAMPS_CONTACT: Champ[] = [
  { cle: "nom_promoteur", libelle: "Nom du responsable", autoComplete: "name" },
  { cle: "email", libelle: "Adresse e-mail", type: "email", autoComplete: "email" },
  { cle: "telephone", libelle: "Téléphone", type: "tel", autoComplete: "tel", aide: "Par exemple : 01 97 00 00 00 ou +229 01 97 00 00 00." },
  ...RESEAUX.map((r): Champ => ({ cle: r.cle, libelle: `Page ${r.nom}`, type: "url", aide: "L'adresse complète de la page." })),
];

/** Les valeurs de l'API, sans null, pour remplir un formulaire. */
export function valeursDe(source: Record<string, unknown> | null | undefined, champs: Champ[]): Valeurs {
  return Object.fromEntries(champs.map((c) => [c.cle, typeof source?.[c.cle] === "string" ? (source[c.cle] as string) : ""]));
}

/** « monentreprise.bj » devient « https://monentreprise.bj » : l'API n'accepte que les adresses complètes. */
export function completerAdresse(saisie: string): string {
  const v = saisie.trim();
  return v && !/^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? `https://${v}` : v;
}

function estAdresseWeb(v: string): boolean {
  try {
    const url = new URL(v);
    return (url.protocol === "https:" || url.protocol === "http:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

/** Règles de EntrepriseRequest et ContactEntrepriseRequest : 255 caractères, nom obligatoire, adresses complètes, e-mail, téléphone. */
export function verifier(v: Valeurs, champs: Champ[]): Erreurs {
  const e: Erreurs = {};
  for (const c of champs) {
    // Une adresse est vérifiée telle qu'elle sera envoyée (https:// ajouté si besoin)
    const valeur = c.type === "url" ? completerAdresse(v[c.cle] ?? "") : (v[c.cle] ?? "").trim();
    if (!valeur) {
      if (c.requis) e[c.cle] = "Ce champ est obligatoire.";
      continue;
    }
    if (valeur.length > 255) e[c.cle] = "255 caractères au maximum.";
    else if (c.type === "url" && !estAdresseWeb(valeur)) e[c.cle] = "Adresse invalide. Collez l'adresse complète, par exemple https://monentreprise.bj";
    else if (c.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)) e[c.cle] = "Adresse e-mail invalide.";
    else if (c.type === "tel" && !isValidPhoneNumber(valeur, "BJ")) e[c.cle] = "Numéro de téléphone invalide.";
  }
  return e;
}

/** Valeurs envoyées à l'API : espaces retirés, adresses complétées. */
export function preparer(v: Valeurs, champs: Champ[]): Valeurs {
  return Object.fromEntries(champs.map((c) => [c.cle, c.type === "url" ? completerAdresse(v[c.cle] ?? "") : (v[c.cle] ?? "").trim()]));
}

/** Message d'un champ refusé par l'API (ses messages sont en anglais). */
export function refusChamp(champ: Champ): string {
  if (champ.requis) return "Ce champ est obligatoire.";
  if (champ.type === "url") return "Adresse invalide. Collez l'adresse complète, par exemple https://monentreprise.bj";
  if (champ.type === "email") return "Adresse e-mail invalide.";
  return "Cette valeur n'est pas acceptée (255 caractères au maximum).";
}

export const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const LOGO_MAX = 2 * 1024 * 1024;

/** Règle « logo » de EntrepriseRequest : JPG, PNG ou WebP, 2 Mo au plus. */
export function verifierLogo(fichier: Pick<File, "type" | "size">): string | null {
  if (!LOGO_TYPES.includes(fichier.type)) return "Le logo doit être une image JPG, PNG ou WebP.";
  if (fichier.size > LOGO_MAX) return "Le logo ne doit pas dépasser 2 Mo.";
  return null;
}

export function initiales(nom: Texte): string {
  return (nom ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((mot) => mot[0]?.toUpperCase())
    .join("") || "?";
}
