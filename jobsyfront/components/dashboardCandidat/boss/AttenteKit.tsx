"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import api from "@/lib/api";
import { messageErreur } from "@/lib/erreurs";
import { cn } from "@/lib/utils";
import { BoutonSysteme, FenetreSysteme, LienSysteme } from "@/components/systeme";
import { Alerte } from "../epreuve/Alerte";
import { lienCarte } from "../donjons/regles";

type Props = {
  courseId?: string;
  courseTitle: string;
  enrollmentId: number;
  /** pending : Jobsy n'a pas encore marqué le kit comme livré ; delivered : livré, le candidat confirme la réception */
  deliveryStatus: "pending" | "delivered" | string | null;
  /** Recharge l'espace de formation ; résout quand les données sont à jour */
  onActualiser: () => Promise<unknown>;
};

type EtatEtape = "faite" | "courante" | "a_venir";

function Etape({ numero, titre, detail, etat }: { numero: number; titre: string; detail: string; etat: EtatEtape }) {
  return (
    <li aria-current={etat === "courante" ? "step" : undefined} className="flex gap-3">
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full border-2 font-systeme text-xs font-bold",
          etat === "faite" && "border-systeme-lueur bg-systeme-lueur text-systeme-nuit",
          etat === "courante" && "border-systeme-or text-systeme-or",
          etat === "a_venir" && "border-systeme-attenue/50 text-systeme-attenue",
        )}
      >
        {etat === "faite" ? <Check className="size-4" /> : numero}
      </span>
      <div className="grid gap-0.5 pt-1">
        <p className={cn("font-semibold", etat === "a_venir" ? "text-systeme-attenue" : "text-systeme-texte")}>{titre}</p>
        <p className={cn("text-sm", etat === "courante" ? "text-systeme-or" : "text-systeme-attenue")}>{detail}</p>
      </div>
    </li>
  );
}

/**
 * L'entrée d'un donjon avec kit de matériel : Jobsy prépare et livre le kit, l'administration le marque comme livré,
 * puis le candidat confirme la réception pour ouvrir les salles (CourseWorkspaceController::accesLogisticCourse).
 */
export function AttenteKit({ courseId, courseTitle, enrollmentId, deliveryStatus, onActualiser }: Props) {
  const livre = deliveryStatus === "delivered";
  const [envoi, setEnvoi] = useState<"verifier" | "confirmer" | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [annonce, setAnnonce] = useState<string | null>(null);

  const verifier = async () => {
    setEnvoi("verifier");
    setErreur(null);
    setAnnonce(null);
    try {
      await onActualiser();
      // Si le kit est livré, l'écran change ; sinon on le dit, plutôt que de laisser croire que rien ne s'est passé
      setAnnonce("Vérification faite : le kit est toujours en préparation.");
    } catch (e) {
      setErreur(messageErreur(e, "La vérification n'a pas pu se faire. Réessaie."));
    } finally {
      setEnvoi(null);
    }
  };

  const confirmer = async () => {
    setEnvoi("confirmer");
    setErreur(null);
    try {
      await api.post(`/logistics/access/${enrollmentId}`);
      await onActualiser();
    } catch (e) {
      setErreur(messageErreur(e, "La réception n'a pas pu être confirmée. Réessaie."));
    } finally {
      setEnvoi(null);
    }
  };

  return (
    <div className="mx-auto grid max-w-3xl gap-6 p-2 font-lisible text-slate-900 sm:p-4">
      <header className="grid gap-2">
        {courseId && (
          <Link
            href={lienCarte(Number(courseId))}
            className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold text-[#000080] hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Carte du donjon
          </Link>
        )}
        <p className="text-sm font-bold text-[#000080]">Entrée du donjon</p>
        <h1 className="font-systeme text-2xl leading-tight font-bold text-balance text-[#000080] sm:text-3xl">{courseTitle}</h1>
      </header>

      <FenetreSysteme
        etiquette="Entrée du donjon"
        titre={livre ? "Ton kit est livré" : "Ton kit de matériel est en préparation"}
        niveauTitre={2}
        ton={livre ? "recompense" : "info"}
        className="gap-5"
      >
        <ol className="grid gap-4">
          <Etape numero={1} titre="Inscription" detail="Faite" etat="faite" />
          <Etape
            numero={2}
            titre="Livraison du kit"
            detail={livre ? "Jobsy a marqué ton kit comme livré" : "En préparation : un agent logistique Jobsy te contacte pour la livraison"}
            etat={livre ? "faite" : "courante"}
          />
          <Etape
            numero={3}
            titre="Les salles du donjon"
            detail={livre ? "Confirme la réception du kit pour les ouvrir" : "Elles s'ouvrent une fois le kit reçu"}
            etat={livre ? "courante" : "a_venir"}
          />
        </ol>

        {livre ? (
          <p className="text-systeme-attenue">Tu as bien reçu ton matériel ? Confirme-le pour ouvrir la première salle.</p>
        ) : (
          <div className="grid gap-2 text-systeme-attenue">
            <p>
              Jobsy prépare ton matériel (outils, étiquettes, guide de terrain) et te livre à l&apos;adresse de ton profil. Vérifie que ton numéro de
              téléphone et ta localisation y sont renseignés.
            </p>
            <p>Dès que l&apos;équipe a marqué le kit comme livré, tu pourras confirmer sa réception ici.</p>
          </div>
        )}

        <p role="status" className={annonce ? "text-sm text-systeme-lueur" : "sr-only"}>
          {annonce}
        </p>
        <Alerte message={erreur} />

        <div className="flex flex-wrap gap-2.5">
          {livre ? (
            <BoutonSysteme onClick={confirmer} chargement={envoi === "confirmer"} disabled={envoi !== null}>
              J&apos;ai reçu mon kit
            </BoutonSysteme>
          ) : (
            <>
              <BoutonSysteme onClick={verifier} chargement={envoi === "verifier"} disabled={envoi !== null}>
                Vérifier à nouveau
              </BoutonSysteme>
              <LienSysteme href="/dashboard/candidats/profile" variante="contour">
                Compléter mon profil
              </LienSysteme>
            </>
          )}
        </div>
      </FenetreSysteme>
    </div>
  );
}
