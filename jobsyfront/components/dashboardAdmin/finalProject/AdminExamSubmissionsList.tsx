"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  FileCheck2, 
  User, 
  Calendar 
} from "lucide-react";

export type SubmissionStatus = "submitted" | "under_review" | "approved" | "failed";

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

export interface CandidateSubmission {
  id: number;
  status: SubmissionStatus;
  submitted_at: string;
  final_score: number | null;
  candidat: {
    id: number;
    user: {
      nom: string;
      prenom: string;
      email: string;
    };
  };
  admin_feedback: string | null;
  submitted_data: Record<string, string> | null;
  exam_project: ExamProject;
}

interface AdminExamSubmissionsListProps {
  submissions: CandidateSubmission[];
  onSelectSubmission: (submission: CandidateSubmission) => void;
}

export default function AdminExamSubmissionsList({
  submissions,
  onSelectSubmission,
}: AdminExamSubmissionsListProps) {
  const [selectedTab, setSelectedTab] = useState<"all" | SubmissionStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtrage selon l'onglet et le mot-clé de recherche
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((item) => {
      const matchesTab =
        selectedTab === "all"
          ? true
          : selectedTab === "submitted"
          ? item.status === "submitted" || item.status === "under_review"
          : item.status === selectedTab;

      const matchesSearch =
        item.candidat.user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.candidat.user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.candidat.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.exam_project.title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [submissions, selectedTab, searchQuery]);

  // Compteurs pour les badgets d'onglets
  const counts = useMemo(() => {
    return {
      all: submissions.length,
      pending: submissions.filter((s) => s.status === "submitted" || s.status === "under_review").length,
      approved: submissions.filter((s) => s.status === "approved").length,
      failed: submissions.filter((s) => s.status === "failed").length,
    };
  }, [submissions]);

  return (
    <div className="space-y-6">
      {/* En-tête + Recherche */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <FileCheck2 className="w-6 h-6 text-slate-700" /> Soumissions Projet Final
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gérez et corrigez les projets soumis par les candidats.
          </p>
        </div>
      </div>

      {/* Barre de recherche */}
    <div className="relative w-full sm:w-72 md:w-50">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
        type="text"
        placeholder="Rechercher candidat, projet..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 shadow-sm"
        />
    </div>

      {/* Onglets de filtrage */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSelectedTab("all")}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedTab === "all"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Tous <span>({counts.all})</span>
        </button>

        <button
          onClick={() => setSelectedTab("submitted")}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedTab === "submitted"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-amber-700 hover:bg-amber-50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> En attente <span>({counts.pending})</span>
        </button>

        <button
          onClick={() => setSelectedTab("approved")}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedTab === "approved"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" /> Validés <span>({counts.approved})</span>
        </button>

        <button
          onClick={() => setSelectedTab("failed")}
          className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedTab === "failed"
              ? "bg-rose-600 text-white shadow-sm"
              : "text-rose-700 hover:bg-rose-50"
          }`}
        >
          <XCircle className="w-3.5 h-3.5" /> Refusés <span>({counts.failed})</span>
        </button>
      </div>

      {/* Tableau des soumissions */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                <th className="py-3.5 px-4">Candidat</th>
                <th className="py-3.5 px-4">Projet / Épreuve</th>
                <th className="py-3.5 px-4">Date de soumission</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-center">Note</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    Aucune soumission trouvée.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Candidat */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-600 text-xs">
                          {item.candidat.user.nom.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.candidat.user.nom} {item.candidat.user.prenom}</p>
                          <p className="text-[11px] text-slate-400">{item.candidat.user.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Projet */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {item.exam_project.title}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.submitted_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Badge Statut */}
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>

                    {/* Note */}
                    <td className="py-3.5 px-4 text-center font-black">
                      {item.final_score !== null ? (
                        <span
                          className={
                            item.final_score >= item.exam_project.passing_score
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }
                        >
                          {item.final_score} / 20
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelectSubmission(item)}
                        className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <span>{item.status === "approved" || item.status === "failed" ? "Revoir" : "Corriger"}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

{/* Petit composant utilitaire pour le badge de statut */}
function StatusBadge({ status }: { status: SubmissionStatus }) {
  switch (status) {
    case "submitted":
    case "under_review":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" /> À corriger
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Validé
        </span>
      );
    case "failed":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" /> Refusé
        </span>
      );
    default:
      return null;
  }
}