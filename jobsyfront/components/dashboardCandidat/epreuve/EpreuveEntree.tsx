"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { useUser } from "@/context/UserProvider";
import { BoutonSysteme, FenetreSysteme, LienSysteme, useMaintenant } from "@/components/systeme";
import { statutCandidature } from "../qg/JournalQuetes";
import { missionOuverte } from "../qg/quetes";
import type { Candidature } from "../qg/types";
import { etatPortail } from "../portails/regles";
import { AccueilEpreuve, type Parcours } from "./AccueilEpreuve";
import { EtapesEpreuve, type EtapeAffichee } from "./EtapesEpreuve";
import { FinEpreuve } from "./FinEpreuve";
import { QuestionsMotivation } from "./QuestionsMotivation";
import { QuestionsTechniques } from "./QuestionsTechniques";
import { ecrireBrouillon, effacerBrouillons, lireBrouillon, stockageDisponible } from "./brouillon";
import type { MissionEpreuve, Phase, QuestionEpreuve, Reponses } from "./types";

const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

/** Mêmes rangs que l'API (CandidatureController::submit_step_one) : la candidature s'envoie dès la motivation. */
const RANGS_SANS_ETAPE_TECHNIQUE = ["E", "D"];

function questionsValides(valeur: unknown): QuestionEpreuve[] {
  if (!Array.isArray(valeur)) return [];
  return valeur.filter(
    (q): q is QuestionEpreuve =>
      typeof q === "object" && q !== null && typeof (q as QuestionEpreuve).id === "number" && typeof (q as QuestionEpreuve).label === "string",
  );
}

/**
 * L'épreuve d'entrée d'un portail (la candidature). Les étapes suivent la réponse réelle de l'API :
 * motivation seule aux rangs E et D, puis questions techniques au-delà.
 */
export function EpreuveEntree({ missionId }: { missionId: string }) {
  const { user, loading: chargementUtilisateur } = useUser();
  const candidatId: number | undefined = user?.candidat?.id;
  const rang = String(user?.candidat?.rank?.rank ?? "E").toUpperCase();
  const score = Number(user?.candidat?.score) || 0;
  const maintenant = useMaintenant();

  const mission = useSWR<MissionEpreuve>(`/show/${missionId}`, lireDonnees);
  const candidatures = useSWR<Candidature[]>(candidatId ? `/missions/${candidatId}/myapplications` : null, lireDonnees);

  const [phase, setPhase] = useState<Phase>("accueil");
  const [candidatureId, setCandidatureId] = useState<number | null>(null);
  const [questionsMotivation, setQuestionsMotivation] = useState<QuestionEpreuve[]>([]);
  const [questionsTechniques, setQuestionsTechniques] = useState<QuestionEpreuve[]>([]);
  const [reponsesMotivation, setReponsesMotivation] = useState<Reponses>({});
  const [reponsesTechniques, setReponsesTechniques] = useState<Reponses>({});
  const [envoi, setEnvoi] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  // Le contenu n'est rendu qu'une fois les données chargées dans le navigateur : pas d'écart avec le rendu serveur
  const [stockage] = useState(() => typeof window !== "undefined" && stockageDisponible());

  // Le focus va au titre de chaque nouvelle étape, pour le clavier et les lecteurs d'écran
  const titreRef = useRef<HTMLHeadingElement>(null);
  const premierePhase = useRef(true);
  useEffect(() => {
    if (premierePhase.current) {
      premierePhase.current = false;
      return;
    }
    titreRef.current?.focus();
  }, [phase]);

  const m = mission.data;
  const parcours: Parcours = RANGS_SANS_ETAPE_TECHNIQUE.includes(rang) ? "court" : m?.type_contrat === "Mission Ponctuelle" ? "ponctuelle" : "complet";
  const avecTechnique = parcours !== "court" || phase === "technique";
  const etapes: EtapeAffichee[] = [
    { cle: "motivation", libelle: "Motivation" },
    ...(avecTechnique ? [{ cle: "technique", libelle: "Questions techniques" }] : []),
    { cle: "fin", libelle: "Candidature envoyée" },
  ];

  const commencer = async () => {
    if (!candidatId || !m) return;
    setErreur(null);
    setEnvoi("Le Système prépare tes questions…");
    try {
      const reponse = await api.post(`/start_application/${candidatId}/${m.id}`);
      const id = Number(reponse.data?.data?.application?.id);
      const questions = questionsValides(reponse.data?.data?.questions);
      if (!id || questions.length === 0) {
        setErreur("Le Système n'a pas reçu de questions. Réessaie dans un instant.");
        return;
      }
      setCandidatureId(id);
      setQuestionsMotivation(questions);
      setReponsesMotivation(lireBrouillon(id, "motivation", questions));
      setPhase("motivation");
    } catch (e) {
      setErreur(messageErreur(e, "L'épreuve n'a pas pu démarrer. Réessaie dans un instant."));
    } finally {
      setEnvoi(null);
    }
  };

  const changerMotivation = (id: number, texte: string) => {
    const apres = { ...reponsesMotivation, [id]: texte };
    setReponsesMotivation(apres);
    if (candidatureId) ecrireBrouillon(candidatureId, "motivation", questionsMotivation, apres);
  };

  const changerTechnique = (id: number, texte: string) => {
    const apres = { ...reponsesTechniques, [id]: texte };
    setReponsesTechniques(apres);
    if (candidatureId) ecrireBrouillon(candidatureId, "technique", questionsTechniques, apres);
  };

  const terminer = () => {
    if (candidatureId) effacerBrouillons(candidatureId);
    setPhase("fin");
    // Le QG et la liste des missions affichent aussitôt le nouveau statut
    void candidatures.mutate();
  };

  const envoyerMotivation = async () => {
    if (!candidatureId) return;
    setErreur(null);
    setEnvoi(parcours === "court" ? "Envoi de ta candidature…" : "Envoi de tes réponses. Le Système prépare tes questions techniques…");
    try {
      const reponse = await api.post(`/applications/${candidatureId}/submit-step-one`, { responses: reponsesMotivation });
      const suivantes = questionsValides(reponse.data?.data?.next_questions);
      if (suivantes.length === 0) {
        terminer();
        return;
      }
      // Mission ponctuelle : la candidature est déjà reçue, il n'y aura pas de reprise de la motivation
      if (parcours === "ponctuelle") effacerBrouillons(candidatureId);
      setQuestionsTechniques(suivantes);
      setReponsesTechniques(lireBrouillon(candidatureId, "technique", suivantes));
      setPhase("technique");
    } catch (e) {
      setErreur(messageErreur(e, "Tes réponses n'ont pas pu être envoyées. Réessaie."));
    } finally {
      setEnvoi(null);
    }
  };

  const envoyerTechnique = async () => {
    if (!candidatureId) return;
    setErreur(null);
    setEnvoi(parcours === "ponctuelle" ? "Envoi de tes réponses techniques…" : "Envoi de ta candidature…");
    try {
      await api.post(`/applications/${candidatureId}/finalize`, { responses: reponsesTechniques });
      terminer();
    } catch (e) {
      setErreur(messageErreur(e, "Tes réponses n'ont pas pu être envoyées. Réessaie."));
    } finally {
      setEnvoi(null);
    }
  };

  if (chargementUtilisateur || mission.isLoading || (candidatId && candidatures.isLoading)) return <SqueletteEpreuve />;

  if (mission.error || !m) {
    const introuvable = (mission.error as { response?: { status?: number } } | undefined)?.response?.status === 404;
    return (
      <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible sm:p-4">
        <FenetreSysteme
          etiquette="Système"
          titre={introuvable ? "Mission introuvable" : "La mission n'a pas pu se charger"}
          ton="alerte"
          balayage={false}
        >
          <p className="text-systeme-attenue">
            {introuvable ? "Cette mission n'existe pas ou n'est plus disponible." : "Vérifie ta connexion internet, puis réessaie."}
          </p>
          {introuvable ? (
            <LienSysteme href="/dashboard/candidats/missions" className="justify-self-start">
              Voir les missions
            </LienSysteme>
          ) : (
            <BoutonSysteme onClick={() => mission.mutate()} className="justify-self-start">
              Réessayer
            </BoutonSysteme>
          )}
        </FenetreSysteme>
      </div>
    );
  }

  const etat = etatPortail(m, rang, score);
  const ouverte = maintenant === null || missionOuverte(m, maintenant);
  const fermee = !m.active || !!m.closed_at;
  const existante = candidatures.data?.find((c) => c.mission?.id === m.id) ?? null;
  const statutExistant =
    existante && existante.status !== "draft" && maintenant !== null ? statutCandidature(existante, maintenant) : null;

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <Link
        href="/dashboard/candidats/missions"
        className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Retour aux missions
      </Link>

      <header className="grid gap-1">
        <h1 className="font-systeme text-3xl leading-tight font-bold text-balance text-[#000080]">
          <span className="sr-only">Candidature : </span>
          {m.title}
        </h1>
        <p className="text-slate-600">{[m.entreprise?.nom_entreprise || m.company, m.location].filter(Boolean).join(", ")}</p>
      </header>

      <FenetreSysteme etiquette="Épreuve d'entrée" ton={phase === "fin" ? "recompense" : "info"} className="gap-5">
        <EtapesEpreuve etapes={etapes} courante={phase === "accueil" ? null : phase} />

        {phase === "accueil" && (
          <AccueilEpreuve
            mission={m}
            etat={etat}
            rangCandidat={rang}
            parcours={parcours}
            statutExistant={statutExistant}
            reprise={existante?.status === "draft"}
            ouverte={ouverte}
            fermee={fermee}
            stockage={stockage}
            chargement={!!envoi}
            erreur={erreur}
            onCommencer={commencer}
            titreRef={titreRef}
          />
        )}

        {phase === "motivation" && (
          <QuestionsMotivation
            questions={questionsMotivation}
            reponses={reponsesMotivation}
            onChange={changerMotivation}
            onEnvoyer={envoyerMotivation}
            envoi={envoi}
            erreur={erreur}
            libelleEnvoi={parcours === "complet" ? "Passer aux questions techniques" : "Envoyer ma candidature"}
            titreRef={titreRef}
          />
        )}

        {phase === "technique" && questionsTechniques.length > 0 && (
          <QuestionsTechniques
            questions={questionsTechniques}
            reponses={reponsesTechniques}
            onChange={changerTechnique}
            onEnvoyer={envoyerTechnique}
            envoi={envoi}
            erreur={erreur}
            recueDeja={parcours === "ponctuelle"}
            libelleEnvoi={parcours === "ponctuelle" ? "Envoyer mes réponses techniques" : "Envoyer ma candidature"}
            titreRef={titreRef}
          />
        )}

        {phase === "fin" && <FinEpreuve mission={m} titreRef={titreRef} />}
      </FenetreSysteme>
    </div>
  );
}

function SqueletteEpreuve() {
  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 sm:p-4" aria-busy="true" aria-label="Chargement de la candidature">
      <div className="h-6 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="h-80 animate-pulse rounded-[4px] bg-systeme-panneau motion-reduce:animate-none" />
    </div>
  );
}
