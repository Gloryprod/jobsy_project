"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { HelpCircle, Trash2, CheckCircle2, AlertCircle, ArrowLeft, Edit3 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { ThreeDots } from "react-loader-spinner";
import { use } from "react";  
import { useRouter } from "next/navigation";  
import Link from "next/link";
import Swal from "sweetalert2";

interface Question {
  id: number;
  question_text: string;
  options: string[];
  correct_answers: string[];
  points: number;
}

interface ApiResponse {
  status: string;
  data: {
    course_title: string;
    questions: Question[];
  };
}

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Tu peux passer l'ID de la formation (courseId) depuis la page parente de ton dossier admin
export default function FinalExamQuestionsList({ params, onBack }: { params: Promise<{ id: string }>; onBack?: () => void }) {
  const { id } = use(params);
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Récupération des questions de l'examen final via SWR
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    `/final-exam-questions/${id}`,
    fetcher
  );

  // Gestion de la suppression d'une question
  const handleDeleteQuestion = async (questionId: number) => {
    const result = await Swal.fire({
        title: `Voulez-vous supprimer cette question ?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Oui, supprimer",
        cancelButtonText: "Annuler",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
        setDeletingId(questionId);
        try {
        await api.delete(`/final-exam-questions/${id}/${questionId}`);
        toast.success("Question supprimée avec succès !");
        
        // Rafraîchir la liste instantanément
        if (typeof mutate === "function") {
            mutate();
        }
        } catch (err: any) {
        const msg = err.response?.data?.message || "Impossible de supprimer la question.";
        toast.error(msg);
        } finally {
        setDeletingId(null);
        }
    }
    
  };

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <p className="text-xs font-bold">Erreur lors du chargement des questions de l&apos;examen final.</p>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <ThreeDots height="60" width="60" color="#000080" visible={true} />
      </div>
    );
  }

  const { course_title, questions } = data.data;

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
            <span>• Gestion Examen Final</span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-slate-950 tracking-tight">
            {course_title}
          </h1>
        </div>

        <div className="bg-slate-100 px-4 py-2 rounded-xl text-center shrink-0">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Total Questions</p>
          <p className="text-lg font-black text-[#000080]">{questions.length}</p>
        </div>
      </div>

      <div className="flex justify-end items-end mb-12 mr-2">
        <Link href={`/dashboard/admin/courses/${id}/final_exam/create`}>
            <button className="bg-[#000080] items-center text-white text-md font-medium px-4 py-2 rounded-lg cursor-pointer hover:shadow-lg">Ajouter une nouvelle question</button>
        </Link>
      </div>

      {/* COMPORTEMENT SI EXAMEN VIDE */}
      {questions.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-12 text-center flex flex-col items-center space-y-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div className="max-w-sm">
            <h3 className="text-sm font-black text-slate-800">Aucune question enregistrée</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cet examen global ne contient aucune question pour le moment. Les candidats ne pourront pas obtenir leur certification Jobsy tant qu&apos;aucune question n&apos;est ajoutée.
            </p>
          </div>
          <div>
            <Link href={`/dashboard/admin/courses/${id}/final_exam/create`}>
                <button className="bg-[#000080] items-center text-white text-md font-medium px-4 py-2 rounded-lg cursor-pointer hover:shadow-lg">Ajouter une nouvelle question</button>
            </Link>
          </div>
        </div>
      ) : (
        /* LISTE DES QUESTIONS ENREGISTRÉES */
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xs flex flex-col md:flex-row gap-4 items-start justify-between hover:border-slate-200 transition-all"
            >
              <div className="space-y-4 flex-1 min-w-0">
                
                {/* Numéro de question + Barème */}
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                    Question {index + 1}
                  </span>
                  <span className="bg-blue-50 text-[#000080] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                    {question.points} {question.points > 1 ? 'Points' : 'Point'}
                  </span>
                </div>

                {/* Énoncé de la question */}
                <h3 className="text-sm md:text-base font-black text-slate-800 leading-snug">
                  {question.question_text}
                </h3>

                {/* Options proposées */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.options.map((option, idx) => {
                    // On vérifie si cette option précise est dans la liste des bonnes réponses
                    const isCorrect = question.correct_answers.includes(option);

                    return (
                      <div 
                        key={idx} 
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                          isCorrect 
                            ? "bg-green-50/60 border-green-200 text-green-900" 
                            : "bg-slate-50/50 border-slate-100 text-slate-600"
                        }`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 bg-white shrink-0" />
                        )}
                        <span className="truncate">{option}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Link href={`/dashboard/admin/courses/${id}/final_exam/${question.id}`}>
                <button className="cursor-pointer p-2 text-slate-400 hover:text-green-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 self-end md:self-start" title="Modifier la question">
                  <Edit3 className="w-4 h-4" />
                </button>
              </Link>

              {/* ACTION : SUPPRESSION (ZONE DROITE) */}
              <button
                disabled={deletingId === question.id}
                onClick={() => handleDeleteQuestion(question.id)}
                className="cursor-pointer p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0 self-end md:self-start"
                title="Supprimer la question"
              >
                {deletingId === question.id ? (
                  <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}