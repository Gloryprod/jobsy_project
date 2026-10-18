"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { BarreProgression, BoutonSysteme } from "@/components/systeme";
import { Alerte } from "./Alerte";
import { LONGUEUR_MAX_TECHNIQUE, type QuestionEpreuve, type Reponses } from "./types";

type Props = {
  questions: QuestionEpreuve[];
  reponses: Reponses;
  onChange: (id: number, texte: string) => void;
  onEnvoyer: () => void;
  envoi: string | null;
  erreur: string | null;
  /** Mission ponctuelle : la candidature est déjà reçue, ces questions affinent la note */
  recueDeja: boolean;
  libelleEnvoi: string;
  titreRef: Ref<HTMLHeadingElement>;
};

/** Questions techniques, une à la fois. Rien n'est envoyé avant la dernière : on peut revenir en arrière. */
export function QuestionsTechniques({ questions, reponses, onChange, onEnvoyer, envoi, erreur, recueDeja, libelleEnvoi, titreRef }: Props) {
  const [index, setIndex] = useState(0);
  const champRef = useRef<HTMLTextAreaElement>(null);
  const premierAffichage = useRef(true);

  // Au changement de question, le curseur va dans la réponse (au premier affichage, le focus reste sur le titre)
  useEffect(() => {
    if (premierAffichage.current) {
      premierAffichage.current = false;
      return;
    }
    champRef.current?.focus();
  }, [index]);

  const question = questions[index];
  const derniere = index === questions.length - 1;
  const remplie = (id: number) => (reponses[id] ?? "").trim().length > 0;
  const toutesRemplies = questions.every((q) => remplie(q.id));
  const champ = `technique-${question.id}`;
  const longueur = (reponses[question.id] ?? "").length;

  return (
    <div className="grid gap-5">
      <div className="grid gap-1">
        <h2 ref={titreRef} tabIndex={-1} className="font-systeme text-xl font-bold text-systeme-texte focus:outline-none">
          Questions techniques
        </h2>
        <p className="text-sm text-systeme-attenue">
          {recueDeja
            ? "Ta candidature est déjà reçue. Ces questions affinent ta note : réponds avec précision."
            : "Dernière étape : ta candidature est envoyée après la dernière question."}
        </p>
      </div>

      <BarreProgression
        libelle="Questions techniques"
        valeur={index + 1}
        min={0}
        max={questions.length}
        detail={`Question ${index + 1} sur ${questions.length}`}
      />

      <div className="grid gap-2">
        <label htmlFor={champ} className="font-bold text-systeme-texte">
          {question.label}
        </label>
        {question.context_hint && (
          <p id={`${champ}-conseil`} className="text-sm text-systeme-attenue">
            <span className="font-semibold text-systeme-or">Indice : </span>
            {question.context_hint}
          </p>
        )}
        <textarea
          ref={champRef}
          id={champ}
          rows={3}
          maxLength={LONGUEUR_MAX_TECHNIQUE}
          readOnly={!!envoi}
          value={reponses[question.id] ?? ""}
          onChange={(e) => onChange(question.id, e.target.value)}
          aria-describedby={`${question.context_hint ? `${champ}-conseil ` : ""}${champ}-compteur`}
          className="w-full rounded-[3px] border border-systeme-lueur/40 bg-white p-3 text-base text-slate-900 focus:border-systeme-lueur focus:ring-2 focus:ring-systeme-lueur/40 focus:outline-none read-only:opacity-70"
        />
        <p id={`${champ}-compteur`} className="text-xs text-systeme-attenue tabular-nums">
          {longueur} / {LONGUEUR_MAX_TECHNIQUE} caractères
        </p>
      </div>

      <Alerte message={erreur} />
      {envoi && (
        <p className="text-sm text-systeme-lueur" aria-live="polite">
          {envoi}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {index > 0 && (
          <BoutonSysteme variante="contour" onClick={() => setIndex((i) => i - 1)} disabled={!!envoi}>
            Question précédente
          </BoutonSysteme>
        )}
        {derniere ? (
          <BoutonSysteme onClick={onEnvoyer} disabled={!toutesRemplies} chargement={!!envoi}>
            {libelleEnvoi}
          </BoutonSysteme>
        ) : (
          <BoutonSysteme onClick={() => setIndex((i) => i + 1)} disabled={!remplie(question.id)}>
            Question suivante
          </BoutonSysteme>
        )}
      </div>
      {derniere && !toutesRemplies && (
        <p className="text-sm text-systeme-attenue">Réponds à toutes les questions avant d&apos;envoyer : reviens en arrière si une réponse manque.</p>
      )}
    </div>
  );
}
