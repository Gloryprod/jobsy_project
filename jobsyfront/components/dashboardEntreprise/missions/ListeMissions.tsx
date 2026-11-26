"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { CarteRealite, ErreurSection, LienRealite } from "@/components/dashboardCandidat/qg/CarteRealite";
import { ConfirmationRefus } from "@/components/dashboardCandidat/commun/ConfirmationRefus";
import { normaliser } from "@/components/dashboardCandidat/portails/regles";
import { messageGuilde } from "../guilde/regles";
import { CarteMission, type ActionMission } from "./CarteMission";
import type { MissionGuilde } from "./regles";

type Filtre = "toutes" | "ouvertes" | "desactivees";
type Demande = { action: ActionMission | "groupe"; mission?: MissionGuilde };

const FILTRES: { valeur: Filtre; libelle: string }[] = [
  { valeur: "toutes", libelle: "Toutes" },
  { valeur: "ouvertes", libelle: "Ouvertes" },
  { valeur: "desactivees", libelle: "Désactivées" },
];

/** Les missions publiées (lot 7b) : cartes, recherche, filtre, actions confirmées et résultat annoncé dans la page. */
export function ListeMissions({ cloturees = false }: { cloturees?: boolean }) {
  const cle = ["missions", cloturees ? "cloturees" : "ouvertes"];
  const client = useQueryClient();
  const missions = useQuery<MissionGuilde[]>({
    queryKey: cle,
    queryFn: () => api.get(cloturees ? "/missions/closed" : "/missions").then((r) => r.data.data),
  });
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("toutes");
  const [selection, setSelection] = useState<number[]>([]);
  const [demande, setDemande] = useState<Demande | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<{ texte: string; erreur?: boolean } | null>(null);
  const declencheur = useRef<HTMLElement | null>(null);
  const zoneAnnonce = useRef<HTMLParagraphElement>(null);

  const visibles = useMemo(() => {
    const cherche = normaliser(recherche);
    return (missions.data ?? []).filter((m) => {
      if (filtre === "ouvertes" && !m.active) return false;
      if (filtre === "desactivees" && m.active) return false;
      return !cherche || normaliser(`${m.title} ${m.location} ${m.type_contrat} ${m.category ?? ""}`).includes(cherche);
    });
  }, [missions.data, recherche, filtre]);

  const recharger = () => client.invalidateQueries({ queryKey: ["missions"] });

  const executer = async (d: Demande) => {
    const m = d.mission;
    setEnCours(true);
    setErreur(null);
    try {
      let message = "";
      if (d.action === "groupe") {
        const ids = selection;
        await api.post("/missions/bulk-delete", { ids });
        await recharger();
        // L'API garde sans le dire les missions où un recrutement est engagé
        const restantes = (client.getQueryData<MissionGuilde[]>(cle) ?? []).filter((x) => ids.includes(x.id)).length;
        const supprimees = ids.length - restantes;
        message = `${supprimees} mission${supprimees > 1 ? "s" : ""} supprimée${supprimees > 1 ? "s" : ""}.`;
        if (restantes) message += ` ${restantes} gardée${restantes > 1 ? "s" : ""} : un recrutement y est engagé (offre acceptée ou récompense sous séquestre).`;
        setSelection([]);
      } else if (m && d.action === "supprimer") {
        await api.delete(`/missions/${m.id}`);
        message = `« ${m.title} » a été supprimée.`;
        setSelection((s) => s.filter((id) => id !== m.id));
      } else if (m && d.action === "cloturer") {
        await api.get(`/missions/close/${m.id}`);
        message = `Le recrutement de « ${m.title} » est clôturé. La mission est passée dans les missions clôturées.`;
      } else if (m && d.action === "basculer") {
        await api.get(`/missions/deactivate/${m.id}`);
        message = m.active ? `« ${m.title} » est désactivée : les candidats ne la voient plus.` : `« ${m.title} » est de nouveau visible des candidats.`;
      }
      if (d.action !== "groupe") await recharger();
      setDemande(null);
      setAnnonce({ texte: message });
    } catch (err) {
      const texte = messageGuilde(err, "L'action n'a pas pu aboutir. Réessayez dans quelques instants.");
      // Dans la fenêtre de confirmation ; la réactivation, sans fenêtre, l'annonce dans la page
      setErreur(texte);
      if (d.action === "basculer" && m && !m.active) setAnnonce({ texte, erreur: true });
    } finally {
      setEnCours(false);
    }
  };

  const demander = (action: ActionMission, mission: MissionGuilde, bouton: HTMLButtonElement) => {
    declencheur.current = bouton;
    setErreur(null);
    // Réactiver n'a rien d'irréversible : pas de confirmation
    if (action === "basculer" && !mission.active) {
      void executer({ action, mission });
      return;
    }
    setDemande({ action, mission });
  };

  const textes = (() => {
    const m = demande?.mission;
    if (!demande) return null;
    if (demande.action === "groupe")
      return {
        titre: `Supprimer ${selection.length} mission${selection.length > 1 ? "s" : ""} ?`,
        description: <p>Les missions où un recrutement est engagé seront gardées. La suppression est définitive.</p>,
        confirmer: "Supprimer",
      };
    if (!m) return null;
    const enAttente = (m.applications ?? []).filter((a) => a.status === "pending").length;
    if (demande.action === "supprimer")
      return {
        titre: `Supprimer « ${m.title} » ?`,
        description: <p>La mission et ses candidatures disparaissent. C&apos;est impossible si un recrutement y est engagé. La suppression est définitive.</p>,
        confirmer: "Supprimer",
      };
    if (demande.action === "cloturer")
      return {
        titre: `Clôturer le recrutement de « ${m.title} » ?`,
        description: (
          <p>
            {enAttente > 0
              ? `${enAttente} candidature${enAttente > 1 ? "s" : ""} en attente ser${enAttente > 1 ? "ont" : "a"} refusée${enAttente > 1 ? "s" : ""}, et ${enAttente > 1 ? "les candidats seront prévenus" : "le candidat sera prévenu"}. `
              : "Aucune candidature n'est en attente. "}
            Les candidats déjà recrutés restent suivis dans les missions clôturées.
          </p>
        ),
        confirmer: "Clôturer",
      };
    return {
      titre: `Désactiver « ${m.title} » ?`,
      description: <p>Les candidats ne la verront plus. Les candidatures reçues sont gardées, et vous pourrez la réactiver.</p>,
      confirmer: "Désactiver",
    };
  })();

  const titre = cloturees ? "Missions clôturées" : "Missions ouvertes";

  return (
    <div className="mx-auto grid max-w-6xl gap-5 font-lisible text-slate-900">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <h1 className="font-systeme text-3xl font-bold text-[#000080]">{titre}</h1>
          <p className="text-slate-600">
            {cloturees ? "Le recrutement est terminé : suivez les candidats retenus ou relancez la mission." : "Les missions publiées, actives ou mises en pause."}
          </p>
        </div>
        <LienRealite href="/dashboard/entreprises/missions/create">Publier une mission</LienRealite>
      </div>

      <p
        ref={zoneAnnonce}
        tabIndex={-1}
        role="status"
        className={`rounded-lg border p-3 text-sm empty:hidden focus:outline-none ${annonce?.erreur ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
      >
        {annonce?.texte}
      </p>

      {missions.isLoading ? (
        <p role="status" className="text-slate-600">
          Chargement des missions…
        </p>
      ) : missions.error ? (
        <ErreurSection texte="Les missions n'ont pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => missions.refetch()} />
      ) : (missions.data ?? []).length === 0 ? (
        <CarteRealite titre={cloturees ? "Aucune mission clôturée" : "Aucune mission publiée"}>
          <p className="text-slate-600">
            {cloturees ? "Les missions dont vous clôturez le recrutement apparaîtront ici." : "Publiez votre première mission : les candidats du bon rang pourront y postuler."}
          </p>
        </CarteRealite>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <div className="grid min-w-60 flex-1 gap-1">
              <label htmlFor="recherche-missions" className="text-sm font-semibold">
                Rechercher une mission
              </label>
              <input
                id="recherche-missions"
                type="search"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                className="min-h-11 rounded-lg border border-slate-300 bg-white px-3 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
              />
            </div>
            {!cloturees && (
              <fieldset className="grid gap-1">
                <legend className="text-sm font-semibold">Afficher</legend>
                <div className="flex flex-wrap gap-2">
                  {FILTRES.map((f) => (
                    <label
                      key={f.valeur}
                      className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm has-checked:border-[#000080] has-checked:bg-blue-50 has-checked:font-bold"
                    >
                      <input type="radio" name="filtre-missions" value={f.valeur} checked={filtre === f.valeur} onChange={() => setFiltre(f.valeur)} className="accent-[#000080]" />
                      {f.libelle}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            {selection.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  declencheur.current = e.currentTarget;
                  setErreur(null);
                  setDemande({ action: "groupe" });
                }}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-red-200 bg-white px-3 text-sm font-bold text-red-700 hover:bg-red-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
              >
                Supprimer la sélection ({selection.length})
              </button>
            )}
          </div>

          <p className="text-sm text-slate-600" aria-live="polite">
            {visibles.length} mission{visibles.length > 1 ? "s" : ""} affichée{visibles.length > 1 ? "s" : ""}
            {missions.data && visibles.length !== missions.data.length ? ` sur ${missions.data.length}` : ""}.
          </p>

          {visibles.length === 0 ? (
            <p className="text-slate-600">Aucune mission ne correspond à votre recherche.</p>
          ) : (
            <ul className="grid gap-4 lg:grid-cols-2">
              {visibles.map((m) => (
                <li key={m.id} className="grid">
                  <CarteMission
                    mission={m}
                    enCours={enCours}
                    selectionnee={selection.includes(m.id)}
                    onSelection={(choisie) => setSelection((s) => (choisie ? [...s, m.id] : s.filter((id) => id !== m.id)))}
                    onAction={(action, bouton) => demander(action, m, bouton)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {textes && (
        <ConfirmationRefus
          ouvert={!!demande}
          titre={textes.titre}
          description={textes.description}
          libelleConfirmer={textes.confirmer}
          chargement={enCours}
          erreur={erreur}
          onConfirmer={() => demande && executer(demande)}
          onFermer={() => setDemande(null)}
          cibleFocus={() => (declencheur.current?.isConnected ? declencheur.current : zoneAnnonce.current)}
        />
      )}
    </div>
  );
}
