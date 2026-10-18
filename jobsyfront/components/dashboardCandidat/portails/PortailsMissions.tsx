"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { Search, X } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme, useMaintenant } from "@/components/systeme";
import { formaterXp, progressionVersRangSuivant } from "@/lib/progression";
import { statutCandidature } from "../qg/JournalQuetes";
import { missionOuverte } from "../qg/quetes";
import type { Candidature } from "../qg/types";
import { CartePortail } from "./CartePortail";
import { DetailPortail } from "./DetailPortail";
import { contratAccessible, correspondRecherche, etatPortail, RANGS_MISSIONS_PONCTUELLES_SEULEMENT } from "./regles";
import type { MissionPortail } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

const CONTRATS = [
  { valeur: "tous", libelle: "Tous les contrats" },
  { valeur: "Mission Ponctuelle", libelle: "Missions ponctuelles" },
  { valeur: "CDD", libelle: "CDD" },
  { valeur: "CDI", libelle: "CDI" },
];

/**
 * Les missions vues comme des portails : ouvertes ou verrouillées selon le rang réel du candidat,
 * avec ce qui manque pour ouvrir les autres. Même règle de rang que l'API au moment de postuler.
 */
export function PortailsMissions() {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId = user?.candidat?.id;
  const rang: string | null = user?.candidat?.rank?.rank ?? null;
  const score: number = Number(user?.candidat?.score) || 0;
  const maintenant = useMaintenant();

  const missions = useSWR<MissionPortail[]>("/liste_missions", lireDonnees);
  const candidatures = useSWR<Candidature[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, lireDonnees);

  const [recherche, setRecherche] = useState("");
  const [contrat, setContrat] = useState("tous");
  const [seulementOuverts, setSeulementOuverts] = useState(false);
  const [selection, setSelection] = useState<number | null>(null);
  const [declencheur, setDeclencheur] = useState<HTMLElement | null>(null);

  const ponctuellesSeulement = RANGS_MISSIONS_PONCTUELLES_SEULEMENT.includes((rang ?? "E").toUpperCase());

  const donnees = useMemo(() => {
    if (!missions.data || maintenant === null) return null;

    const parMission = new Map<number, Candidature>();
    (candidatures.data ?? []).forEach((c) => {
      if (c.mission) parMission.set(c.mission.id, c);
    });

    const enCours = missions.data.filter((m) => missionOuverte(m, maintenant));
    const accessibles = enCours.filter((m) => contratAccessible(m, rang));
    const portails = accessibles.map((mission) => {
      const candidature = parMission.get(mission.id) ?? null;
      return {
        mission,
        etat: etatPortail(mission, rang, score),
        candidature,
        statut: candidature ? statutCandidature(candidature, maintenant) : null,
      };
    });

    // Ouverts d'abord, puis ceux où le candidat a déjà postulé, puis les verrouillés
    const groupe = (p: (typeof portails)[number]) => (p.candidature ? 1 : p.etat.ouvert ? 0 : 2);
    const tries = [...portails].sort((a, b) => groupe(a) - groupe(b));

    return {
      tous: tries,
      ouverts: portails.filter((p) => p.etat.ouvert && !p.candidature).length,
      verrouilles: portails.filter((p) => !p.etat.ouvert && !p.candidature).length,
      contratsMasques: enCours.length - accessibles.length,
    };
  }, [missions.data, candidatures.data, maintenant, rang, score]);

  const affiches = (donnees?.tous ?? []).filter(
    (p) =>
      correspondRecherche(p.mission, recherche) &&
      (contrat === "tous" || p.mission.type_contrat === contrat) &&
      (!seulementOuverts || (p.etat.ouvert && !p.candidature)),
  );

  const choisi = donnees?.tous.find((p) => p.mission.id === selection) ?? null;
  const progression = progressionVersRangSuivant(score, rang);

  if (chargementUtilisateur || missions.isLoading || (!donnees && !missions.error)) return <SquelettePortails />;

  if (missions.error || !donnees) {
    return (
      <div className="p-2 sm:p-4">
        <FenetreSysteme etiquette="Système" titre="Les missions n'ont pas pu se charger" ton="alerte" balayage={false} className="max-w-xl">
          <p className="text-systeme-attenue">Vérifie ta connexion internet, puis réessaie.</p>
          <BoutonSysteme onClick={() => missions.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        </FenetreSysteme>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-1">
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Missions</h1>
        <p className="text-slate-600">Choisis une mission, regarde ce qu&apos;elle rapporte, puis postule.</p>
      </header>

      <FenetreSysteme etiquette="Système" titre="Portails" niveauTitre={2} className="max-w-3xl">
        <p className="text-systeme-attenue">
          Ton rang : <strong className="text-systeme-texte">{progression.actuel.rank}</strong>. {donnees.ouverts} portail{donnees.ouverts > 1 ? "s" : ""}{" "}
          ouvert{donnees.ouverts > 1 ? "s" : ""} à ton rang, {donnees.verrouilles} de rang supérieur.
        </p>
        {progression.suivant && (
          <p className="text-systeme-attenue">
            Il te manque <strong className="text-systeme-or">{formaterXp(progression.manque)}</strong> pour le rang {progression.suivant.rank} et ses
            portails.
          </p>
        )}
        {ponctuellesSeulement && donnees.contratsMasques > 0 && (
          <p className="text-systeme-attenue">Les CDI et les CDD s&apos;ouvrent à partir du rang C. En attendant, les missions ponctuelles te font progresser.</p>
        )}
      </FenetreSysteme>

      <section aria-labelledby="titre-liste" className="grid gap-4">
        <h2 id="titre-liste" className="sr-only">
          Liste des missions
        </h2>

        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4">
          <label htmlFor="recherche-missions" className="text-sm font-bold">
            Rechercher une mission
          </label>
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-slate-400" />
            <input
              id="recherche-missions"
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Métier, entreprise, compétence, ville"
              className="min-h-11 w-full rounded-lg border border-slate-300 py-2 pr-11 pl-10 text-base focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/30 focus:outline-none"
            />
            {recherche && (
              <button
                type="button"
                onClick={() => setRecherche("")}
                aria-label="Effacer la recherche"
                className="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!ponctuellesSeulement &&
              CONTRATS.map((option) => (
                <button
                  key={option.valeur}
                  type="button"
                  aria-pressed={contrat === option.valeur}
                  onClick={() => setContrat(option.valeur)}
                  className={`min-h-11 cursor-pointer rounded-full border px-4 text-sm font-bold transition-colors ${
                    contrat === option.valeur ? "border-[#000080] bg-[#000080] text-white" : "border-slate-300 bg-white text-slate-700 hover:border-[#000080]"
                  }`}
                >
                  {option.libelle}
                </button>
              ))}
            <label htmlFor="seulement-ouverts" className="inline-flex min-h-11 cursor-pointer items-center gap-2 px-1 text-sm">
              <input
                id="seulement-ouverts"
                type="checkbox"
                checked={seulementOuverts}
                onChange={(e) => setSeulementOuverts(e.target.checked)}
                className="size-4 accent-[#000080]"
              />
              Seulement les missions ouvertes à mon rang
            </label>
          </div>
        </div>

        <p className="text-sm text-slate-600" aria-live="polite">
          {affiches.length} mission{affiches.length > 1 ? "s" : ""} affichée{affiches.length > 1 ? "s" : ""}
        </p>

        {affiches.length === 0 ? (
          <div className="grid justify-items-start gap-3 rounded-2xl border border-slate-200 bg-white p-6">
            {donnees.tous.length === 0 ? (
              <p className="text-slate-600">Aucune mission ouverte pour l&apos;instant. Les nouvelles missions apparaîtront ici.</p>
            ) : (
              <>
                <p className="text-slate-600">Aucune mission ne correspond à ces critères.</p>
                <button
                  type="button"
                  onClick={() => {
                    setRecherche("");
                    setContrat("tous");
                    setSeulementOuverts(false);
                  }}
                  className="min-h-11 cursor-pointer rounded-lg border border-[#000080] px-4 font-bold text-[#000080] hover:bg-[#000080] hover:text-white"
                >
                  Effacer les filtres
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {affiches.map((p) => (
              <CartePortail
                key={p.mission.id}
                mission={p.mission}
                etat={p.etat}
                statut={p.statut ? { libelle: p.statut.libelle, ton: p.statut.ton } : null}
                onOuvrir={(bouton) => {
                  setDeclencheur(bouton);
                  setSelection(p.mission.id);
                }}
              />
            ))}
          </div>
        )}
      </section>

      <DetailPortail
        mission={choisi?.mission ?? null}
        etat={choisi?.etat ?? null}
        statut={choisi?.statut ? { libelle: choisi.statut.libelle, ton: choisi.statut.ton } : null}
        actionCandidature={choisi?.statut?.lien && choisi.statut.action ? { lien: choisi.statut.lien, action: choisi.statut.action } : null}
        rangCandidat={progression.actuel.rank}
        declencheur={declencheur}
        onFermer={() => setSelection(null)}
      />
    </div>
  );
}

function SquelettePortails() {
  return (
    <div className="grid gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement des missions">
      <div className="h-10 w-48 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />
      <div className="h-32 max-w-3xl animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}
