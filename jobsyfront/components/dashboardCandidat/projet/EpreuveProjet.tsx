"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SafeHtml from "@/components/SafeHtml";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { BoutonSysteme, FenetreSysteme, useMaintenant } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { ConfirmationRefus } from "../commun/ConfirmationRefus";
import { CLASSES_TEXTE_RICHE } from "../commun/texteRiche";
import { ChampLivrable } from "./ChampLivrable";
import { CriteresJury } from "./CriteresJury";
import { aDesReponses, cleBrouillon, ecrireBrouillon, effacerBrouillon, formaterRestant, lireBrouillon, phaseChrono, verifierLivrables } from "./regles";
import type { ProjetExamen, Reponses, SessionProjet } from "./types";

type Props = {
  projet: ProjetExamen;
  session: SessionProjet;
  fin: number | null;
  finGrace: number | null;
  decalage: number;
  graceMinutes: number;
  maxTentatives: number;
  /** Copie envoyée (à la main ou à la fin du temps) : recharge l'état du projet et de la formation */
  onFin: () => Promise<unknown>;
  /** Recharge le projet pour recaler le chrono sur le serveur */
  onRecaler: () => Promise<unknown>;
};

type Enregistrement = { etat: "repos" | "enCours" | "ok" | "echec"; heure?: number; message?: string };

/** Nombre d'envois automatiques tentés d'affilée avant de laisser la main au candidat. */
const ESSAIS_FIN_MAX = 3;
const DELAI_ENREGISTREMENT_MS = 1500;

function reponsesInitiales(projet: ProjetExamen, session: SessionProjet, cle: string): Reponses {
  const vides = Object.fromEntries(projet.inputs_schema.map((champ) => [champ.key, ""]));
  const serveur = session.submitted_data ?? {};
  // Le brouillon de l'API fait foi ; celui du navigateur ne sert que s'il est vide (D29)
  const source = aDesReponses(serveur) ? serveur : (lireBrouillon(cle) ?? {});
  return { ...vides, ...source };
}

/** Le projet en cours : chrono réglé sur l'heure du serveur, énoncé, livrables enregistrés au fil de l'eau, envoi. */
export function EpreuveProjet({ projet, session, fin, finGrace, decalage, graceMinutes, maxTentatives, onFin, onRecaler }: Props) {
  const cle = cleBrouillon(session.id, session.attempts_count);
  const [reponses, setReponses] = useState<Reponses>(() => reponsesInitiales(projet, session, cle));
  const [enregistrement, setEnregistrement] = useState<Enregistrement>({ etat: "repos" });
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreurFin, setErreurFin] = useState<string | null>(null);
  const [relanceFin, setRelanceFin] = useState(0);

  const aEnregistrer = useRef(false);
  const essaisFin = useRef(0);
  const finLancee = useRef(false);
  const boutonEnvoi = useRef<HTMLButtonElement>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const maintenant = useMaintenant();
  const serveur = maintenant === null ? null : maintenant + decalage;
  const phase = serveur === null ? "normal" : phaseChrono(fin, finGrace, serveur);
  const fige = phase === "fini" || envoi;

  useEffect(() => {
    titreRef.current?.focus();
  }, []);

  // Enregistrement automatique, 1,5 s après la dernière frappe
  const enregistrer = useCallback(
    async (valeurs: Reponses) => {
      setEnregistrement({ etat: "enCours" });
      try {
        await api.patch(`/exam-sessions/${session.id}/draft`, { answers: valeurs });
        setEnregistrement({ etat: "ok", heure: Date.now() });
      } catch (e) {
        setEnregistrement({
          etat: "echec",
          message:
            statutErreur(e) === 422
              ? "Le temps est écoulé : ton dernier brouillon enregistré sera envoyé au jury."
              : "Tes dernières modifications ne sont pas enregistrées. Vérifie ta connexion, puis réessaie.",
        });
      }
    },
    [session.id],
  );

  useEffect(() => {
    if (!aEnregistrer.current || fige) return;
    const minuterie = setTimeout(() => {
      aEnregistrer.current = false;
      void enregistrer(reponses);
    }, DELAI_ENREGISTREMENT_MS);
    return () => clearTimeout(minuterie);
  }, [reponses, fige, enregistrer]);

  const modifier = (champ: string, valeur: string) => {
    const suivantes = { ...reponses, [champ]: valeur };
    aEnregistrer.current = true;
    setReponses(suivantes);
    ecrireBrouillon(cle, suivantes);
    if (erreurs[champ]) {
      setErreurs((actuelles) => {
        const restantes = { ...actuelles };
        delete restantes[champ];
        return restantes;
      });
    }
  };

  // Fin de la grâce : le dernier brouillon part au jury, ou la tentative est une copie blanche
  const terminer = useCallback(async () => {
    essaisFin.current += 1;
    try {
      if (aDesReponses(reponses)) {
        await api.post(`/exam-submissions/${projet.id}/auto-submit`, { answers: reponses });
      } else {
        await api.post(`/exam-sessions/${session.id}/mark-failed-empty`);
      }
      effacerBrouillon(cle);
      await onFin();
    } catch (e) {
      if (statutErreur(e) === 422 && essaisFin.current < ESSAIS_FIN_MAX) {
        // Le serveur dit que l'épreuve n'est pas finie (ou plus en cours) : on recale le chrono sur lui
        finLancee.current = false;
        await onRecaler();
        // Si le temps reste écoulé après le recalage, l'envoi est retenté (ESSAIS_FIN_MAX fois au plus)
        setRelanceFin((n) => n + 1);
        return;
      }
      setErreurFin(messageErreur(e, "Ta copie n'a pas pu partir. Réessaie : ton dernier brouillon est enregistré."));
    }
  }, [reponses, projet.id, session.id, cle, onFin, onRecaler]);

  useEffect(() => {
    if (phase !== "fini" || finLancee.current) return;
    finLancee.current = true;
    void terminer();
  }, [phase, terminer, relanceFin]);

  const relancerFin = () => {
    essaisFin.current = 0;
    finLancee.current = false;
    setErreurFin(null);
    setRelanceFin((n) => n + 1);
  };

  const demanderEnvoi = () => {
    const trouvees = verifierLivrables(projet.inputs_schema, reponses);
    setErreurs(trouvees);
    const cles = Object.keys(trouvees);
    if (cles.length > 0) {
      setErreurEnvoi(cles.length > 1 ? `${cles.length} livrables sont à compléter avant l'envoi.` : "Un livrable est à compléter avant l'envoi.");
      document.getElementById(`livrable-${cles[0]}`)?.focus();
      return;
    }
    setErreurEnvoi(null);
    setConfirmation(true);
  };

  const envoyer = async () => {
    aEnregistrer.current = false;
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      await api.post(`/exam-submissions/${projet.id}`, { answers: reponses });
      effacerBrouillon(cle);
      setConfirmation(false);
      await onFin();
    } catch (e) {
      const parChamp = (e as { response?: { data?: { errors?: Record<string, string[]> } } }).response?.data?.errors;
      if (statutErreur(e) === 422 && parChamp) {
        // Refus de l'API champ par champ (answers.lien…) : affichés sous chaque livrable
        setErreurs(Object.fromEntries(Object.entries(parChamp).map(([nom, messages]) => [nom.replace(/^answers\./, ""), messages[0]])));
        setConfirmation(false);
      }
      setErreurEnvoi(messageErreur(e, "Ta copie n'a pas pu partir. Réessaie : tes réponses sont gardées."));
    } finally {
      setEnvoi(false);
    }
  };

  const restant = serveur !== null && fin !== null && finGrace !== null ? (phase === "normal" ? fin : finGrace) - serveur : null;
  const chrono =
    fin === null
      ? projet.time_limit_minutes
        ? null
        : "Pas de limite de temps : envoie ta copie quand elle est prête."
      : restant === null
        ? null
        : phase === "normal"
          ? `Temps restant : ${formaterRestant(restant)}, puis ${graceMinutes} min de grâce.`
          : phase === "grace"
            ? `Grâce : ${formaterRestant(restant)} pour finir et envoyer ta copie.`
            : "Temps écoulé : ta copie part au jury.";
  // Annoncé aux lecteurs d'écran à chaque changement de phase seulement, pas à chaque minute
  const annoncePhase =
    phase === "grace"
      ? `Le temps imparti est écoulé. Tu as encore ${graceMinutes} minutes de grâce pour finir et envoyer ta copie.`
      : phase === "fini"
        ? "Le temps est écoulé. Ta copie part au jury."
        : "";

  return (
    <div className="grid gap-6">
      <FenetreSysteme etiquette="Boss" ton={phase === "normal" ? "info" : "alerte"} balayage={false} className="gap-3">
        <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte outline-none">
          {projet.title}
        </h2>
        <p className="text-sm text-systeme-attenue">
          Tentative {session.attempts_count} sur {maxTentatives}. Le jury note ta copie sur 20 : il faut {projet.passing_score} pour réussir.
        </p>
        {chrono && <p className={`font-semibold ${phase === "normal" ? "text-systeme-texte" : "text-systeme-alerte"}`}>{chrono}</p>}
        {phase === "grace" && (
          <p className="text-sm text-systeme-texte">À la fin de la grâce, ton dernier brouillon enregistré part automatiquement au jury.</p>
        )}
        <p role="status" className="sr-only">
          {annoncePhase}
        </p>
        <EtatEnregistrement enregistrement={enregistrement} onReessayer={() => void enregistrer(reponses)} fige={fige} />
        {phase === "fini" && !erreurFin && <p className="text-sm text-systeme-attenue">Envoi de ta copie…</p>}
        <Alerte message={erreurFin} />
        {erreurFin && (
          <BoutonSysteme onClick={relancerFin} className="justify-self-start">
            Réessayer l&apos;envoi
          </BoutonSysteme>
        )}
      </FenetreSysteme>

      <article className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h3 className="font-systeme text-lg font-bold text-slate-900">L&apos;énoncé</h3>
        {projet.context_rich_text ? (
          <SafeHtml as="div" className={`max-w-prose text-base leading-relaxed text-slate-800 ${CLASSES_TEXTE_RICHE}`} html={projet.context_rich_text} />
        ) : (
          <p className="text-slate-600">L&apos;énoncé de ce projet n&apos;a pas encore été rédigé.</p>
        )}
      </article>

      <CriteresJury criteres={projet.evaluation_criteria} clair />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          demanderEnvoi();
        }}
        className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      >
        <h3 className="font-systeme text-lg font-bold text-slate-900">Tes livrables</h3>
        {projet.inputs_schema.length === 0 && <p className="text-slate-600">Ce projet ne demande aucun livrable : envoie ta copie quand tu es prêt.</p>}
        {projet.inputs_schema.map((champ) => (
          <ChampLivrable
            key={champ.key}
            champ={champ}
            valeur={reponses[champ.key] ?? ""}
            erreur={erreurs[champ.key] ?? null}
            fige={fige}
            onChange={(valeur) => modifier(champ.key, valeur)}
          />
        ))}
        {erreurEnvoi && !confirmation && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {erreurEnvoi}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button
            ref={boutonEnvoi}
            type="submit"
            disabled={fige}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#000080] px-5 font-bold text-white hover:bg-[#000060] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Envoyer ma copie au jury
          </button>
          {chrono && fin !== null && <span className="text-sm text-slate-600">{chrono}</span>}
        </div>
      </form>

      <ConfirmationRefus
        ouvert={confirmation}
        titre="Envoyer ta copie au jury ?"
        description="Une fois envoyée, ta copie ne peut plus être modifiée. Le jury la note sur 20, et tu reçois un e-mail dès la correction."
        libelleConfirmer="Envoyer au jury"
        chargement={envoi}
        erreur={confirmation ? erreurEnvoi : null}
        onConfirmer={() => void envoyer()}
        onFermer={() => setConfirmation(false)}
        cibleFocus={() => boutonEnvoi.current}
      />
    </div>
  );
}

function EtatEnregistrement({ enregistrement, onReessayer, fige }: { enregistrement: Enregistrement; onReessayer: () => void; fige: boolean }) {
  if (enregistrement.etat === "echec") {
    return (
      <div className="grid gap-2">
        <Alerte message={enregistrement.message} />
        {!fige && (
          <BoutonSysteme variante="contour" onClick={onReessayer} className="justify-self-start">
            Réessayer l&apos;enregistrement
          </BoutonSysteme>
        )}
      </div>
    );
  }
  const texte =
    enregistrement.etat === "enCours"
      ? "Enregistrement…"
      : enregistrement.etat === "ok" && enregistrement.heure
        ? `Enregistré à ${new Date(enregistrement.heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ")}.`
        : "Tes réponses sont enregistrées au fur et à mesure.";
  return <p className="text-sm text-systeme-attenue">{texte}</p>;
}
