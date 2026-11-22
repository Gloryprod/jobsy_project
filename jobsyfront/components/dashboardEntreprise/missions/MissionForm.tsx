"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Editor } from "primereact/editor";
import { toast } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { nommerBarreEditeur } from "@/lib/editeur";
import { champsRefuses, statutErreur } from "@/lib/erreurs";
import { RANGS_PAR_DEFAUT } from "@/lib/progression";
import { useUser } from "@/context/UserProvider";
import { messageGuilde } from "../guilde/regles";
import {
  aujourdhui,
  CONTRATS,
  contratInvisible,
  DIFFICULTES,
  listeCompetences,
  ORDRE_CHAMPS,
  URGENCES,
  verifierMission,
  type ErreursMission,
  type MissionGuilde,
  type ValeursMission,
} from "./regles";

type Props = {
  /** Mission à modifier, ou à relancer avec `reopen` */
  initialData?: MissionGuilde;
  reopen?: boolean;
};

type Filtres = { categories: { id: number; name: string }[]; ranks: { id: number; rank: string; label: string }[] };

const lire = (url: string) => api.get(url).then((r) => r.data.data);

const SAISIE =
  "min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 aria-invalid:border-red-600 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]";

function valeursDepart(mission: MissionGuilde | undefined, relance: boolean, entreprise: string): ValeursMission {
  return {
    title: mission?.title ?? "",
    company: mission?.company || entreprise,
    location: mission?.location ?? "",
    reward: mission ? String(Math.round(Number(mission.reward) || 0)) : "",
    duration: mission?.duration ?? "",
    // Une relance repart d'une date limite passée, que l'API refuserait : on la fait choisir
    deadline: mission && !relance ? (mission.deadline ?? "").slice(0, 10) : "",
    urgency: mission?.urgency ?? "normal",
    type_contrat: mission?.type_contrat ?? "",
    applicants: mission?.applicants ? String(mission.applicants) : "",
    min_rank_required: mission?.min_rank_required ?? "",
    test_severity: mission?.test_severity ?? "",
    category: mission?.category ?? "",
    skills: mission ? listeCompetences(mission.skills).join(", ") : "",
    description: mission?.description ?? "",
  };
}

/** Création, modification et relance d'une mission (lot 7b) : règles de l'API vérifiées avant l'envoi, erreurs sous chaque champ. */
export default function MissionForm({ initialData, reopen = false }: Props) {
  const router = useRouter();
  const client = useQueryClient();
  const { user } = useUser();
  const filtres = useSWR<Filtres>("/getFilterData", lire);
  const relance = !!initialData && reopen;
  const modification = !!initialData && !reopen;
  const [v, setV] = useState<ValeursMission>(() => valeursDepart(initialData, relance, user?.entreprise?.nom_entreprise ?? ""));
  const [erreurs, setErreurs] = useState<ErreursMission>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const changer = (champ: keyof ValeursMission) => (valeur: string) => setV((actuelles) => ({ ...actuelles, [champ]: valeur }));
  // Le nom de l'entreprise arrive parfois après le premier rendu
  if (!initialData && !v.company && user?.entreprise?.nom_entreprise) changer("company")(user.entreprise.nom_entreprise);

  const focaliser = (champ: keyof ValeursMission) => {
    const cible = champ === "description" ? document.querySelector<HTMLElement>("#description-champ .ql-editor") : document.getElementById(champ);
    cible?.focus();
  };

  const envoyer = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    const trouvees = verifierMission(v);
    setErreurs(trouvees);
    const premiere = ORDRE_CHAMPS.find((c) => trouvees[c]);
    if (premiere) {
      focaliser(premiere);
      return;
    }
    const donnees = {
      ...v,
      title: v.title.trim(),
      company: v.company.trim(),
      location: v.location.trim(),
      reward: Number(v.reward),
      duration: v.duration.trim() || null,
      // Colonne non nulle, 0 par défaut : 0 veut dire « nombre de postes non précisé »
      applicants: v.applicants.trim() ? Number(v.applicants) : 0,
      skills: listeCompetences(v.skills),
    };
    setEnvoi(true);
    try {
      if (modification) await api.put(`/missions/${initialData!.id}`, donnees);
      else await api.post("/missions", donnees);
      await client.invalidateQueries({ queryKey: ["missions"] });
      toast.success(modification ? "Mission mise à jour." : relance ? "Mission relancée." : "Mission publiée.");
      router.push("/dashboard/entreprises/missions/list");
    } catch (err) {
      // Les messages de validation de l'API sont en anglais : on désigne les champs refusés
      const refuses =
        statutErreur(err) === 422
          ? champsRefuses(err)
              .map((c) => c.split(".")[0] as keyof ValeursMission)
              .filter((c) => ORDRE_CHAMPS.includes(c))
          : [];
      if (refuses.length) {
        setErreurs(Object.fromEntries(refuses.map((c) => [c, "Le serveur a refusé cette valeur : vérifiez-la."])));
        focaliser(ORDRE_CHAMPS.find((c) => refuses.includes(c))!);
      } else {
        setErreurEnvoi(messageGuilde(err, "La mission n'a pas pu être enregistrée. Réessayez dans quelques instants."));
      }
    } finally {
      setEnvoi(false);
    }
  };

  const rangs = filtres.data?.ranks?.length
    ? filtres.data.ranks
    : [...RANGS_PAR_DEFAUT].reverse().map((r, i) => ({ id: i, rank: r.rank, label: r.label ?? `Rang ${r.rank}` }));
  const urgences = Object.entries(URGENCES).filter(([cle]) => cle !== "premium" || v.urgency === "premium");

  const champ = (
    id: keyof ValeursMission,
    libelle: string,
    controle: (describedBy: string | undefined) => ReactNode,
    options: { aide?: string; facultatif?: boolean } = {},
  ) => {
    const decrit = [options.aide ? `${id}-aide` : null, erreurs[id] ? `${id}-erreur` : null].filter(Boolean).join(" ") || undefined;
    return (
      <div className="grid content-start gap-1.5">
        <label htmlFor={id} className="font-semibold text-slate-900">
          {libelle}
          {options.facultatif ? (
            <span className="font-normal text-slate-600"> (facultatif)</span>
          ) : (
            <span aria-hidden="true" className="text-red-700">
              {" "}
              *
            </span>
          )}
        </label>
        {options.aide && (
          <p id={`${id}-aide`} className="text-sm text-slate-600">
            {options.aide}
          </p>
        )}
        {controle(decrit)}
        {erreurs[id] && (
          <p id={`${id}-erreur`} className="text-sm font-semibold text-red-700">
            {erreurs[id]}
          </p>
        )}
      </div>
    );
  };

  // Fonctions de rendu (pas des composants) : champ() leur passe les identifiants d'aide et d'erreur
  const texte = (id: keyof ValeursMission, autres: Record<string, unknown> = {}) =>
    function saisieTexte(decrit: string | undefined) {
      return (
        <input
          id={id}
          value={v[id]}
          onChange={(e) => changer(id)(e.target.value)}
          aria-invalid={erreurs[id] ? true : undefined}
          aria-describedby={decrit}
          required={!["duration", "applicants"].includes(id)}
          className={SAISIE}
          {...autres}
        />
      );
    };

  const liste = (id: keyof ValeursMission, choix: [string, string][], invite: string) =>
    function saisieListe(decrit: string | undefined) {
      return (
        <select
          id={id}
          value={v[id]}
          onChange={(e) => changer(id)(e.target.value)}
          aria-invalid={erreurs[id] ? true : undefined}
          aria-describedby={decrit}
          required
          className={SAISIE}
        >
          <option value="">{invite}</option>
          {choix.map(([valeur, libelle]) => (
            <option key={valeur} value={valeur}>
              {libelle}
            </option>
          ))}
        </select>
      );
    };

  const demain = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return aujourdhui(d);
  })();

  return (
    <form noValidate onSubmit={envoyer} className="grid gap-5 font-lisible">
      <p className="text-sm text-slate-600">
        Les champs marqués d&apos;un <span className="text-red-700">*</span> sont obligatoires.
      </p>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 font-systeme text-lg font-bold text-[#000080]">La mission</legend>
        {champ("title", "Titre de la mission", texte("title", { placeholder: "Par exemple : vente en boutique" }))}
        {champ("company", "Entreprise affichée", texte("company", { autoComplete: "organization" }))}
        {champ("location", "Lieu", texte("location", { placeholder: "Par exemple : Cotonou, Fidjrossè" }))}
        {champ("duration", "Durée", texte("duration"), { aide: "Par exemple : 1 jour, 2 semaines.", facultatif: true })}
        {champ(
          "category",
          "Domaine d'activité",
          liste(
            "category",
            (filtres.data?.categories ?? []).map((c) => [c.name, c.name]),
            "Choisir un domaine",
          ),
          {
            aide: filtres.error ? "La liste des domaines n'a pas pu se charger : rechargez la page." : undefined,
          },
        )}
        {champ("skills", "Compétences attendues", texte("skills"), { aide: "Séparées par des virgules. Par exemple : vente, accueil, caisse." })}
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-3">
        <legend className="mb-2 font-systeme text-lg font-bold text-[#000080]">Récompense et calendrier</legend>
        {champ("reward", "Récompense en FCFA", texte("reward", { inputMode: "numeric" }), {
          aide: "Mise sous séquestre au recrutement, versée à la validation.",
        })}
        {champ("deadline", "Date limite de candidature", texte("deadline", { type: "date", min: demain }), {
          aide: relance ? "Choisissez la nouvelle date limite de cette relance." : "À partir de demain.",
        })}
        {champ("urgency", "Urgence", liste("urgency", urgences, "Choisir l'urgence"))}
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-2 font-systeme text-lg font-bold text-[#000080]">Le recrutement</legend>
        {champ(
          "type_contrat",
          "Type de contrat",
          liste(
            "type_contrat",
            CONTRATS.map((c) => [c, c]),
            "Choisir le type de contrat",
          ),
        )}
        {champ("applicants", "Nombre de postes", texte("applicants", { inputMode: "numeric" }), { facultatif: true })}
        {champ(
          "min_rank_required",
          "Rang minimum du candidat",
          liste(
            "min_rank_required",
            rangs.map((r) => [r.rank, r.label]),
            "Choisir un rang",
          ),
          {
            aide: "Seuls les candidats de ce rang ou au-dessus peuvent postuler.",
          },
        )}
        {champ("test_severity", "Difficulté de l'épreuve d'entrée", liste("test_severity", Object.entries(DIFFICULTES), "Choisir une difficulté"))}
        {contratInvisible(v.type_contrat, v.min_rank_required) && (
          <p role="note" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 md:col-span-2">
            Les rangs E et D ne voient que les missions ponctuelles : ce {v.type_contrat} ne sera proposé qu&apos;aux candidats de rang C et au-dessus.
          </p>
        )}
      </fieldset>

      <div className="grid gap-1.5" id="description-champ">
        <p id="description-libelle" className="font-semibold text-slate-900">
          Description détaillée
          <span aria-hidden="true" className="text-red-700">
            {" "}
            *
          </span>
        </p>
        <p id="description-aide" className="text-sm text-slate-600">
          Les tâches, le cadre et ce que le candidat doit apporter. 10 caractères au moins.
        </p>
        <Editor
          value={v.description}
          onTextChange={(e) => changer("description")(e.htmlValue ?? "")}
          onLoad={(quill) => {
            const zone = quill?.root as HTMLElement | undefined;
            zone?.setAttribute("role", "textbox");
            zone?.setAttribute("aria-multiline", "true");
            zone?.setAttribute("aria-labelledby", "description-libelle");
            zone?.setAttribute("aria-describedby", "description-aide description-erreur");
            nommerBarreEditeur(quill);
          }}
          style={{ height: "260px" }}
        />
        {erreurs.description && (
          <p id="description-erreur" className="text-sm font-semibold text-red-700">
            {erreurs.description}
          </p>
        )}
      </div>

      {erreurEnvoi && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {erreurEnvoi}
        </p>
      )}

      <button
        type="submit"
        disabled={envoi}
        aria-busy={envoi || undefined}
        className="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-lg bg-[#000080] px-5 font-bold text-white hover:bg-[#000080]/85 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
      >
        {envoi ? "Enregistrement…" : modification ? "Enregistrer les modifications" : relance ? "Relancer la mission" : "Publier la mission"}
      </button>
    </form>
  );
}
