"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import useSWR from "swr";
import api from "@/lib/api";
import { formaterDateCourte } from "@/lib/formats";
import { BoutonSysteme, EmblemeRang, FenetreSysteme } from "@/components/systeme";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Alerte } from "@/components/dashboardCandidat/epreuve/Alerte";
import { CLASSES_SAISIE } from "@/components/dashboardCandidat/commun/saisie";
import { messageGuilde } from "../guilde/regles";
import type { CandidatSuggere } from "../candidatures/regles";
import { statutInvitation, verifierInvitation, type ErreursInvitation, type Invitation, type ProfilComplet, type ValeursInvitation } from "./regles";

type Props = {
  candidat: CandidatSuggere;
  missionId: string;
  missionTitre?: string;
  /** Invitation déjà envoyée à ce candidat pour cette mission */
  invitation?: Invitation;
  ouvert: boolean;
  onFermer: () => void;
  cibleFocus: () => HTMLElement | null;
  /** Invitation enregistrée : la liste des invitations est à recharger */
  onInvite: () => void;
};

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="grid gap-1.5">
      <h3 className="font-systeme font-bold text-systeme-texte">{titre}</h3>
      {children}
    </section>
  );
}

const lignes = (...morceaux: (string | null | undefined)[]) => morceaux.filter((m) => m && String(m).trim()).join(", ");

/** Le profil complet d'un candidat suggéré (lot 7c-B), et l'invitation à la mission rédigée dans la même fenêtre. */
export function FenetreProfil({ candidat, missionId, missionTitre, invitation, ouvert, onFermer, cibleFocus, onInvite }: Props) {
  const profil = useSWR<ProfilComplet>(`/candidates/${candidat.id}/full-profile`, (url: string) => api.get(url).then((r) => r.data.candidate));
  const [redaction, setRedaction] = useState(false);
  const [v, setV] = useState<ValeursInvitation>({
    subject: missionTitre ? `Invitation : ${missionTitre}` : "Invitation à une mission",
    content: `Bonjour ${candidat.full_name},\n\nVotre profil correspond à notre mission${missionTitre ? ` « ${missionTitre} »` : ""}. Nous serions heureux de vous y accueillir.\n\nCordialement,`,
  });
  const [erreurs, setErreurs] = useState<ErreursInvitation>({});
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [envoyee, setEnvoyee] = useState(false);
  const resultat = useRef<HTMLParagraphElement>(null);
  // Le formulaire disparaît : le focus va au message qui confirme l'envoi, une fois affiché (après un await, React l'affiche plus tard que la prochaine image)
  useEffect(() => {
    if (envoyee) resultat.current?.focus();
  }, [envoyee]);

  const p = profil.data;
  const rang = candidat.rank;
  const competences = p?.all_skills ?? [];
  const badges = p?.equipped_badges ?? [];
  const certifications = (p?.certificatesInfos ?? []).filter((c, i, toutes) => toutes.findIndex((x) => x.id === c.id) === i);
  const formations = p?.formations ?? [];
  const diplomes = p?.diplomes ?? [];

  const inviter = async (e: FormEvent) => {
    e.preventDefault();
    setErreurEnvoi(null);
    const trouvees = verifierInvitation(v);
    setErreurs(trouvees);
    const premiere = (["subject", "content"] as const).find((c) => trouvees[c]);
    if (premiere) {
      document.getElementById(`invitation-${premiere}`)?.focus();
      return;
    }
    setEnvoi(true);
    try {
      await api.post("/offers/send-proposal-email", { candidat_id: candidat.id, mission_id: Number(missionId), subject: v.subject.trim(), content: v.content.trim() });
      setEnvoyee(true);
      setRedaction(false);
      onInvite();
    } catch (err) {
      setErreurEnvoi(messageGuilde(err, "L'invitation n'a pas pu être envoyée. Réessayez dans quelques instants."));
    } finally {
      setEnvoi(false);
    }
  };

  const champ = (id: keyof ValeursInvitation, libelle: string, saisie: ReactNode) => (
    <div className="grid gap-1.5">
      <label htmlFor={`invitation-${id}`} className="font-semibold text-systeme-texte">
        {libelle}
      </label>
      {saisie}
      {erreurs[id] && (
        <p id={`invitation-${id}-erreur`} className="text-sm font-semibold text-systeme-alerte">
          {erreurs[id]}
        </p>
      )}
    </div>
  );
  const attributs = (id: keyof ValeursInvitation) => ({
    id: `invitation-${id}`,
    value: v[id],
    onChange: (e: { target: { value: string } }) => setV((actuelles) => ({ ...actuelles, [id]: e.target.value })),
    "aria-invalid": erreurs[id] ? true : undefined,
    "aria-describedby": erreurs[id] ? `invitation-${id}-erreur` : undefined,
    required: true,
  });

  return (
    <Dialog open={ouvert} onOpenChange={(estOuvert) => !estOuvert && !envoi && onFermer()}>
      <DialogContent
        showCloseButton={false}
        onCloseAutoFocus={(e) => {
          const cible = cibleFocus();
          if (cible?.isConnected) {
            e.preventDefault();
            cible.focus();
          }
        }}
        className="max-h-[90vh] gap-0 overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-2xl"
      >
        <FenetreSysteme etiquette="Guilde" balayage={false}>
          <div className="flex flex-wrap items-center gap-3">
            {rang ? <EmblemeRang rang={rang.rank} couleur={rang.code_hexa} taille="sm" /> : null}
            <div className="grid min-w-0 flex-1 gap-0.5">
              <DialogTitle className="font-systeme text-xl font-bold break-words text-systeme-texte">{candidat.full_name}</DialogTitle>
              <DialogDescription className="text-systeme-attenue">
                {lignes(rang?.label ?? (rang ? `Rang ${rang.rank}` : null), p?.title ?? candidat.title, `${candidat.match_score} % de correspondance`)}
              </DialogDescription>
            </div>
          </div>

          {profil.isLoading ? (
            <p role="status" className="text-systeme-attenue">
              Chargement du profil…
            </p>
          ) : profil.error || !p ? (
            <div className="grid gap-2">
              <Alerte message="Le profil n'a pas pu se charger. Vérifiez votre connexion, puis réessayez." />
              <BoutonSysteme variante="contour" className="justify-self-start" onClick={() => profil.mutate()}>
                Réessayer
              </BoutonSysteme>
            </div>
          ) : (
            <div className="grid gap-4">
              <Bloc titre="Compétences">
                {competences.length ? (
                  <ul className="flex flex-wrap gap-1.5">
                    {competences.map((c) => (
                      <li key={c} className="rounded-[3px] border border-systeme-lueur/30 px-2 py-0.5 text-sm text-systeme-texte">
                        {c}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-systeme-attenue">Aucune compétence renseignée.</p>
                )}
              </Bloc>
              {badges.length > 0 && (
                <Bloc titre="Badges équipés">
                  <p className="text-systeme-texte">{badges.map((b) => b.name || "Badge").join(", ")}.</p>
                </Bloc>
              )}
              <Bloc titre="Certifications Jobsy">
                {certifications.length ? (
                  <ul className="grid gap-1.5">
                    {certifications.map((c) => (
                      <li key={c.id} className="flex flex-wrap items-baseline gap-x-3 text-systeme-texte">
                        <span className="font-semibold">{c.title || "Formation certifiante"}</span>
                        {c.certificate_hash && (
                          <a
                            href={`/verify/${c.certificate_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center text-sm font-bold text-systeme-lueur underline underline-offset-2"
                          >
                            Vérifier le certificat<span className="sr-only"> {c.title} (nouvel onglet)</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-systeme-attenue">Aucune certification obtenue sur Jobsy pour le moment.</p>
                )}
              </Bloc>
              {formations.length > 0 && (
                <Bloc titre="Autres formations">
                  <ul className="grid gap-1 text-systeme-texte">
                    {formations.map((f) => (
                      <li key={f.id}>{lignes(f.titre, f.organisme)}</li>
                    ))}
                  </ul>
                </Bloc>
              )}
              {diplomes.length > 0 && (
                <Bloc titre="Diplômes">
                  <ul className="grid gap-1 text-systeme-texte">
                    {diplomes.map((d) => (
                      <li key={d.id}>{lignes(d.intitule, d.niveau, d.etablissement, d.pays, d.annee_obtention)}</li>
                    ))}
                  </ul>
                </Bloc>
              )}
            </div>
          )}

          <div className="grid gap-3 border-t border-systeme-lueur/20 pt-4">
            {envoyee ? (
              <p ref={resultat} tabIndex={-1} role="status" className="font-semibold text-systeme-lueur focus:outline-none">
                Invitation envoyée. {candidat.full_name} la voit dans son espace Jobsy et peut l&apos;accepter ou la décliner.
              </p>
            ) : invitation ? (
              <p className="text-systeme-texte">
                Invitation envoyée{formaterDateCourte(invitation.sent_at) ? ` le ${formaterDateCourte(invitation.sent_at)}` : ""} : {statutInvitation(invitation.status).libelle.toLowerCase()}.
              </p>
            ) : redaction ? (
              <form noValidate onSubmit={inviter} className="grid gap-4">
                <h3 className="font-systeme font-bold text-systeme-texte">Inviter à la mission</h3>
                {champ("subject", "Objet", <input type="text" {...attributs("subject")} className={CLASSES_SAISIE} />)}
                {champ("content", "Message", <textarea rows={6} {...attributs("content")} className={`${CLASSES_SAISIE} py-2`} />)}
                <Alerte message={erreurEnvoi} />
                <div className="flex flex-wrap gap-2.5">
                  <BoutonSysteme type="submit" chargement={envoi}>
                    Envoyer l&apos;invitation
                  </BoutonSysteme>
                  <BoutonSysteme variante="contour" disabled={envoi} onClick={() => setRedaction(false)}>
                    Annuler
                  </BoutonSysteme>
                </div>
              </form>
            ) : (
              <p className="text-systeme-attenue">Le candidat recevra votre message dans son espace Jobsy et pourra accepter ou décliner l&apos;invitation.</p>
            )}
            <div className="flex flex-wrap gap-2.5">
              {!redaction && !envoyee && !invitation && (
                <BoutonSysteme
                  onClick={() => {
                    setRedaction(true);
                    requestAnimationFrame(() => document.getElementById("invitation-subject")?.focus());
                  }}
                >
                  Rédiger une invitation
                </BoutonSysteme>
              )}
              <DialogClose asChild>
                <BoutonSysteme variante="contour" disabled={envoi}>
                  Fermer
                </BoutonSysteme>
              </DialogClose>
            </div>
          </div>
        </FenetreSysteme>
      </DialogContent>
    </Dialog>
  );
}
