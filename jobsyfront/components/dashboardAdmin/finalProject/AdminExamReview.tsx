"use client";

import React, { useState } from "react";
import { CheckCircle2, XCircle, FileText, ExternalLink, Award, MessageSquare } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

interface InputSchemaField {
  key: string;
  type: "textarea" | "url" | "file";
  label: string;
}

interface ExamProject {
  id: number;
  title: string;
  passing_score: number;
  inputs_schema: InputSchemaField[];
}

interface UserExamSession {
  id: number;
  status: "submitted" | "under_review" | "approved" | "failed";
  submitted_data: Record<string, string> | null;
  submitted_at: string;
  final_score: number | null;
  admin_feedback: string | null;
  candidat: {
    user: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
}

interface AdminExamReviewProps {
  project: ExamProject;
  session: UserExamSession;
  onSuccess?: () => void;
}

export default function AdminExamReview({ project, session, onSuccess }: AdminExamReviewProps) {
  const [score, setScore] = useState<number | "">(session.final_score ?? "");
  const [feedback, setFeedback] = useState<string>(session.admin_feedback || "");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score === "") return toast.error("Veuillez saisir une note.");

    setSubmitting(true);
    try {
      await api.post(`/exam-submissions/${session.id}/review`, {
        score: Number(score),
        feedback,
      });

      toast.success("Évaluation enregistrée !");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'évaluation.");
    } finally {
      setSubmitting(false);
    }
  };

  const isPassed = Number(score) >= project.passing_score;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full mx-auto space-y-6">
      {/* Entête candidat */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-900">{session.candidat.user.nom} {session.candidat.user.prenom}</h2>
          <p className="text-xs text-slate-500">{session.candidat.user.email}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-400 block">Soumis le</span>
          <span className="text-xs font-semibold text-slate-700">
            {new Date(session.submitted_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Livrables soumis */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-slate-600" /> Livrables fournis
        </h3>

        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
          {project.inputs_schema.map((field) => {
            const value = session.submitted_data?.[field.key];

            return (
              <div key={field.key} className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {field.label}
                </span>

                {!value ? (
                  <p className="text-xs text-slate-400 italic">Aucune réponse fournie</p>
                ) : field.type === "url" || field.type === "file" ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <span>Ouvrir le lien / fichier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {value}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Formulaire de notation */}
      <form onSubmit={handleSubmitReview} className="space-y-5 border-t border-slate-100 pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Note sur 100 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Award className="w-4 h-4 text-amber-500" /> Note attribuable / 20
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={score}
              onChange={(e) => setScore(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder={`Note de passage : ${project.passing_score}%`}
              required
              className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl focus:border-slate-800 outline-none"
            />
          </div>

          {/* Statut prévisionnel */}
          <div className="flex flex-col justify-end">
            {score !== "" && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                  isPassed
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>
                  {isPassed
                    ? `Validé (>= ${project.passing_score}%)`
                    : `Insuffisant (< ${project.passing_score}%)`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Feedback / Remarques */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <MessageSquare className="w-4 h-4 text-slate-500" /> Remarques / Feedback pour l&apos;étudiant
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Détaillez les points forts et les axes d'amélioration..."
            className="w-full p-3 bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl focus:border-slate-800 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {submitting ? "Enregistrement..." : "Enregistrer l'évaluation"}
        </button>
      </form>
    </div>
  );
}