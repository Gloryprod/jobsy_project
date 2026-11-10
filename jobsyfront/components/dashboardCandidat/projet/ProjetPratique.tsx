"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { messageErreur, statutErreur } from "@/lib/erreurs";
import { safeHttpUrl } from "@/lib/utils";
import { BoutonSysteme, Echeance, FenetreSysteme, LienSysteme, LignesValeurs, useMaintenant, type TonSysteme } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { formaterDuree, lienCarte } from "../donjons/regles";
import type { CarteFormation } from "../donjons/types";
import { CriteresJury } from "./CriteresJury";
import { EpreuveProjet } from "./EpreuveProjet";
import { formaterNote } from "./regles";
import type { ChampProjet, ProjetServi, SessionProjet } from "./types";

const enDate = (valeur: unknown): number | null => {
  const instant = typeof valeur === "string" ? Date.parse(valeur) : NaN;
  return Number.isFinite(instant) ? instant : null;
};

/** Lecture du projet : le décalage entre l'horloge du serveur et celle du téléphone est mesuré à la réception (D28). */
const lireProjet = (url: string): Promise<ProjetServi> =>
  api.get(url).then(({ data }) => {
    const serveur = enDate(data.server_time);
    return {
      project: data.project ?? null,
      session: data.session ?? null,
      grace_minutes: Number(data.grace_minutes) || 0,
      max_attempts: Number(data.max_attempts) || 0,
      fin: enDate(data.ends_at),
      finGrace: enDate(data.grace_ends_at),
      decalage: serveur === null ? 0 : serveur - Date.now(),
    };
  });
const lireDonnees = (url: string) => api.get(url).then((reponse) => reponse.data.data);

const NATURE_LIVRABLE: Record<ChampProjet["type"], string> = { textarea: "un texte", url: "un lien", file: "un fichier" };
const EN_CORRECTION: SessionProjet["status"][] = ["submitted", "under_review"];

type Props = {
  courseId: string;
  courseTitle?: string;
  /** Workspace : nouvelle tentative autorisée maintenant (délai écoulé, tentatives restantes) */
  peutRetenter: boolean;
  bloque: boolean;
  /** Recharge l'espace de formation : il passe au certificat après une réussite */
  onMiseAJour?: () => unknown;
};

/**
 * Le boss d'un donjon Expert : le projet pratique noté sur 20 par un jury.
 * Règles réelles venues de l'API (temps, grâce, seuil, tentatives, délai) et chrono sur l'heure du serveur.
 */
export function ProjetPratique({ courseId, courseTitle, peutRetenter, bloque, onMiseAJour }: Props) {
  const projet = useSWR<ProjetServi>(`/exam-submissions/project/${courseId}`, lireProjet, { revalidateOnFocus: false });
  // Même clé que la carte du donjon : XP, badge et délai après un échec
  const carte = useSWR<CarteFormation>(`/get_modules/${courseId}`, lireDonnees);
  const maintenant = useMaintenant();

  const [action, setAction] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);
  const titreRef = useRef<HTMLHeadingElement>(null);

  const d = projet.data;
  const p = d?.project ?? null;
  const s = d?.session ?? null;
  const vue = projet.isLoading
    ? "chargement"
    : projet.error || !d
      ? "erreur"
      : !p
        ? "absent"
        : !s
          ? "accueil"
          : s.status === "in_progress"
            ? "epreuve"
            : EN_CORRECTION.includes(s.status)
              ? "jury"
              : s.status === "approved"
                ? "reussi"
                : "echec";

  // Focus au titre à chaque changement d'écran (l'épreuve place le sien)
  const premier = useRef(true);
  useEffect(() => {
    if (premier.current) {
      premier.current = false;
      return;
    }
    if (vue !== "epreuve") titreRef.current?.focus();
  }, [vue]);

  const toutRecharger = async () => {
    await projet.mutate();
    await onMiseAJour?.();
  };

  const demarrer = async () => {
    if (!p) return;
    setAction(true);
    setErreur(null);
    try {
      await api.post(`/exam-sessions/start/${p.id}`);
      await projet.mutate();
    } catch (e) {
      const code = statutErreur(e);
      if (code === 400 || code === 409) {
        // Une tentative existe déjà (autre onglet) : on affiche son état
        await toutRecharger();
      } else {
        setErreur(code === 403 ? "Franchis d'abord toutes les salles du donjon : le projet s'ouvre ensuite." : messageErreur(e, "Le projet n'a pas pu démarrer. Réessaie."));
      }
    } finally {
      setAction(false);
    }
  };

  const repasser = async () => {
    if (!s) return;
    setAction(true);
    setErreur(null);
    try {
      await api.post(`/exam-sessions/${s.id}/retry`);
      await toutRecharger();
    } catch (e) {
      const code = statutErreur(e);
      setErreur(
        code === 429
          ? "Le délai avant une nouvelle tentative n'est pas encore écoulé."
          : code === 403
            ? "Tu as utilisé toutes tes tentatives pour ce projet."
            : messageErreur(e, "La nouvelle tentative n'a pas pu démarrer. Réessaie."),
      );
    } finally {
      setAction(false);
    }
  };

  const verifier = async () => {
    setAction(true);
    setAnnonce(null);
    try {
      const frais = await projet.mutate();
      await onMiseAJour?.();
      const statut = frais?.session?.status;
      setAnnonce(statut && EN_CORRECTION.includes(statut) ? "Pas encore corrigée : reviens un peu plus tard." : null);
    } finally {
      setAction(false);
    }
  };

  const titre = (texte: string) => (
    <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl leading-tight font-bold text-balance text-systeme-texte outline-none">
      {texte}
    </h2>
  );

  const serveur = maintenant === null || !d ? null : maintenant + d.decalage;
  const maxTentatives = d?.max_attempts || carte.data?.final_exam.max_attempts || 0;
  const delai = carte.data?.final_exam.retry_delay_hours ?? null;
  const tresor = [
    ...(carte.data?.course.reward_xp ? [{ libelle: "Trésor", valeur: `+${carte.data.course.reward_xp} XP`, ton: "or" as const }] : []),
    ...(carte.data?.course.reward_asset ? [{ libelle: "Badge", valeur: carte.data.course.reward_asset, ton: "or" as const }] : []),
  ];

  let ton: TonSysteme = "info";
  let contenu;
  if (vue === "chargement") {
    contenu = <p className="text-systeme-attenue">Le Système prépare le projet…</p>;
  } else if (vue === "erreur") {
    const reserve = statutErreur(projet.error) === 403;
    contenu = (
      <>
        {titre(reserve ? "Le projet est réservé aux inscrits" : "Le projet n'a pas pu se charger")}
        <p className="text-systeme-attenue">{reserve ? "Inscris-toi à la formation depuis sa carte pour accéder au projet final." : "Vérifie ta connexion internet, puis réessaie."}</p>
        {reserve ? (
          <LienSysteme href={lienCarte(Number(courseId))} className="justify-self-start">
            Voir la carte du donjon
          </LienSysteme>
        ) : (
          <BoutonSysteme onClick={() => projet.mutate()} className="justify-self-start">
            Réessayer
          </BoutonSysteme>
        )}
      </>
    );
  } else if (vue === "absent") {
    contenu = (
      <>
        {titre("Le projet final est en préparation")}
        <p className="text-systeme-attenue">L&apos;équipe Jobsy n&apos;a pas encore publié le sujet de ce projet. Reviens bientôt.</p>
        <LienSysteme href={lienCarte(Number(courseId))} variante="contour" className="justify-self-start">
          Voir la carte du donjon
        </LienSysteme>
      </>
    );
  } else if (vue === "accueil" && p && d) {
    const limite = p.time_limit_minutes;
    contenu = (
      <>
        {titre("Le projet final")}
        <p className="text-systeme-attenue">Tu as franchi toutes les salles. Réalise ce projet : un jury le note sur 20 et décide de ta certification.</p>
        <p className="font-semibold text-systeme-texte">{p.title}</p>
        <LignesValeurs
          lignes={[
            { libelle: "Temps imparti", valeur: formaterDuree(limite) ?? "pas de limite" },
            ...(limite && d.grace_minutes ? [{ libelle: "Grâce", valeur: `+${d.grace_minutes} min pour finir et envoyer` }] : []),
            { libelle: "Pour réussir", valeur: `${p.passing_score} sur 20` },
            ...(maxTentatives ? [{ libelle: "Tentatives", valeur: `${maxTentatives} au plus` }] : []),
            ...(delai ? [{ libelle: "Après un échec", valeur: `nouvelle tentative ${delai} h plus tard`, ton: "alerte" as const }] : []),
            ...tresor,
          ]}
        />
        {p.inputs_schema.length > 0 && (
          <div className="grid gap-2">
            <h3 className="font-semibold text-systeme-texte">À rendre</h3>
            <ul className="grid gap-1 text-systeme-texte">
              {p.inputs_schema.map((champ) => (
                <li key={champ.key}>
                  {champ.label} : {NATURE_LIVRABLE[champ.type] ?? "un livrable"}
                  {champ.required ? "" : " (facultatif)"}
                </li>
              ))}
            </ul>
          </div>
        )}
        <CriteresJury criteres={p.evaluation_criteria} />
        {limite ? (
          <p className="text-systeme-texte">
            Le chrono démarre dès que tu cliques et continue même si tu quittes la page. Prépare tes fichiers et ta connexion avant de commencer. Tes réponses sont
            enregistrées au fur et à mesure.
          </p>
        ) : (
          <p className="text-systeme-texte">Pas de chrono : tes réponses sont enregistrées au fur et à mesure, et tu envoies ta copie quand elle est prête.</p>
        )}
        <Alerte message={erreur} />
        <BoutonSysteme onClick={demarrer} chargement={action} className="justify-self-start">
          {limite ? "Démarrer le chrono" : "Commencer le projet"}
        </BoutonSysteme>
      </>
    );
  } else if (vue === "jury" && p && s) {
    const envoye = enDate(s.submitted_at);
    contenu = (
      <>
        {titre("Ta copie est chez le jury")}
        <p className="text-systeme-attenue">
          {envoye ? `Envoyée le ${new Date(envoye).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}. ` : ""}
          {s.status === "under_review" ? "Le jury est en train de la corriger." : "Elle attend sa correction."} Tu recevras un e-mail dès qu&apos;elle sera notée sur
          20.
        </p>
        <CopieEnvoyee champs={p.inputs_schema} reponses={s.submitted_data} />
        <BoutonSysteme variante="contour" onClick={verifier} chargement={action} className="justify-self-start">
          Vérifier à nouveau
        </BoutonSysteme>
        <p role="status" className={annonce ? "text-sm text-systeme-lueur" : "sr-only"}>
          {annonce}
        </p>
      </>
    );
  } else if (vue === "reussi" && s) {
    ton = "recompense";
    contenu = (
      <>
        {titre(`Boss vaincu : ${formaterNote(s.final_score)} sur 20`)}
        <p className="text-systeme-attenue">Le jury a validé ton projet : ta certification est prête, avec son trésor.</p>
        <RetourJury texte={s.admin_feedback} />
        <BoutonSysteme onClick={() => onMiseAJour?.()} className="justify-self-start">
          Voir mon certificat
        </BoutonSysteme>
      </>
    );
  } else if (vue === "echec" && p && s && d) {
    ton = "alerte";
    const tentative = s.attempts_count || 1;
    const termine = bloque || s.is_blocked || (maxTentatives > 0 && tentative >= maxTentatives);
    const corrige = enDate(s.reviewed_at);
    const finAttente = corrige !== null && delai ? corrige + delai * 3_600_000 : null;
    const attenteEcoulee = finAttente !== null && serveur !== null && serveur >= finAttente;

    let suite;
    if (termine) {
      suite = (
        <>
          <p className="text-systeme-texte">
            Tu as utilisé {maxTentatives > 1 ? `tes ${maxTentatives} tentatives` : "ta tentative"} : ce projet est terminé pour toi. Tu peux toujours revoir les salles,
            ou entrer dans un autre donjon.
          </p>
          <LienSysteme href="/dashboard/candidats/formations" variante="contour" className="justify-self-start">
            Voir les autres donjons
          </LienSysteme>
        </>
      );
    } else if (peutRetenter) {
      const derniere = maxTentatives > 0 && tentative + 1 >= maxTentatives;
      suite = (
        <>
          <p className="text-systeme-texte">
            Tu peux repasser le projet : tentative {tentative + 1}
            {maxTentatives ? ` sur ${maxTentatives}` : ""}
            {derniere ? ", la dernière" : ""}.{p.time_limit_minutes ? " Le chrono démarre dès que tu cliques." : ""}
          </p>
          <Alerte message={erreur} />
          <BoutonSysteme onClick={repasser} chargement={action} className="justify-self-start">
            Démarrer la tentative {tentative + 1}
          </BoutonSysteme>
        </>
      );
    } else {
      suite = (
        <>
          {finAttente !== null && !attenteEcoulee && d ? (
            <p className="font-semibold text-systeme-alerte">
              Prochaine tentative : <Echeance date={new Date(finAttente - d.decalage)} />
            </p>
          ) : (
            <p className="text-systeme-texte">{attenteEcoulee ? "Le délai est écoulé : recharge pour repasser le projet." : "Ta prochaine tentative s'ouvrira après le délai d'attente."}</p>
          )}
          <p className="text-systeme-attenue">Revois les salles en attendant : elles sont juste en dessous.</p>
          {(attenteEcoulee || finAttente === null) && (
            <BoutonSysteme variante="contour" onClick={toutRecharger} className="justify-self-start">
              Recharger
            </BoutonSysteme>
          )}
        </>
      );
    }

    contenu = (
      <>
        {titre(`Note : ${formaterNote(s.final_score)} sur 20`)}
        <p className="text-systeme-attenue">Il fallait {p.passing_score} sur 20 pour vaincre le boss.</p>
        <LignesValeurs lignes={[{ libelle: "Tentative", valeur: maxTentatives ? `${tentative} sur ${maxTentatives}` : String(tentative) }]} />
        <RetourJury texte={s.admin_feedback} />
        {suite}
      </>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-2">
        <Link
          href={lienCarte(Number(courseId))}
          className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Carte du donjon
        </Link>
        <p className="text-sm font-bold text-[#000080]">Le boss du donjon : le projet final</p>
        {courseTitle && <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{courseTitle}</h1>}
      </header>
      {vue === "epreuve" && p && s && d ? (
        <EpreuveProjet
          key={`${s.id}-${s.attempts_count}`}
          projet={p}
          session={s}
          fin={d.fin}
          finGrace={d.finGrace}
          decalage={d.decalage}
          graceMinutes={d.grace_minutes}
          maxTentatives={maxTentatives}
          onFin={toutRecharger}
          onRecaler={() => projet.mutate()}
        />
      ) : (
        <FenetreSysteme etiquette="Boss" ton={ton} balayage={false} className="gap-4">
          {contenu}
        </FenetreSysteme>
      )}
    </div>
  );
}

function RetourJury({ texte }: { texte: string | null | undefined }) {
  if (!texte?.trim()) return null;
  return (
    <figure className="grid gap-1 rounded-[3px] border border-systeme-lueur/30 bg-systeme-lueur/5 p-3">
      <figcaption className="text-sm font-semibold text-systeme-attenue">Retour du jury</figcaption>
      <blockquote className="whitespace-pre-line text-systeme-texte">{texte}</blockquote>
    </figure>
  );
}

/** Rappel de ce qui a été envoyé : un lien ouvre le livrable, un texte est montré en entier. */
function CopieEnvoyee({ champs, reponses }: { champs: ChampProjet[]; reponses: Record<string, string> | null }) {
  const remplis = champs.filter((champ) => reponses?.[champ.key]?.trim());
  if (remplis.length === 0) return null;
  return (
    <div className="grid gap-2">
      <h3 className="font-semibold text-systeme-texte">Ce que tu as envoyé</h3>
      <ul className="grid gap-2">
        {remplis.map((champ) => {
          const valeur = reponses?.[champ.key] ?? "";
          const lien = champ.type === "textarea" ? null : safeHttpUrl(valeur);
          return (
            <li key={champ.key} className="grid gap-0.5 text-systeme-texte">
              <span className="text-sm text-systeme-attenue">{champ.label}</span>
              {lien ? (
                <a href={lien} target="_blank" rel="noreferrer" className="justify-self-start font-semibold break-all text-systeme-lueur underline underline-offset-2">
                  {champ.type === "file" ? "Ouvrir le fichier" : lien}
                </a>
              ) : (
                <span className="whitespace-pre-line">{valeur}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
