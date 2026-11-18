"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import api from "@/lib/api";
import { EmblemeRang } from "@/components/systeme";
import { CarteRealite, ErreurSection } from "@/components/dashboardCandidat/qg/CarteRealite";

type Texte = string | null | undefined;

// GET /showProfileCandidat/{id} (Candidat\CandidatController::showProfile) : coordonnées masquées sans lien avec l'entreprise
type Dossier = {
  id: number;
  bio?: Texte;
  ville?: Texte;
  domaine_competence?: Texte;
  niveau_etude?: Texte;
  is_validate?: boolean | number;
  contact_visible?: boolean;
  rank?: { rank: string; label?: Texte; code_hexa?: Texte } | null;
  user?: { nom?: Texte; prenom?: Texte; email?: Texte; telephone?: Texte } | null;
  skills?: { id: number; name: string; category?: { name?: Texte } | null }[];
  cv_datas?: {
    experiences?: { JobTitle?: Texte; Company?: Texte; Duration?: Texte; Description?: Texte }[] | null;
    education?: { Degree?: Texte; Institution?: Texte; Duration?: Texte }[] | null;
    other_certifications?: { CourseName?: Texte; Provider?: Texte; Date?: Texte }[] | null;
  } | null;
};

const lignes = (...morceaux: Texte[]) => morceaux.filter((m) => m && String(m).trim()).join(", ");

function Section({ titre, vide, children }: { titre: string; vide: boolean; children: ReactNode }) {
  return <CarteRealite titre={titre}>{vide ? <p className="text-slate-600">Rien n&apos;est renseigné pour le moment.</p> : children}</CarteRealite>;
}

/** Le dossier d'un candidat vu par l'entreprise (lot 7c-A) : sections affichées selon leur contenu, coordonnées quand elles sont visibles. */
export function DossierCandidat({ candidatId }: { candidatId: string }) {
  const router = useRouter();
  const dossier = useSWR<Dossier>(`/showProfileCandidat/${candidatId}`, (url: string) => api.get(url).then((r) => r.data.data));
  const d = dossier.data;

  const retour = (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex min-h-11 cursor-pointer items-center justify-self-start text-sm font-bold text-[#000080] underline-offset-4 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#000080]"
    >
      ← Retour
    </button>
  );

  if (dossier.isLoading)
    return (
      <div className="mx-auto grid max-w-4xl gap-4 font-lisible">
        {retour}
        <p role="status">Chargement du dossier…</p>
      </div>
    );
  if (dossier.error || !d)
    return (
      <div className="mx-auto grid max-w-4xl gap-4 font-lisible">
        {retour}
        <h1 className="font-systeme text-3xl font-bold text-[#000080]">Dossier du candidat</h1>
        <ErreurSection texte="Le dossier n'a pas pu se charger. Vérifiez votre connexion, puis réessayez." reessayer={() => dossier.mutate()} />
      </div>
    );

  const nom = [d.user?.prenom, d.user?.nom].filter(Boolean).join(" ") || "Candidat";
  const experiences = d.cv_datas?.experiences ?? [];
  const formations = d.cv_datas?.education ?? [];
  const certifications = d.cv_datas?.other_certifications ?? [];
  const competences = d.skills ?? [];

  return (
    <div className="mx-auto grid max-w-4xl gap-5 font-lisible text-slate-900">
      {retour}
      <div className="flex flex-wrap items-center gap-4">
        {d.rank && <EmblemeRang rang={d.rank.rank} couleur={d.rank.code_hexa} />}
        <div className="grid gap-1">
          <h1 className="font-systeme text-3xl font-bold text-[#000080]">{nom}</h1>
          <p className="text-slate-600">
            {lignes(d.rank?.label ?? (d.rank ? `Rang ${d.rank.rank}` : null), d.domaine_competence, d.niveau_etude, d.ville) || "Profil peu renseigné"}
          </p>
          {d.is_validate ? <p className="text-sm font-semibold text-emerald-700">Profil vérifié par l&apos;équipe Jobsy.</p> : null}
        </div>
      </div>

      <CarteRealite titre="Coordonnées">
        {d.contact_visible ? (
          <ul className="grid gap-1">
            {d.user?.email && (
              <li>
                E-mail :{" "}
                <a href={`mailto:${d.user.email}`} className="font-semibold text-[#000080] underline underline-offset-2">
                  {d.user.email}
                </a>
              </li>
            )}
            {d.user?.telephone && (
              <li>
                Téléphone :{" "}
                <a href={`tel:${d.user.telephone.replace(/\s/g, "")}`} className="font-semibold text-[#000080] underline underline-offset-2">
                  {d.user.telephone}
                </a>
              </li>
            )}
            {!d.user?.email && !d.user?.telephone && <li className="text-slate-600">Le candidat n&apos;a pas renseigné ses coordonnées.</li>}
          </ul>
        ) : (
          <p className="text-slate-600">Les coordonnées s&apos;affichent dès que ce candidat postule à l&apos;une de vos missions ou accepte une de vos invitations.</p>
        )}
      </CarteRealite>

      {d.bio && (
        <CarteRealite titre="Présentation">
          <p className="whitespace-pre-line">{d.bio}</p>
        </CarteRealite>
      )}

      <Section titre="Compétences" vide={competences.length === 0}>
        <ul className="flex flex-wrap gap-2">
          {competences.map((s) => (
            <li key={s.id} className="rounded-md bg-slate-100 px-2 py-1 text-sm">
              {s.name}
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Expériences" vide={experiences.length === 0}>
        <ul className="grid gap-3">
          {experiences.map((x, i) => (
            <li key={i} className="grid gap-0.5 border-l-2 border-[#000080]/30 pl-3">
              <p className="font-bold">{x.JobTitle || "Poste non précisé"}</p>
              <p className="text-sm text-slate-600">{lignes(x.Company, x.Duration)}</p>
              {x.Description && <p className="text-sm">{x.Description}</p>}
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Formation" vide={formations.length === 0}>
        <ul className="grid gap-3">
          {formations.map((x, i) => (
            <li key={i} className="grid gap-0.5">
              <p className="font-bold">{x.Degree || "Diplôme non précisé"}</p>
              <p className="text-sm text-slate-600">{lignes(x.Institution, x.Duration)}</p>
            </li>
          ))}
        </ul>
      </Section>

      {certifications.length > 0 && (
        <Section titre="Certifications" vide={false}>
          <ul className="grid gap-3">
            {certifications.map((x, i) => (
              <li key={i} className="grid gap-0.5">
                <p className="font-bold">{x.CourseName || "Certification"}</p>
                <p className="text-sm text-slate-600">{lignes(x.Provider, x.Date)}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
