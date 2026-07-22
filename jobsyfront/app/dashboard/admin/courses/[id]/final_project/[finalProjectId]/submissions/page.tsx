"use client";

import React, { useState } from "react";
import useSWR from "swr";
import AdminExamSubmissionsList, { CandidateSubmission } from "@/components/dashboardAdmin/finalProject/AdminExamSubmissionsList";
import AdminExamReview from "@/components/dashboardAdmin/finalProject/AdminExamReview";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import api from "@/lib/api";
import { use } from "react";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function AdminSubmissionsPage({ params }: { params: Promise<{ id: string; finalProjectId: string }> }) {
  const {id, finalProjectId } = use(params);
  const [selectedSubmission, setSelectedSubmission] = useState<CandidateSubmission | null>(null);

  // Utilisation de SWR pour récupérer les soumissions
  const { data, error, isLoading, mutate } = useSWR<{ submissions: CandidateSubmission[] }>(
    `/exam-submissions/${finalProjectId}`,
    fetcher
  );

  // 1. État de chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <Loader2 className="w-6 h-6 text-slate-700 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Chargement des soumissions...</p>
      </div>
    );
  }

  // 2. Gestion des erreurs
  if (error) {
    return (
      <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold">
        <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
        <span>Impossible de charger les soumissions. Vérifiez votre connexion ou retentez ultérieurement.</span>
      </div>
    );
  }

  const submissions = data?.submissions || [];

  // 3. Vue Détail / Correction (quand un candidat est sélectionné)
  if (selectedSubmission) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => {
            setSelectedSubmission(null);
            mutate(); // Rafraîchit les données en arrière-plan au retour
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à la liste des soumissions
        </button>

        <AdminExamReview
          project={selectedSubmission.exam_project}
          session={selectedSubmission}
          onSuccess={() => {
            setSelectedSubmission(null);
            mutate(); // Revalide le cache SWR immédiatement après la correction
          }}
        />
      </div>
    );
  }

  // 4. Vue Liste globale
  return (
    <AdminExamSubmissionsList
      submissions={submissions}
      onSelectSubmission={(submission) => setSelectedSubmission(submission)}
    />
  );
}