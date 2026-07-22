"use client";

import React, { useState, use } from "react";
import useSWR from "swr";
import { FileText, Settings, Award, Edit3, Trash2, Plus, AlertCircle, ArrowLeft, Clock, Check } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import FinalProjectForm from "@/components/dashboardAdmin/finalProject/FinalProjectForm";

interface InputSchemaField {
  key: string;
  type: "textarea" | "url" | "file";
  label: string;
  placeholder?: string;
  required: boolean;
}

interface EvaluationCriterion {
  name: string;
  max_points: number;
}

interface ExamProject {
  id: number;
  title: string;
  domain: string;
  context_rich_text: string;
  inputs_schema: InputSchemaField[];
  evaluation_criteria: EvaluationCriterion[];
  passing_score: number;
  time_limit_minutes: number | null;
}

interface ApiResponse {
  status: string;
  project: ExamProject | null;
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export default function ManageExamProject({ params, onBack }: { params: Promise<{ id: string }>; onBack?: () => void }) {
  const { id } = use(params); // Récupération de l'ID du cours
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Clé SWR pour charger le projet d'examen lié à ce cours
  const swrKey = `/exam-projects/course/${id}`;

  // Récupération des données avec SWR
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    id ? swrKey : null,
    fetcher
  );

  const project = data?.project || null;

  // Gestion de la suppression du projet pratique via SweetAlert2
  const handleDeleteProject = async () => {
    if (!project) return;

    const result = await Swal.fire({
      title: "Voulez-vous supprimer ce projet d'examen ?",
      text: "Cette action supprimera également les livrables soumis par les étudiants et est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        await api.delete(`/exam-projects/${id}/${project.id}`);
        toast.success("Le projet d'examen a été supprimé !");
        
        // Rafraîchir SWR localement
        mutate({ status: "success", project: null }, false);
      } catch (err: any) {
        const msg = err.response?.data?.message || "Impossible de supprimer le projet.";
        toast.error(msg);
      } finally {
        setDeleting(false);
      }
    }
  };

  // Callback de réussite pour fermer le formulaire et recharger les données
  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditMode(false);
    mutate(); // Recharge SWR
  };

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-xs font-bold">Erreur lors du chargement du projet d&apos;examen final.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ThreeDots height="60" width="60" color="#000080" visible={true} />
      </div>
    );
  }

  // Si on choisit d'ouvrir le formulaire de création/édition
  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-2">
        <FinalProjectForm
          courseId={id}
          initialData={editMode && project ? project : undefined}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setEditMode(false);
          }}
        />
      </div>
    );
  }

  // Somme totale des critères pour le badge d'en-tête
  const totalMaxPoints = project?.evaluation_criteria?.reduce((sum, c) => sum + (c.max_points || 0), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 animate-fadeIn">
      
      {/* BARRE D'ENTÊTE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-bold uppercase tracking-wider">
            {onBack && (
              <button onClick={onBack} className="hover:text-slate-900 flex items-center gap-1 transition-all cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Retour
              </button>
            )}
            <span>• Gestion Examen Pratique (Expert)</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-slate-950 tracking-tight">
            {project ? project.title : "Configuration de l'examen"}
          </h1>
        </div>

        {project && (
          <div className="bg-slate-100 px-4 py-2 rounded-xl text-center shrink-0">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Barème Total</p>
            <p className="text-lg font-black text-[#000080]">{totalMaxPoints} Pts</p>
          </div>
        )}
      </div>

      {/* COMPORTEMENT SI EXAMEN VIDE */}
      {!project ? (
        <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center flex flex-col items-center space-y-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-black text-slate-800">Aucun projet d&apos;examen enregistré</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Le parcours expert requiert un projet pratique à la place des QCM. Les candidats ne pourront pas être certifiés sur Jobsy tant qu&apos;un cas d&apos;entreprise n&apos;est pas défini.
            </p>
          </div>
          <button
            onClick={() => {
              setEditMode(false);
              setIsFormOpen(true);
            }}
            className="bg-[#000080] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer hover:shadow-lg transition-all"
          >
            Créer le projet pratique
          </button>
        </div>
      ) : (
        /* AFFICHAGE DU PROJET EXISTANT */
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row gap-6 items-start justify-between hover:border-slate-250 transition-all">
            
            <div className="space-y-6 flex-1 min-w-0">
              {/* Badges d'état */}
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Projet Actif
                </span>
                <span className="bg-blue-50 text-[#000080] text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  {project.domain.replace("_", " ")}
                </span>
                <span className="bg-green-50 text-green-700 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  Seuil de réussite: {project.passing_score}%
                </span>
              </div>

              {/* Énoncé / Sujet */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Mise en contexte / Énoncé</h3>
                <div 
                  className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-100"
                  dangerouslySetInnerHTML={{ __html: project.context_rich_text }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formulaire de l'apprenant (Inputs attendus) */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5" /> Réponses à fournir
                  </h3>
                  <div className="space-y-2">
                    {project.inputs_schema?.map((input) => (
                      <div 
                        key={input.key} 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white text-xs font-bold text-slate-600"
                      >
                        <span className="truncate pr-2">{input.label}</span>
                        <span className="shrink-0 text-[9px] uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          {input.type} {input.required && "• requis"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grille de notation d'évaluation */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Grille de notation
                  </h3>
                  <div className="space-y-2">
                    {project.evaluation_criteria?.map((criteria, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white text-xs font-bold text-slate-600"
                      >
                        <span className="truncate pr-2">{criteria.name}</span>
                        <span className="shrink-0 text-[10px] font-black text-[#000080] bg-blue-50 px-2 py-0.5 rounded-md">
                          /{criteria.max_points} Pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Paramètres de temps limite */}
              {project.time_limit_minutes && (
                <div className="flex items-center gap-2 bg-[#000080]/5 p-4 rounded-2xl border border-[#000080]/10 max-w-max">
                  <Clock className="w-4 h-4 text-[#000080]" />
                  <span className="text-xs font-bold text-[#000080]">
                    Limite de temps : {project.time_limit_minutes} minutes ({Math.round(project.time_limit_minutes / 60)}h)
                  </span>
                </div>
              )}
            </div>

            {/* BOUTONS D'ACTION LATÉRAUX */}
            <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4 self-stretch justify-end md:justify-start">
              {/* Vérifier les soumissions */}
              <button
                onClick={() => router.push(`/dashboard/admin/courses/${id}/final_project/${project.id}/submissions`)}
                className="cursor-pointer p-2 text-slate-400 hover:text-[#000080] hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                title="Vérifier les soumissions des candidats"
              >
                <Check className="w-4 h-4" />
              </button>
              
              {/* Éditer */}
              <button
                onClick={() => {
                  setEditMode(true);
                  setIsFormOpen(true);
                }}
                className="cursor-pointer p-2 text-slate-400 hover:text-[#000080] hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200"
                title="Modifier le projet"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              {/* Supprimer */}
              <button
                disabled={deleting}
                onClick={handleDeleteProject}
                className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                title="Supprimer le projet"
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
              
            </div>

          </div>
        </div>
      )}
    </div>
  );
}