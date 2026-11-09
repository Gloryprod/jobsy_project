"use client";

import useSWR from "swr";
import api from "@/lib/api";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme } from "@/components/systeme";
import type { Candidature, Inscription, ProfilCandidat } from "../qg/types";
import { CarteModifiable, type DefinitionChamp } from "./CarteModifiable";
import { FenetrePersonnage, Reconnaissance } from "./FenetrePersonnage";
import {
  calculerStatistiques,
  compterFormationsCertifiees,
  emailValide,
  formaterDateNaissance,
  lienValide,
  pourChampDate,
  telephoneValide,
} from "./regles";
import { SectionCv } from "./SectionCv";
import { SectionDocuments } from "./SectionDocuments";
import { SectionMotDePasse } from "./SectionMotDePasse";
import type { Dossier, TitreInventaire } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);
const lireInventaire = (url: string): Promise<TitreInventaire[]> => api.get(url).then((reponse) => reponse.data);

const SEXES = ["Féminin", "Masculin"];

const verifierTelephone = (valeur: string) => (telephoneValide(valeur) ? null : "Indique un numéro valide, par exemple +229 01 97 00 00 00.");

const CHAMPS_INFORMATIONS = (sexeActuel: string): DefinitionChamp[] => [
  { nom: "ville", libelle: "Ville", autoComplete: "address-level2", refus: "Indique une ville valide." },
  { nom: "adresse", libelle: "Adresse", aide: "Quartier et repère : c'est là que Jobsy livre ton kit de formation.", autoComplete: "street-address", refus: "Indique une adresse valide." },
  { nom: "nationalite", libelle: "Nationalité", refus: "Indique une nationalité valide." },
  {
    nom: "sexe",
    libelle: "Sexe",
    // Une valeur déjà enregistrée en dehors de la liste reste proposée
    options: [{ valeur: "", libelle: "Non précisé" }, ...[...new Set([...SEXES, ...(sexeActuel ? [sexeActuel] : [])])].map((valeur) => ({ valeur, libelle: valeur }))],
    refus: "Choisis une valeur de la liste.",
  },
  {
    nom: "date_naissance",
    libelle: "Date de naissance",
    type: "date",
    autoComplete: "bday",
    verifier: (valeur) => (new Date(valeur).getTime() > Date.now() ? "Cette date est dans le futur." : null),
    refus: "Indique une date valide.",
  },
  { nom: "bio", libelle: "Présentation", multiligne: true, aide: "Quelques phrases sur toi et ce que tu cherches.", refus: "Cette présentation n'est pas acceptée." },
];

const CHAMPS_CONTACT: DefinitionChamp[] = [
  { nom: "telephone", libelle: "Téléphone", type: "tel", autoComplete: "tel", verifier: verifierTelephone, refus: "Indique un numéro valide." },
  { nom: "whatsapp", libelle: "WhatsApp", type: "tel", verifier: verifierTelephone, refus: "Indique un numéro valide." },
  { nom: "email_secondaire", libelle: "E-mail secondaire", type: "email", autoComplete: "email", verifier: (v) => (emailValide(v) ? null : "Indique une adresse e-mail valide."), refus: "Indique une adresse e-mail valide." },
  { nom: "linkedin", libelle: "LinkedIn", type: "url", aide: "Lien complet, qui commence par https://", verifier: (v) => (lienValide(v) ? null : "Indique un lien complet, qui commence par https://"), refus: "Indique un lien complet, qui commence par https://" },
];

function Valeurs({ lignes }: { lignes: { libelle: string; valeur?: string | null }[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {lignes.map((ligne) => (
        <div key={ligne.libelle} className="grid min-w-0 gap-0.5">
          <dt className="text-sm text-slate-600">{ligne.libelle}</dt>
          <dd className={`break-words whitespace-pre-line ${ligne.valeur ? "font-semibold text-slate-900" : "text-slate-500"}`}>{ligne.valeur || "Non renseigné"}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * La page profil du candidat : la fenêtre de statut (couche Système), puis le dossier (couche réalité).
 * Les statistiques viennent des mêmes listes que le QG, partagées par le cache de SWR.
 */
export function FicheStatut() {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;

  const dossier = useSWR<Dossier>("/candidat/profile", lireDonnees);
  // Même clé que le QG : rang à jour, compétences, série et vitalité
  const elements = useSWR<ProfilCandidat>("/candidat/profile-elements", lireDonnees);
  const candidatures = useSWR<Candidature[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, lireDonnees);
  const inscriptions = useSWR<Inscription[]>(candidatId ? "/courses/my-learnings" : null, lireDonnees);
  const inventaire = useSWR<TitreInventaire[]>("/candidate/inventory", lireInventaire);

  const d = dossier.data;
  const recharger = async () => {
    await dossier.mutate();
    await elements.mutate();
  };

  let contenu;
  if (chargementUtilisateur || dossier.isLoading) {
    contenu = (
      <FenetreSysteme etiquette="Statut" balayage={false}>
        <p className="text-systeme-attenue">Le Système charge ta fiche…</p>
      </FenetreSysteme>
    );
  } else if (dossier.error || !d) {
    contenu = (
      <FenetreSysteme etiquette="Système" titre="Ta fiche n'a pas pu se charger" ton="alerte" balayage={false}>
        <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
        <BoutonSysteme onClick={() => dossier.mutate()} className="justify-self-start">
          Réessayer
        </BoutonSysteme>
      </FenetreSysteme>
    );
  } else {
    const contact = d.contact ?? {};
    contenu = (
      <>
        <FenetrePersonnage
          profil={elements.data ?? { ...d, skills: [] }}
          statistiques={candidatures.data ? calculerStatistiques(candidatures.data) : null}
          formationsCertifiees={inscriptions.data ? compterFormationsCertifiees(inscriptions.data) : null}
          titres={inventaire.data ? inventaire.data.filter((titre) => titre.equipped && titre.unlocked) : null}
        />
        <Reconnaissance valide={!!d.is_validate} aCv={!!d.cv} aDiplome={(d.diplomes ?? []).some((diplome) => diplome.fichier)} />

        <CarteModifiable
          id="informations"
          titre="Mes informations"
          route="/update/info"
          champs={CHAMPS_INFORMATIONS(d.sexe ?? "")}
          valeurs={{
            ville: d.ville ?? "",
            adresse: d.adresse ?? "",
            nationalite: d.nationalite ?? "",
            sexe: d.sexe ?? "",
            date_naissance: pourChampDate(d.date_naissance),
            bio: d.bio ?? "",
          }}
          onEnregistre={recharger}
        >
          <Valeurs
            lignes={[
              { libelle: "Ville", valeur: d.ville },
              { libelle: "Adresse", valeur: d.adresse },
              { libelle: "Nationalité", valeur: d.nationalite },
              { libelle: "Sexe", valeur: d.sexe },
              { libelle: "Date de naissance", valeur: formaterDateNaissance(d.date_naissance) },
              { libelle: "Présentation", valeur: d.bio },
            ]}
          />
        </CarteModifiable>

        <CarteModifiable
          id="contact"
          titre="Comment te joindre"
          route="/update/contact"
          champs={CHAMPS_CONTACT}
          valeurs={{
            telephone: contact.telephone ?? "",
            whatsapp: contact.whatsapp ?? "",
            email_secondaire: contact.email_secondaire ?? "",
            linkedin: contact.linkedin ?? "",
          }}
          onEnregistre={recharger}
        >
          <Valeurs
            lignes={[
              { libelle: "E-mail du compte", valeur: user?.email },
              { libelle: "Téléphone", valeur: contact.telephone },
              { libelle: "WhatsApp", valeur: contact.whatsapp },
              { libelle: "E-mail secondaire", valeur: contact.email_secondaire },
              { libelle: "LinkedIn", valeur: contact.linkedin },
            ]}
          />
        </CarteModifiable>

        <SectionCv cv={d.cv} onChange={recharger} />

        <SectionDocuments
          id="diplomes"
          titre="Mes diplômes"
          explication="Ajoute chaque diplôme avec son attestation : l'équipe Jobsy s'en sert pour valider ton profil."
          nomUn="un diplôme"
          nomCourt="Diplôme"
          accordAjoute="ajouté"
          documents={(d.diplomes ?? []).map((diplome) => ({ id: diplome.id, titre: diplome.intitule, fichier: diplome.fichier }))}
          champs={[{ nom: "intitule", libelle: "Intitulé du diplôme", refusDoublon: "Tu as déjà ajouté un diplôme avec cet intitulé." }]}
          champFichier="fichier"
          routeAjout="/candidat/diplome"
          routeSuppression={(id) => `/candidat/diplomes/${id}`}
          onChange={recharger}
        />

        <SectionDocuments
          id="certifications"
          titre="Mes certifications externes"
          explication="Les certificats obtenus en dehors de Jobsy. Ceux des formations Jobsy sont dans ton inventaire."
          nomUn="une certification"
          nomCourt="Certification"
          accordAjoute="ajoutée"
          documents={(d.formations ?? []).map((formation) => ({ id: formation.id, titre: formation.titre, detail: formation.organisme, fichier: formation.certificat }))}
          champs={[
            { nom: "titre", libelle: "Intitulé du certificat" },
            { nom: "organisme", libelle: "Organisme qui l'a délivré" },
          ]}
          champFichier="certificat"
          routeAjout="/candidat/formation"
          routeSuppression={(id) => `/candidat/formations/${id}`}
          onChange={recharger}
        />

        <SectionMotDePasse />
      </>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <p className="text-sm font-bold text-[#000080]">Ton profil</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{[user?.prenom, user?.nom].filter(Boolean).join(" ") || "Ton personnage"}</h1>
      </header>
      {contenu}
    </div>
  );
}
